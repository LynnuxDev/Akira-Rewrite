import { ExtendedClient } from '@/types/extendedClient';
import { logger, customError } from '@/utils';
import { Interaction } from 'discord.js';
import { recordCommandUsage } from '@/database/funcs/recordCommandUsage';
import { CommandType } from '@/database/schema';

/**
 * Handles chat input command interactions by finding and executing the appropriate command.
 * @param client - The extended Discord client.
 * @param interaction - The interaction to handle.
 */
export const commandExecutor = async (
  client: ExtendedClient,
  interaction: Interaction,
): Promise<void> => {
  if (!interaction.isChatInputCommand() || !interaction.inCachedGuild()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) {
    logger.warn(`⚠️ | Command not found: ${interaction.commandName}`);
    await customError(interaction, '404', 'commandExecutor');
    return;
  }

  const recordUsage = async (isError = false) => {
    const common = {
      commandId: command.id,
      commandType: CommandType.SLASH,
      isError,
    };

    // User scope
    await recordCommandUsage(client.db, {
      ...common,
      targetId: interaction.user.id,
      targetType: 'USER',
    });

    // Guild scope
    if (interaction.guildId) {
      await recordCommandUsage(client.db, {
        ...common,
        targetId: interaction.guildId,
        targetType: 'GUILD',
      });
    }

    // Global scope
    if (client.user?.id) {
      await recordCommandUsage(client.db, {
        ...common,
        targetId: client.user.id,
        targetType: 'GLOBAL',
      });
    }
  };

  try {
    await command.execute(client, interaction);
    logger.debug(`❔ | Executed command: ${interaction.commandName}`);
    await recordUsage(false);
  } catch (error) {
    logger.error(
      `❌ | Error executing command: ${interaction.commandName}`,
      error,
    );
    await recordUsage(true);
    await customError(interaction, '304', 'commandExecutor');
  }
  return;
};
