import { ExtendedClient } from '@/types/extendedClient';
import { logger } from '@/utils';
import fs from 'fs';
import path from 'path';
import { registerCommands } from './registerCommands';
import { Command } from '@/types/commands';
import {
  SlashCommandSubcommandBuilder,
  SlashCommandSubcommandGroupBuilder,
} from 'discord.js';

import { walkDirectory } from './resourceLoader';

const loadCommand = async (client: ExtendedClient, commandPath: string) => {
  try {
    const command = (await import(commandPath)).default;
    if (!command || !command.data || !command.execute) {
      logger.warn(`⚠️ | Skipping invalid command file: ${commandPath}`);
      return;
    }

    client.commands.set(command.data.name, command);
    logger.info(`✅ | Loaded command: ${command.data.name}`);
    loadSubcommands(client, command);
  } catch (error) {
    logger.error(`❌ | Failed to load command at ${commandPath}:`, error);
  }
};

const loadSubcommands = (client: ExtendedClient, command: Command) => {
  if (!command.data.options) return;

  for (const option of command.data.options) {
    const type = option.toJSON().type;
    // 1 = Subcommand, 2 = Subcommand Group
    if (type === 1 || type === 2) {
      const name = (
        option as
          | SlashCommandSubcommandBuilder
          | SlashCommandSubcommandGroupBuilder
      ).name;
      client.subcommands.set(`${command.data.name}/${name}`, command);
      logger.info(`✅ |   └─ subcommand: "${command.data.name} ~ ${name}"`);
    }
  }
};

/**
 * Loads and registers all commands from the commands directory.
 * @param client - The extended Discord client.
 */
export const loadCommands = async (client: ExtendedClient): Promise<void> => {
  const commandsPath = path.join(__dirname, '../../commands');

  await walkDirectory(commandsPath, async (filePath) => {
    if (
      path.basename(filePath) === 'index.ts' ||
      path.basename(filePath) === 'index.js'
    )
      return;
    await loadCommand(client, filePath);
  });

  // ✅ Register slash commands with Discord after loading
  await registerCommands(client);
  return;
};
