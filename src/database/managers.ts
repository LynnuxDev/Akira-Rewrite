import { Kysely } from 'kysely';
import { Database, UserSettings, UserProfile } from '../database/schema';

export class SettingsManager {
  constructor(private readonly db: Kysely<Database>) {}

  async get(userId: string): Promise<UserSettings | undefined> {
    return await this.db
      .selectFrom('UserSettings')
      .selectAll()
      .where('userId', '=', userId)
      .executeTakeFirst();
  }

  async set(userId: string, data: Partial<UserSettings>): Promise<void> {
    await this.db
      .insertInto('UserSettings')
      .values({ userId, ...data } as any)
      .onConflict((oc) => oc.column('userId').doUpdateSet(data as any))
      .execute();
  }
}

export class ProfileManager {
  constructor(private readonly db: Kysely<Database>) {}

  async get(userId: string): Promise<UserProfile | undefined> {
    const profile = await this.db
      .selectFrom('UserProfile')
      .selectAll()
      .where('userId', '=', userId)
      .executeTakeFirst();

    if (profile && typeof profile.badges === 'string') {
      try {
        (profile as any).badges = JSON.parse(profile.badges);
      } catch {
        (profile as any).badges = [];
      }
    }

    return profile;
  }

  async set(userId: string, data: Partial<UserProfile>): Promise<void> {
    const updateData = { ...data };
    if (updateData.badges && typeof updateData.badges !== 'string') {
      updateData.badges = JSON.stringify(updateData.badges) as any;
    }

    await this.db
      .insertInto('UserProfile')
      .values({ userId, ...updateData } as any)
      .onConflict((oc) => oc.column('userId').doUpdateSet(updateData as any))
      .execute();
  }
}
