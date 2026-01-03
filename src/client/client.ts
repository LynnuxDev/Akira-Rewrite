import { ExtendedClient } from '@/types/extendedClient';
import { GatewayIntentBits, Partials } from 'discord.js';
import { logger } from '@/utils';
import {
  loadButtons,
  loadLoops,
  loadCommands,
  loadEvents,
  loadModals,
} from './handler/index';
import { runMigrations } from '@/database';

const client = new ExtendedClient({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [
    Partials.Channel,
    Partials.GuildMember,
    Partials.User,
    Partials.ThreadMember,
    Partials.Reaction,
    Partials.Message,
    Partials.GuildScheduledEvent,
  ],
});

(async () => {
  try {
    await runMigrations(client.db);
    await loadEvents(client);
    await loadCommands(client);
    await loadButtons(client);
    await loadLoops(client);
    await loadModals(client);
    logger.info('🤖 | Bot initialization complete');
  } catch (err) {
    logger.fatal('❌ | Failed to initialize bot:', err);
    process.exit(1);
  }
})();

client.login(client.env.DISCORD_BOT_TOKEN).catch((error) => {
  logger.error('Failed to log in:', error);
});
