import { logger } from '@/utils';
import { Client } from 'discord.js';
import fs from 'fs';
import path from 'path';

import { walkDirectory } from './resourceLoader';

/**
 * Loads all events from the events directory and registers them.
 * @param client - The Discord client.
 */
export const loadEvents = async (client: Client): Promise<void> => {
  const eventsPath = path.join(__dirname, '../../events');

  await walkDirectory(eventsPath, async (filePath) => {
    try {
      const event = (await import(filePath)).default;
      if (event && event.name && event.execute) {
        if (event.once) {
          client.once(event.name, event.execute.bind(null, client));
        } else {
          client.on(event.name, event.execute.bind(null, client));
        }
        logger.info(`✅ | Loaded event: ${event.name}`);
      } else {
        logger.warn(
          `⚠️ | Skipping invalid event file: ${path.basename(filePath)}`,
        );
      }
    } catch (err) {
      logger.error(`❌ | Failed to load event at ${filePath}:`, err);
    }
  });
};
