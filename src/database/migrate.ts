import { promises as fs } from 'fs';
import * as path from 'path';
import { Kysely, sql } from 'kysely';
import { Database } from './schema';
import { logger } from '@/utils';

/**
 * Runs all SQL migration files in the migrations directory.
 * @param {Kysely<Database>} db - Database instance
 */
export async function runMigrations(db: Kysely<Database>): Promise<void> {
  const migrationsDir = path.join(
    process.cwd(),
    'src',
    'database',
    'migrations',
  );

  try {
    logger.info('🔄 | Checking database migrations...');

    // Ensure migrations table exists
    await sql`
      CREATE TABLE IF NOT EXISTS _migrations (
        name TEXT PRIMARY KEY,
        executed_at INTEGER DEFAULT (strftime('%s', 'now'))
      )
    `.execute(db);

    // Get already executed migrations
    const executedMigrations = await sql<{ name: string }>`
      SELECT name FROM _migrations
    `.execute(db);

    const executedNames = new Set(executedMigrations.rows.map((r) => r.name));

    // Read all .sql files from migrations directory
    const files = await fs.readdir(migrationsDir);
    const sqlFiles = files.filter((file) => file.endsWith('.sql')).sort();

    const pendingFiles = sqlFiles.filter((file) => !executedNames.has(file));

    if (pendingFiles.length === 0) {
      logger.info('✅ | Database is up to date');
      return;
    }

    logger.info(`📦 | Found ${pendingFiles.length} pending migration(s)`);

    for (const file of pendingFiles) {
      const filePath = path.join(migrationsDir, file);
      const sqlContent = await fs.readFile(filePath, 'utf-8');

      logger.info(`📝 | Running migration: ${file}`);

      // Split by semicolons and execute each statement
      const statements = sqlContent
        .split(';')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      // Execute in a transaction if possible, or just sequentially
      await db.transaction().execute(async (trx) => {
        for (const statement of statements) {
          await sql.raw(statement).execute(trx);
        }

        // Record migration
        await sql`
          INSERT INTO _migrations (name) VALUES (${file})
        `.execute(trx);
      });

      logger.info(`✅ | Migration ${file} completed`);
    }

    logger.info('🎉 | All migrations completed successfully');
  } catch (error) {
    logger.error('❌ | Migration failed:', error);
    throw error;
  }
}
