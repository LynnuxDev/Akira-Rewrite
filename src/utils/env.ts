import { z } from 'zod';
import { logger } from './logger';

const envSchema = z.object({
  AKIRA_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  // Database
  DATABASE: z.string().default('database/akira.db'),

  // Server
  PORT: z
    .string()
    .default('3000')
    .transform((v) => Number(v)),

  // Discord bot
  DISCORD_CLIENT_ID: z.string(),
  DISCORD_BOT_TOKEN: z.string(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const errors = z.flattenError(parsed.error).fieldErrors;
  logger.error('❌ Invalid environment variables:');

  Object.entries(errors).forEach(([key, msgs]) => {
    msgs?.forEach((msg) => {
      logger.error(`  • ${key}: ${msg}`);
    });
  });

  process.exit(1);
}

export const env = parsed.data as z.infer<typeof envSchema>;
