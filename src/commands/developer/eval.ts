import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { ExtendedClient } from '@/types/extendedClient';
import { logger } from '@/utils';

export default {
  guilds: ['800133788117106729'],
  data: new SlashCommandBuilder()
    .setName('eval')
    .setDescription('Evaluates JavaScript code (dev only))')
    .addStringOption((option) =>
      option.setName('code')
        .setDescription('Code to evaluate.')
        .setRequired(true),
    ),

  async execute(
    client: ExtendedClient,
    interaction: ChatInputCommandInteraction,
  ):Promise<void> {
    const allowedUserIds = ['YOUR_ID'];

    if (!allowedUserIds.includes(interaction.user.id)) {
      await interaction.reply({
        content: 'You do not have permission to use this command.',
        flags: 'Ephemeral',
      });
      return;
    }

    const code = interaction.options.getString('code', true);

    try {
      const result = await eval(code);
      const resultOutput = result instanceof Promise ? await result : result;
      const output =
        typeof resultOutput === 'string'
          ? resultOutput
          : JSON.stringify(resultOutput, null, 2);

      await interaction.reply({
        content: `\`\`\`js\n${output}\n\`\`\``,
      });
      return;
    } catch (error) {
      logger.error(`eval: Error occurred while evaluating code: ${error}`);
      await interaction.reply({
        content: `Error: \`\`\`js\n${error}\n\`\`\``,
      });
      return;
    }
  },
};
