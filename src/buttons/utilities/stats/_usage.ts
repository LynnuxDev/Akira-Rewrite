import { getUserLanguage } from "@/database/getUserLanguage";
import { ExtendedClient } from "@/types/extendedClient";
import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, EmbedBuilder, MessageResolvable } from "discord.js";

export default async function statsUsage(
  client: ExtendedClient,
  interaction: ButtonInteraction,
): Promise<void> {
  const lang = await getUserLanguage(interaction.user.id);
  const clientThumbnail = client.user.avatarURL({extension: 'webp', size: 1024, forceStatic: true})

  const Embed = new EmbedBuilder()
    .setColor(parseInt('#FF47FF'.replace(/^#/, ''), 16))
    .setThumbnail(clientThumbnail)
    .setTitle('Akira\'s Statistics')
    .setFooter({text: 'Made with ❤️ by LynnuxDev.'})
    .addFields({
      name: '<:Akira_Active_Dev:1271546151543373906> Slash Usage:',
      value:
        '<:NextContinue:936952796056518686> Total Uses:' + '\n' +
        '<:NextContinue:936952796056518686> Monthly Uses:' + '\n' +
        '<:NextContinue:936952796056518686> Weekly Uses:' + '\n' +
        '<:NextStop:936952858711052318> Daily Uses:',
      inline: true
      },{
        name: '<:Commands:1271543811390050414> Message Usage:',
        value:
          '<:NextContinue:936952796056518686> Total Uses:' + '\n' +
          '<:NextContinue:936952796056518686> Monthly Uses:' + '\n' +
          '<:NextContinue:936952796056518686> Weekly Uses:' + '\n' +
          '<:NextStop:936952858711052318> Daily Uses:',
        inline: true
      },{
        name: '<:Plus:1271544047579693148> Button Usage:',
        value:
          '<:NextContinue:936952796056518686> Total Pressed:' + '\n' +
          '<:NextContinue:936952796056518686> Monthly Pressed:' + '\n' +
          '<:NextContinue:936952796056518686> Weekly Pressed:' + '\n' +
          '<:NextStop:936952858711052318> Daily Pressed:',
        inline: true
      },{
        name: '<:Error:1327339457279688811> Errors:',
        value:
          '<:NextContinue:936952796056518686> Total Errors:' + '\n' +
          '<:NextContinue:936952796056518686> Monthly Errors:' + '\n' +
          '<:NextContinue:936952796056518686> Weekly Errors:' + '\n' +
          '<:NextStop:936952858711052318> Daily Errors:',
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
        .setDisabled(true)
        .setStyle(ButtonStyle.Primary),
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
