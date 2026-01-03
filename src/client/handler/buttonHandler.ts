import { ExtendedClient } from '@/types/extendedClient';
import { logger, customError } from '@/utils';
import { Interaction, ButtonInteraction } from 'discord.js';
import { statSync, readdirSync } from 'fs';
import path from 'path';

import { walkDirectory } from './resourceLoader';

/**
 * Loads all buttons from the buttons directory.
 * @param client - The extended Discord client.
 */
export const loadButtons = async (client: ExtendedClient): Promise<void> => {
  const buttonsPath = path.join(__dirname, '../../buttons');

  await walkDirectory(buttonsPath, async (filePath) => {
    try {
      const button = (await import(filePath)).default;

      if (button && button.customId) {
        client.buttons.set(button.customId, button);

        const isDynamic = typeof button.customId !== 'string';
        const displayId = isDynamic ? '[Dynamic Function]' : button.customId;

        logger.info(
          `✅ | Loaded button: ${displayId} (${path.relative(buttonsPath, filePath)})`,
        );
      } else {
        logger.warn(
          `⚠️ | Skipping invalid button file: ${path.basename(filePath)}`,
        );
      }
    } catch (err) {
      logger.error(`❌ | Failed to load button at ${filePath}:`, err);
    }
  });
};

/**
 * Handles button interactions by finding and executing the appropriate handler.
 * @param client - The extended Discord client.
 * @param interaction - The button interaction.
 */
export const buttonHandler = async (
  client: ExtendedClient,
  interaction: Interaction,
): Promise<void> => {
  if (!interaction.isButton() || !interaction.inCachedGuild()) return;

  const button = client.buttons.find((handler) =>
    typeof handler.customId === 'string'
      ? handler.customId === interaction.customId
      : handler.customId(interaction.customId),
  );

  if (!button) {
    logger.warn(`⚠️ | Button handler not found: ${interaction.customId}`);
    return;
  }

  try {
    await button.execute(client, interaction as ButtonInteraction);
    logger.debug(`🔘 | Executed button handler: ${interaction.customId}`);
  } catch (err) {
    logger.error(
      `❌ | Error executing button handler: ${interaction.customId}`,
      err,
    );
    await customError(interaction, '304', 'buttonHandler');
  }
};
