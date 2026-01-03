import { ExtendedClient } from '@/types/extendedClient';
import { logger, customError } from '@/utils';
import { Interaction, ModalSubmitInteraction } from 'discord.js';
import { readdirSync } from 'fs';
import path from 'path';

import { walkDirectory } from './resourceLoader';

export const loadModals = async (client: ExtendedClient): Promise<void> => {
  const modalsPath = path.join(__dirname, '../../modals');

  await walkDirectory(modalsPath, async (filePath) => {
    try {
      const modal = (await import(filePath)).default;

      if (modal && modal.customId) {
        client.modals.set(modal.customId, modal);

        const isDynamic = typeof modal.customId !== 'string';
        const displayId = isDynamic ? '[Dynamic Function]' : modal.customId;
        logger.info(`✅ | Loaded modal: ${displayId}`);
      } else {
        logger.warn(
          `⚠️ | Skipping invalid modal file: ${path.basename(filePath)}`,
        );
      }
    } catch (err) {
      logger.error(`❌ | Failed to load modal at ${filePath}:`, err);
    }
  });
};

/**
 * Handles modal submit interactions by finding and executing the appropriate handler.
 * @param client - The extended Discord client.
 * @param interaction - The modal submit interaction.
 */
export const modalHandler = async (
  client: ExtendedClient,
  interaction: Interaction,
): Promise<void> => {
  if (!interaction.isModalSubmit() || !interaction.inCachedGuild()) return;

  const modal = client.modals.find((handler) =>
    typeof handler.customId === 'string'
      ? handler.customId === interaction.customId
      : handler.customId(interaction.customId),
  );

  if (!modal) {
    logger.warn(`⚠️ | Modal handler not found: ${interaction.customId}`);
    return;
  }

  try {
    await modal.execute(
      client,
      interaction as ModalSubmitInteraction<'cached'>,
    );
    logger.debug(`📝 | Executed modal handler: ${interaction.customId}`);
  } catch (err) {
    logger.error(
      `❌ | Error executing modal handler: ${interaction.customId}`,
      err,
    );
    await customError(interaction, '304', 'modalHandler');
  }
};

const modalFollowup = async (
  client: ExtendedClient,
  interaction: Interaction,
) => {
  if (interaction.isModalSubmit()) {
    if (interaction.replied || interaction.deferred) {
      try {
        await interaction.followUp({
          content: 'There was an error handling this modal.',
          ephemeral: true,
        });
      } catch (followUpErr) {
        logger.error(
          '❌ | Error while trying to followUp on a modal interaction:' +
            `${followUpErr}`,
        );
      }
    } else {
      try {
        await interaction.reply({
          content: 'There was an error handling this modal.',
          ephemeral: true,
        });
      } catch (replyErr) {
        logger.error(
          `❌ | Error while trying to reply to a modal interaction: ${replyErr}`,
        );
      }
    }
  } else {
    logger.warn('⚠️ | Interaction is not a modal submit interaction.');
  }
};
