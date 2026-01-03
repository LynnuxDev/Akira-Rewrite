import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { ExtendedClient } from './extendedClient';
import { CommandId } from '@/database/schema';

export interface CommandMetadata {
  cooldown: number; // in seconds
  description: string;
  usage: string;
  documentation?: string;
  sourceCode?: string;
}

export interface Command {
  id: CommandId;
  metadata: CommandMetadata;
  data: SlashCommandBuilder;
  guilds?: string[];
  execute: (
    client: ExtendedClient,
    interaction: ChatInputCommandInteraction<'cached'>,
  ) => Promise<void>;
}
