-- Initial Schema Migration

-- Main User Table
CREATE TABLE IF NOT EXISTS User (
  uuid TEXT NOT NULL UNIQUE DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT PRIMARY KEY NOT NULL,
  createdAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- Command Usage Tracking
-- Command Usage Tracking (Unified)
CREATE TABLE IF NOT EXISTS CommandStats (
  id TEXT PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(16)))),
  target_id TEXT NOT NULL, -- User ID, Guild ID, or Client ID (Global)
  target_type TEXT NOT NULL CHECK(target_type IN ('USER', 'GUILD', 'GLOBAL')),
  command_id TEXT NOT NULL,
  command_type TEXT NOT NULL CHECK(command_type IN ('MESSAGE', 'SLASH', 'BUTTON')),
  usage_count INTEGER NOT NULL DEFAULT 0,
  error_count INTEGER NOT NULL DEFAULT 0,
  date INTEGER NOT NULL -- Unix timestamp for start of day
);

CREATE INDEX IF NOT EXISTS idx_commandstats_target ON CommandStats(target_id, target_type);
CREATE INDEX IF NOT EXISTS idx_commandstats_date ON CommandStats(date);

-- User Profile System
CREATE TABLE IF NOT EXISTS UserProfile (
  cuid TEXT PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(16)))),
  userId TEXT NOT NULL UNIQUE,
  bio TEXT NOT NULL DEFAULT '',
  pronouns TEXT NOT NULL DEFAULT '',
  website TEXT,
  github TEXT,
  twitter TEXT,
  reputation INTEGER NOT NULL DEFAULT 0,
  badges TEXT NOT NULL DEFAULT '[]', -- JSON array of badge IDs or names
  FOREIGN KEY (userId) REFERENCES User(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Badge (
  cuid TEXT PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL,
  icon TEXT NOT NULL
);

-- Settings & Utility
CREATE TABLE IF NOT EXISTS Cooldown (
  cuid TEXT PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(16)))),
  userId TEXT NOT NULL,
  command_id TEXT NOT NULL,
  expiresAt INTEGER NOT NULL,
  FOREIGN KEY (userId) REFERENCES User(user_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_cooldown_user_command ON Cooldown(userId, command_id);

CREATE TABLE IF NOT EXISTS UserSettings (
  cuid TEXT PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(16)))),
  userId TEXT NOT NULL UNIQUE,
  prefix TEXT NOT NULL DEFAULT 'a.',
  color TEXT NOT NULL DEFAULT 'ff47ff',
  language TEXT NOT NULL DEFAULT 'en-US',
  timezone TEXT NOT NULL DEFAULT 'UTC',
  -- Ban Info
  bannedAt INTEGER, -- Unix timestamp
  banReason TEXT,
  banExpiresAt INTEGER, -- Unix timestamp
  -- Premium Info
  premiumTier TEXT NOT NULL DEFAULT 'BASIC' CHECK(premiumTier IN ('BASIC', 'GOLD', 'PLATINUM')),
  premiumStartedAt INTEGER, -- Unix timestamp
  premiumExpiresAt INTEGER, -- Unix timestamp
  FOREIGN KEY (userId) REFERENCES User(user_id) ON DELETE CASCADE
);

-- Testing Table
CREATE TABLE IF NOT EXISTS test (
  user_id TEXT PRIMARY KEY NOT NULL UNIQUE,
  createdAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);
