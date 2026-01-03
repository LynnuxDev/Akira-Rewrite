import { ExtendedClient } from '@/types/extendedClient';
import fs from 'fs';
import path from 'path';
import { logger } from '@/utils';

import { walkDirectory } from './resourceLoader';

/**
 * Loads all loops from the loops directory and starts them.
 * @param client - The extended Discord client.
 */
export const loadLoops = async (client: ExtendedClient): Promise<void> => {
  const loopsPath = path.join(__dirname, '../../loops');

  await walkDirectory(loopsPath, async (filePath) => {
    try {
      const loop = (await import(filePath)).default;

      if (loop && typeof loop === 'function') {
        logger.info(`✅ | Loaded loop: ${path.basename(filePath)}`);
        loop(client);
      } else {
        logger.warn(
          `⚠️ | Skipping invalid loop file: ${path.basename(filePath)}`,
        );
      }
    } catch (err) {
      logger.error(`❌ | Failed to load loop at ${filePath}:`, err);
    }
  });
};
