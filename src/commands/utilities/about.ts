import { ExtendedClient } from "@/types/extendedClient";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName('about')
    .setDescription('Get info about the bot!'),
  async execute (
    client: ExtendedClient,
    interaction: ChatInputCommandInteraction,
  ) {
    // Command handling
  }
}