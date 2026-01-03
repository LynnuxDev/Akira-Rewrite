import { ExtendedClient } from '@/types/extendedClient';
import { Command } from '@/types/commands';
import { CommandId } from '@/database/schema';
import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from 'discord.js';
import { getCommandUsage } from '@/database/funcs/getCommandUsage';

interface CommandUsageRow {
  command_id: CommandId;
  uses: number;
  errors: number;
}

export default {
  id: CommandId.STATS,
  metadata: {
    cooldown: 5,
    description: 'View command usage statistics for users, guilds, or global.',
    usage: '/stats scope:<scope> [top:<number>] [today:<boolean>]',
    documentation: 'https://docs.akira.bot/commands/utility/stats',
  },
  data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('View command usage statistics')
    .addStringOption((opt) =>
      opt
        .setName('scope')
        .setDescription('Statistics scope')
        .addChoices(
          { name: 'Global', value: 'GLOBAL' },
          { name: 'Guild', value: 'GUILD' },
          { name: 'User', value: 'USER' },
        )
        .setRequired(true),
    )
    .addIntegerOption((opt) =>
      opt
        .setName('top')
        .setDescription('How many commands to show')
        .setMinValue(1)
        .setMaxValue(25),
    )
    .addBooleanOption((opt) =>
      opt.setName('today').setDescription('Only show today’s usage'),
    ),

  async execute(
    client: ExtendedClient,
    interaction: ChatInputCommandInteraction,
  ): Promise<void> {
    await interaction.deferReply();

    const scope = interaction.options.getString('scope', true) as
      | 'USER'
      | 'GUILD'
      | 'GLOBAL';

    const top = interaction.options.getInteger('top') ?? 10;
    const todayOnly = interaction.options.getBoolean('today') ?? false;

    const targetId =
      scope === 'USER'
        ? interaction.user.id
        : scope === 'GUILD'
          ? interaction.guildId!
          : client.env.DISCORD_CLIENT_ID;

    const stats = await getCommandUsage(client.db, {
      targetType: scope,
      targetId,
      limit: top,
      todayOnly,
    });

    if (!stats.length) {
      await interaction.editReply('No statistics available yet.');
      return;
    }

    const description = stats
      .map((row: CommandUsageRow, i) => {
        const command = client.commands.get(row.command_id);
        const name = command?.data.name ?? row.command_id.toLowerCase();

        return (
          `**${i + 1}. /${name}** — \`${row.uses}\` uses` +
          (row.errors ? ` • ⚠️ \`${row.errors}\`` : '')
        );
      })
      .join('\n');

    const scopeEmoji = {
      GLOBAL: '🌍',
      GUILD: '🏠',
      USER: '👤',
    }[scope];

    const embed = new EmbedBuilder()
      .setTitle(`${scopeEmoji} Command Usage`)
      .setDescription(description)
      .setColor('#ff47ff')
      .setFooter({
        text:
          scope === 'GLOBAL'
            ? 'Global statistics'
            : scope === 'GUILD'
              ? `Guild: ${interaction.guild?.name}`
              : `User: ${interaction.user.tag}`,
      })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
