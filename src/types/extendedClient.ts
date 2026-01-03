import { Client, Collection, ClientOptions } from 'discord.js';
import { Kysely } from 'kysely';
import { Command } from './commands';
import { Button } from './buttons';
import { Modal } from './modal';
import { logger, env } from '@/utils';
import { Database, createDatabase, closeDatabase } from '@/database';
import { SettingsManager, ProfileManager } from '@/database/managers';

/**
 * An extended Discord client with collections for commands, buttons, modals, and database access.
 */
export class ExtendedClient extends Client<true> {
  readonly commands: Collection<string, Command>;
  readonly subcommands: Collection<string, Command>;
  readonly buttons: Collection<string, Button>;
  readonly emoji: Collection<string, string>;
  readonly modals: Collection<string, Modal>;
  readonly db: Kysely<Database>;
  readonly settings: SettingsManager;
  readonly profile: ProfileManager;

  /**
   * Creates a new ExtendedClient instance.
   * @param {ClientOptions} options - Discord.js client options.
   */
  constructor(options: ClientOptions) {
    super(options);
    this.commands = new Collection();
    this.subcommands = new Collection();
    this.buttons = new Collection();
    this.emoji = new Collection();
    this.modals = new Collection();

    // Initialize database
    this.db = createDatabase();
    this.settings = new SettingsManager(this.db);
    this.profile = new ProfileManager(this.db);

    // Graceful shutdown handlers
    this.setupShutdownHandlers();
  }

  readonly env = env;

  /**
   * Finds a custom emoji by name.
   * @param {string} name - The emoji name.
   * @returns {string | undefined} The emoji ID or name if not found.
   */
  findEmoji(name: string): string | undefined {
    return this.emoji.get(name) || name;
  }

  /**
   * Sets up graceful shutdown handlers for the client.
   * @private
   */
  private setupShutdownHandlers(): void {
    const shutdown = async (signal: string) => {
      logger.info(`${signal} received, closing database connection...`);
      try {
        await closeDatabase(this.db);
        process.exit(0);
      } catch (error) {
        logger.error('Error during shutdown:', error);
        process.exit(1);
      }
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  }
}
