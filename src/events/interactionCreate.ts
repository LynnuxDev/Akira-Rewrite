import { Interaction } from 'discord.js';
import { ExtendedClient } from '@/types/extendedClient';
import {
  buttonHandler,
  commandExecutor,
  modalHandler,
} from '../client/handler/index';

export default {
  name: 'interactionCreate',
  async execute(
    client: ExtendedClient,
    interaction: Interaction,
  ): Promise<void> {
    if (interaction.isChatInputCommand()) {
      await commandExecutor(client, interaction);
    } else if (interaction.isButton()) {
      await buttonHandler(client, interaction);
    } else if (interaction.isModalSubmit()) {
      await modalHandler(client, interaction);
    }
  },
};
