import { Client, Collection, ClientOptions } from 'discord.js';
import { Command } from './commands';
import { Button } from './buttons';
import { Modal } from './modal';
import dotenv from 'dotenv';
import { logger } from '@/utils';

dotenv.config();

export class ExtendedClient extends Client<true> {
  readonly commands: Collection<string, Command>;
  readonly subcommands: Collection<string, Command>;
  readonly buttons: Collection<string, Button>;
  readonly emoji: Collection<string, string>;
  readonly modals: Collection<string, Modal>;

  constructor(options: ClientOptions) {
    super(options);
    this.commands = new Collection();
    this.subcommands = new Collection();
    this.buttons = new Collection();
    this.emoji = new Collection();
    this.modals = new Collection();
  }

  env(key: string, defaultValue: string = ''): string {
    const value = process.env[key] || defaultValue;
    if (!value) {
      logger.warn(`Environment variable ${key} is not set`);
    }
    return value;
  }

  findEmoji(name: string): string | undefined {
    return this.emoji.get(name);
  }

}
