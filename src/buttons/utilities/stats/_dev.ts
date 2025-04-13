import { getUserLanguage } from "@/database/getUserLanguage";
import { ExtendedClient } from "@/types/extendedClient";
import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, EmbedBuilder, MessageResolvable, Status } from "discord.js";

export default async function statsDeveloper(
  client: ExtendedClient,
  interaction: ButtonInteraction,
): Promise<void> {
  const lang = await getUserLanguage(interaction.user.id);
  const clientThumbnail = client.user.avatarURL({extension: 'webp', size: 1024, forceStatic: true})
  const contributors = await getContributors();

  let contributorList = '';
  contributors.forEach((contributor, index) => {
    contributorList += `${index + 1}. [${contributor.login}](${contributor.profileUrl})\n`;
  });

  const Embed = new EmbedBuilder()
    .setColor(parseInt('#FF47FF'.replace(/^#/, ''), 16))
    .setThumbnail(clientThumbnail)
    .setTitle('Akira\'s Statistics')
    .setFooter({text: 'Made with ❤️ by LynnuxDev.'})
    .setDescription(contributorList)

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
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId(`stats_dev_${interaction.user.id}`)
        .setLabel('Dev Info')
        .setEmoji('🧠')
        .setDisabled(true)
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('close')
        .setLabel('Close')
        .setEmoji('✖️')
        .setStyle(ButtonStyle.Danger),
    )

  interaction.update({embeds: [Embed], components: [Row]})
}

interface Contributor {
  login: string;
  profileUrl: string;
  contributions: number;
}

async function getContributors(): Promise<Contributor[]> {
  try {
    const response = await fetch('https://api.github.com/repos/LynnuxDev/Akira-Rewrite/contributors');
    const data = await response.json();

    const contributors: Contributor[] = data.map((contributor: { login: string, contributions: number }) => ({
      login: contributor.login,
      profileUrl: `https://github.com/${contributor.login}`,
      contributions: contributor.contributions,
    }));

    // Sort contributors by number of contributions (commits)
    contributors.sort((a, b) => b.contributions - a.contributions);

    return contributors;
  } catch (error) {
    console.error("Error fetching contributors:", error);
    return [];
  }
}
