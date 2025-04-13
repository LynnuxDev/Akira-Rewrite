import { ButtonInteraction } from 'discord.js';
import { ExtendedClient } from '@/types/extendedClient';
import { statsUsage, statsOverview, statsSystem, statsDeveloper } from './stats/_index';

export default {
  customId: (id: string): boolean => id.startsWith('stats_'),
  async execute(
    client: ExtendedClient,
    interaction: ButtonInteraction,
  ):Promise<void> {
    const [_, type, userId] = interaction.customId.split('_');
    try {
      switch (type) {
        case ('main'): {
          await statsOverview(client, interaction)
          return;
        }
        case ('usage'): {
          await statsUsage(client, interaction)
          return;
        }
        case ('system'): {
          await statsSystem(client, interaction)
          return;
        }
        case ('dev'): {
          await statsDeveloper(client, interaction)
          return;
        }
      }
    } catch (err){
      if (err instanceof Error) {
        console.log('Error: ' + err.message, err.stack)
      }
    }
  },
};
