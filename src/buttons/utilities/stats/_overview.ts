import { getUserLanguage } from "@/database/getUserLanguage";
import { ExtendedClient } from "@/types/extendedClient";
import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, EmbedBuilder, MessageResolvable, Status } from "discord.js";

export default async function statsOverview(
  client: ExtendedClient,
  interaction: ButtonInteraction,
): Promise<void> {
  const lang = await getUserLanguage(interaction.user.id);
  const clientThumbnail = client.user.avatarURL({extension: 'webp', size: 1024, forceStatic: true})
  const memberCounts = await Promise.all(
    client.guilds.cache.map(guild => guild.fetch().then(g => g.memberCount).catch(() => 0))
  );
  const totalMembers = memberCounts.reduce((a, b) => a + b, 0);
  const commands = await client.application.commands.fetch();

  const Embed = new EmbedBuilder()
    .setColor(parseInt('#FF47FF'.replace(/^#/, ''), 16))
    .setThumbnail(clientThumbnail)
    .setTitle('Akira\'s Statistics')
    .setFooter({text: 'Made with ❤️ by LynnuxDev.'})
    .addFields({
      name: 'Servers:',
      value: client.guilds.cache.size + ' servers',
      inline: true
    },{
      name: 'Users:',
      value: totalMembers + ' users',
      inline: true
    },{
      name: 'Shards:',
      value:
        client.ws.shards.filter(s => s.status === Status.Ready).size +
        ' / ' +
        client.ws.shards.size +
        ' ready.',
      inline: true
    },{
      name:'Commands:',
      value: `${commands.size} Commands`,
      inline: true
    },{
      name: 'Uptime:',
      value: `<t:${Math.floor((Date.now() - client.uptime) / 1000)}:R>`,
      inline: true
    },{
      name: 'Ping:',
      value: `${client.ws.ping}ms`,
      inline: true
    })

  const Row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`stats_main_${interaction.user.id}`)
        .setLabel('Overview')
        .setEmoji('🧾')
        .setDisabled(true)
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`stats_usage_${interaction.user.id}`)
        .setLabel('Usage')
        .setEmoji('📊')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId(`stats_system_${interaction.user.id}`)
        .setLabel('System')
        .setEmoji('🖥️')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId(`stats_dev_${interaction.user.id}`)
        .setLabel('Dev Info')
        .setEmoji('🧠')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('close')
        .setLabel('Close')
        .setEmoji('✖️')
        .setStyle(ButtonStyle.Danger),
    )

  interaction.update({embeds: [Embed], components: [Row]})
}
