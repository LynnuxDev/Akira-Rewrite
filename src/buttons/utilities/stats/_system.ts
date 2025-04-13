import { version } from "discord.js"
import { mem, cpu, currentLoad } from 'systeminformation'
import { uptime } from 'os'
import { getUserLanguage } from "@/database/getUserLanguage";
import { ExtendedClient } from "@/types/extendedClient";
import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, EmbedBuilder, MessageResolvable } from "discord.js";

export default async function statsSystem(
  client: ExtendedClient,
  interaction: ButtonInteraction,
): Promise<void> {
  const lang = await getUserLanguage(interaction.user.id);
  const clientThumbnail = client.user.avatarURL({extension: 'webp', size: 1024, forceStatic: true})
  // Ram related
  const memory = await mem();
  const used = memory.total - memory.available; // used = total - available
  const total = memory.total;
  const usedMB = Math.round(used / 1024 / 1024);
  const totalMB = Math.round(total / 1024 / 1024);
  const usagePercent = Math.round((used / total) * 100);
  const toGB = (bytes: number) => (bytes / 1024 / 1024 / 1024).toFixed(2) + 'GB';
  // CPU related
  const cpuData = await cpu();
  const loadData = await currentLoad();
  const totalCores = cpuData.cores;
  const usedLoad = loadData.currentLoad;
  const usedCoresEstimate = Math.round((usedLoad / 100) * totalCores);

    const Embed = new EmbedBuilder()
    .setColor(parseInt('#FF47FF'.replace(/^#/, ''), 16))
    .setThumbnail(clientThumbnail)
    .setTitle('Akira\'s Statistics')
    .setFooter({text: 'Made with ❤️ by LynnuxDev.'})
    .addFields({
      name: 'CPU Usage:',
      value: `${usedCoresEstimate} / ${totalCores} (${Math.round(usedLoad)}%)`,
      inline: true
      },{
        name: 'Ram Usage:',
        value: `${toGB(used)} / ${toGB(total)} (${usagePercent}%)`,
        inline: true
      },{
        name: 'Server Uptime:',
        value: `<t:${Math.round((Math.round(Date.now() / 1000)) - uptime())}:R>`,
        inline: true
      },{
        name: 'Node Version:',
        value: process.version,
        inline: true
      },{
        name: 'Discord.JS Version:',
        value: 'v' + version,
        inline: true
      }
    )

  const Row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`stats_main_${interaction.user.id}`)
        .setLabel('Overview')
        .setEmoji('🧾')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId(`stats_usage_${interaction.user.id}`)
        .setLabel('Usage')
        .setEmoji('📊')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId(`stats_system_${interaction.user.id}`)
        .setLabel('System')
        .setEmoji('🖥️')
        .setDisabled(true)
        .setStyle(ButtonStyle.Primary),
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
