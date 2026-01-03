import { Kysely, SqliteDialect } from 'kysely';
import SqliteDatabase from 'better-sqlite3';
import { Database } from './schema';
import { env } from '@/utils';
import { logger } from '@/utils';

/**
 * Creates and configures a Kysely database instance.
 * @returns {Kysely<Database>} Configured Kysely instance
 */
export function createDatabase(): Kysely<Database> {
  const databasePath = env.DATABASE.replace(/^file:/, '');

  logger.info(`📁 | Connecting to database at: ${databasePath}`);

  const dialect = new SqliteDialect({
    database: new SqliteDatabase(databasePath),
  });

  const db = new Kysely<Database>({
    dialect,
    log(event) {
      if (event.level === 'query') {
        logger.debug(`SQL: ${event.query.sql}`);
        logger.debug(`Parameters: ${JSON.stringify(event.query.parameters)}`);
      } else if (event.level === 'error') {
        logger.error(`Database error: ${event.error}`);
      }
    },
  });

  logger.info('✅ | Database connection established');

  return db;
}

/**
 * Closes the database connection gracefully.
 * @param {Kysely<Database>} db - Database instance to close
 */
export async function closeDatabase(db: Kysely<Database>): Promise<void> {
  try {
    await db.destroy();
    logger.info('🔌 | Database connection closed');
  } catch (error) {
    logger.error('Failed to close database connection:', error);
    throw error;
  }
}
