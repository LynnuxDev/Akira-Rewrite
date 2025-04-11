import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { ExtendedClient } from "@/types/extendedClient";
import { logger } from "@/utils";
import { getUserLanguage } from "@/database/getUserLanguage";
import { i18n } from "@/middleware/i18n";
import { getLink } from "@/middleware/getStaticLink";

export default {
  data: new SlashCommandBuilder()
    .setName('about')
    .setDescription('See info about Akira!'),

  async execute(
    client: ExtendedClient,
    interaction: ChatInputCommandInteraction,
  ):Promise<void> {
    const clientThumbnail = client.user.avatarURL({extension: 'webp', size: 1024, forceStatic: true})
    try {
      const lang = await getUserLanguage(interaction.user.id);
      await interaction.deferReply()

      const Embed = new EmbedBuilder()
        .setColor(parseInt('#FF47FF'.replace(/^#/, ''), 16))
        .setThumbnail(clientThumbnail)
        .setTitle(i18n(lang, 'message.utility.about.title') + ':')
        .setFields(
          {
            name: i18n(lang, 'message.utility.about.field.one.title'),
            value: i18n(lang, 'message.utility.about.field.one.description'),
            inline: true
          },
          {
            name: i18n(lang, 'message.utility.about.field.two.title'),
            value: '`V0.0.0`',
            inline: true
          },
          {
            name: '\u200B',
            value: '\u200B',
            inline: true
          },
          {
            name: i18n(lang, 'global.buttons.website'),
            value: '[' + `[${i18n(lang, 'global.buttons.button2')}](${getLink('WEBSITE')})` + ']',
            inline: true
          },
          {
            name: i18n(lang, 'global.buttons.server'),
            value: '[' + `[${i18n(lang, 'global.buttons.button2')}](${getLink('SUPPORT_SERVER')})` + ']',
            inline: true
          },
          {
            name: i18n(lang, 'global.buttons.Invite'),
            value: '[' + `[${i18n(lang, 'global.buttons.button2')}](${getLink('DISCORD_INVITE')})` + ']',
            inline: true
          }
        )
      const Row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(`close`)
            .setLabel('Close')
            .setEmoji('✖️')
            .setStyle(ButtonStyle.Danger),
          new ButtonBuilder()
            .setURL(getLink('SOURCE_CODE'))
            .setLabel('Source-Code')
            .setEmoji('📖')
            .setStyle(ButtonStyle.Link),
        )

      interaction.editReply({embeds: [Embed], components: [Row]})

      } catch (err) {
      const message = await interaction.editReply(`${client.findEmoji('BOT-fail')} There was an Internal error while trying to resolve your request, please inform staff.`);
      if (err instanceof Error) {
        console.error('Error ' + err + '\n', err.stack);
      }
    }
  }
}