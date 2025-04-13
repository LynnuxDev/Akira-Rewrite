import { ButtonInteraction } from 'discord.js';
import { ExtendedClient } from '@/types/extendedClient';

export default {
  customId: 'close',
  async execute(
    client: ExtendedClient,
    interaction: ButtonInteraction,
  ):Promise<void> {
    await interaction.deferUpdate();
    await interaction.message.delete();
},
};
