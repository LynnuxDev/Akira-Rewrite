import { ExtendedClient } from '@/types/extendedClient';
import { CommandType, CommandId } from '../schema';
import { startOfTodayUTC } from '@/utils/functions';

/**
 * Records command usage (and optionally errors) for a specific target.
 * @param db - The Kysely database instance.
 * @param options - Recording options.
 */
export async function recordCommandUsage(
  db: ExtendedClient['db'],
  options: {
    targetId: string;
    targetType: 'USER' | 'GUILD' | 'GLOBAL';
    commandId: CommandId;
    commandType: CommandType;
    isError?: boolean;
  },
) {
  const today = startOfTodayUTC();

  // We use a manual upsert since SQLite's ON CONFLICT can be tricky with composite logic in Kysely
  // without specialized plugins, and this is a clean way to handle it.
  const existing = await db
    .selectFrom('CommandStats')
    .select(['id', 'usage_count', 'error_count'])
    .where('target_id', '=', options.targetId)
    .where('target_type', '=', options.targetType)
    .where('command_id', '=', options.commandId)
    .where('date', '=', today)
    .executeTakeFirst();

  if (existing) {
    await db
      .updateTable('CommandStats')
      .set({
        usage_count: existing.usage_count + 1,
        error_count: options.isError
          ? existing.error_count + 1
          : existing.error_count,
      })
      .where('id', '=', existing.id)
      .execute();
  } else {
    await db
      .insertInto('CommandStats')
      .values({
        target_id: options.targetId,
        target_type: options.targetType,
        command_id: options.commandId,
        command_type: options.commandType,
        usage_count: 1,
        error_count: options.isError ? 1 : 0,
        date: today,
      })
      .execute();
  }
}
