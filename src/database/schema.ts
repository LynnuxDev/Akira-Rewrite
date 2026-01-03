import { Generated, Insertable, Selectable, Updateable } from 'kysely';

/**
 * Enums
 */

export enum CommandType {
  MESSAGE = 'MESSAGE',
  SLASH = 'SLASH',
  BUTTON = 'BUTTON',
}

export enum CommandId {
  STATS = 'STATS',
  PING = 'PING',
  EVAL = 'EVAL',
}

export enum PremiumTier {
  BASIC = 'BASIC',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM',
}

/**
 * Table Interfaces
 */

export interface UserTable {
  uuid: Generated<string>;
  user_id: string;
  createdAt: Generated<number>; // SQLite stores as timestamp
}

export interface CommandStatsTable {
  id: Generated<string>;
  target_id: string; // User ID, Guild ID, or Client ID
  target_type: 'USER' | 'GUILD' | 'GLOBAL';
  command_id: CommandId;
  command_type: CommandType;
  usage_count: Generated<number>;
  error_count: Generated<number>;
  date: number; // Unix timestamp for start of day (UTC)
}

export interface UserProfileTable {
  cuid: Generated<string>;
  userId: string;
  bio: Generated<string>;
  pronouns: Generated<string>;
  website: string | null;
  github: string | null;
  twitter: string | null;
  reputation: Generated<number>;
  badges: Generated<string>; // JSON array of badge IDs or names
}

export interface BadgeTable {
  cuid: Generated<string>;
  name: string;
  icon: string;
}

export interface CooldownTable {
  cuid: Generated<string>;
  userId: string;
  command_id: CommandId;
  expiresAt: number;
}

export interface UserSettingsTable {
  cuid: Generated<string>;
  userId: string;
  prefix: Generated<string>;
  color: Generated<string>;
  language: Generated<string>;
  timezone: Generated<string>;
  // Ban Info
  bannedAt: number | null;
  banReason: string | null;
  banExpiresAt: number | null;
  // Premium Info
  premiumTier: Generated<PremiumTier>;
  premiumStartedAt: number | null;
  premiumExpiresAt: number | null;
}

export interface TestTable {
  user_id: string;
  createdAt: Generated<number>;
}

/**
 * Database Schema
 */

export interface Database {
  User: UserTable;
  CommandStats: CommandStatsTable;
  UserProfile: UserProfileTable;
  Badge: BadgeTable;
  Cooldown: CooldownTable;
  UserSettings: UserSettingsTable;
  test: TestTable;
}

/**
 * Helper Types
 */

// User types
export type User = Selectable<UserTable>;
export type NewUser = Insertable<UserTable>;
export type UserUpdate = Updateable<UserTable>;

// CommandStats types
export type CommandStats = Selectable<CommandStatsTable>;
export type NewCommandStats = Insertable<CommandStatsTable>;
export type CommandStatsUpdate = Updateable<CommandStatsTable>;

// UserProfile types
export type UserProfile = Selectable<UserProfileTable>;
export type NewUserProfile = Insertable<UserProfileTable>;
export type UserProfileUpdate = Updateable<UserProfileTable>;

// UserSettings types
export type UserSettings = Selectable<UserSettingsTable>;
export type NewUserSettings = Insertable<UserSettingsTable>;
export type UserSettingsUpdate = Updateable<UserSettingsTable>;

// Add more type helpers as needed for other tables
