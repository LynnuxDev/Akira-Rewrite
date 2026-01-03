import fs from 'fs';
import path from 'path';
import { logger } from '@/utils';

/**
 * Recursively walks a directory and executes a callback for each valid file.
 * @param dir - The directory to walk.
 * @param callback - The callback to execute for each file path.
 */
export async function walkDirectory(
  dir: string,
  callback: (filePath: string) => Promise<void>,
): Promise<void> {
  if (!fs.existsSync(dir)) {
    logger.warn(`⚠️ | Directory not found: ${dir}`);
    return;
  }

  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      await walkDirectory(fullPath, callback);
    } else if (
      (file.endsWith('.ts') || file.endsWith('.js')) &&
      !file.startsWith('_') &&
      !file.endsWith('.d.ts')
    ) {
      await callback(fullPath);
    }
  }
}
