import { ExtendedClient } from '@/types/extendedClient';
import { startOfTodayUTC } from '@/utils/functions';
import { sql } from 'kysely';

export async function getCommandUsage(
  db: ExtendedClient['db'],
  options: {
    targetType: 'USER' | 'GUILD' | 'GLOBAL';
    targetId?: string;
    limit?: number;
    todayOnly?: boolean;
  },
) {
  let query = db
    .selectFrom('CommandStats')
    .select([
      'command_id',
      sql<number>`sum(usage_count)`.as('uses'),
      sql<number>`sum(error_count)`.as('errors'),
    ])
    .where('target_type', '=', options.targetType)
    .groupBy('command_id')
    .orderBy('uses', 'desc');

  if (options.targetId) {
    query = query.where('target_id', '=', options.targetId);
  }

  if (options.todayOnly) {
    query = query.where('date', '=', startOfTodayUTC());
  }

  if (options.limit) {
    query = query.limit(options.limit);
  }

  return query.execute();
}
