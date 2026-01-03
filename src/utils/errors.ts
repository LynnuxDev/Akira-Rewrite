import { Interaction, EmbedBuilder, ColorResolvable } from 'discord.js';
import errors from '../../static/errors.json';
import { logger } from './logger';

export type ErrorId = keyof typeof errors;

/**
 * Handles errors by sending a standardized embed response to an interaction.
 * @param interaction - The Discord interaction to respond to.
 * @param errorId - The ID of the error from static/errors.json.
 * @param origin - Optional string indicating where the error originated.
 */
export async function customError(
  interaction: Interaction,
  errorId: ErrorId,
  origin?: string,
): Promise<void> {
  const errorData = (errors as any)[errorId];
  if (!errorData) {
    logger.error(
      `⚠️ | Unknown error ID: ${errorId}${origin ? ` (Origin: ${origin})` : ''}`,
    );
    return;
  }

  const { embed } = errorData;
  const title = Array.isArray(embed.title)
    ? embed.title[Math.floor(Math.random() * embed.title.length)]
    : embed.title;

  const responseEmbed = new EmbedBuilder()
    .setTitle(title || 'Error')
    .setDescription(embed.description)
    .setColor((embed.color as ColorResolvable) || '#ff4b4b')
    .setFooter({ text: embed.footer || 'Akira | Error System' });

  if (embed.showTimestamp) {
    responseEmbed.setTimestamp();
  }

  const responseOptions = {
    embeds: [responseEmbed],
    flags: embed.ephemeral ? 'Ephemeral' : undefined,
  };

  if (interaction.isRepliable()) {
    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(responseOptions as any);
      } else {
        await interaction.reply(responseOptions as any);
      }
    } catch (err) {
      logger.error('❌ | Failed to send error response:', err);
    }
  }
}
