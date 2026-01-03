import { ExtendedClient } from '@/types/extendedClient';
import { CommandId } from '@/database/schema';
import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  Colors,
} from 'discord.js';
import { sql } from 'kysely';

export default {
  id: CommandId.PING,
  metadata: {
    cooldown: 3,
    description: 'Check the bot latency and API response times including DB.',
    usage: '/ping',
    documentation: 'https://docs.akira.bot/commands/utility/ping',
  },
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check the bot latency and API response times'),

  async execute(
    client: ExtendedClient,
    interaction: ChatInputCommandInteraction,
  ): Promise<void> {
    const interactionStart = Date.now();
    await interaction.deferReply();

    /* ---------------- Interaction Latency ---------------- */
    const interactionLatency = Date.now() - interactionStart;

    /* ---------------- WebSocket Latency ---------------- */
    const wsLatency = client.ws.ping;

    /* ---------------- Database Latency ---------------- */
    let dbLatency: number | null = null;
    let dbStatus = '🟢 OK';

    try {
      const dbStart = Date.now();

      // SQLite-safe ping
      await sql`select 1`.execute(client.db);

      dbLatency = Date.now() - dbStart;
    } catch {
      dbStatus = '🔴 Error';
    }

    /* ---------------- Initial Embed ---------------- */
    const embed = new EmbedBuilder()
      .setTitle('🏓 Pong!')
      .setDescription('Advanced connection diagnostics')
      .setColor(
        wsLatency < 200
          ? Colors.Green
          : wsLatency < 400
            ? Colors.Yellow
            : Colors.Red,
      )
      .addFields(
        {
          name: '📡 WebSocket',
          value: `\`${wsLatency}ms\`\n${wsLatency < 200 ? '🟢 OK' : wsLatency < 400 ? '🟡 Warning' : '🔴 Crucial'}`,
          inline: true,
        },
        {
          name: '⚙️ Interaction',
          value: `\`${interactionLatency}ms\`\n${interactionLatency < 200 ? '🟢 OK' : interactionLatency < 400 ? '🟡 Warning' : '🔴 Crucial'}`,
          inline: true,
        },
        {
          name: '🗄️ Database',
          value:
            dbLatency !== null ? `\`${dbLatency}ms\`\n${dbStatus}` : dbStatus,
          inline: true,
        },
      )
      .setFooter({
        text: client.user?.username ?? 'Bot',
        iconURL: client.user?.displayAvatarURL(),
      })
      .setTimestamp();

    /* ---------------- Send First Reply ---------------- */
    const reply = await interaction.editReply({ embeds: [embed] });

    /* ---------------- Round-Trip Latency ---------------- */
    const roundTripStart = Date.now();
    await interaction.editReply({ embeds: [embed] });
    const roundTripLatency = Date.now() - roundTripStart;

    /* ---------------- Update Embed ---------------- */
    embed.addFields({
      name: '🔁 Round-Trip',
      value: `\`${roundTripLatency}ms\`\n${roundTripLatency < 200 ? '🟢 OK' : roundTripLatency < 400 ? '🟡 Warning' : '🔴 Critical'}`,
      inline: true,
    });

    await interaction.editReply({ embeds: [embed] });
  },
};
