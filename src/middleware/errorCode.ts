import { EmbedBuilder } from 'discord.js';
import rawErrorData from '../../static/errors.json';

interface DataFormat {
  code: number;
  comment?: string;
  from: string;
  meaning: string;
  embed: {
    title: string[];
    description: string;
    color?: string;
    footer?: string;
    ephemeral?: boolean;
    showTimestamp?: boolean;
  };
}

const errorData: Record<number, DataFormat> = rawErrorData;

/**
 * Retrieves error information by errorCode and constructs a Discord EmbedBuilder with the error details.
 * 
 * @param code - The numeric error code to look up in the error data.
 * @returns An object containing:
 *    - `embed`: The Discord EmbedBuilder object with the error message ready to send,
 *    - `data`: The raw error data including metadata such as 'ephemeral' and 'showTimestamp' flags,
 *              or `null` if the error code is not found.
 */
export function errorCode(code: number): { embed: EmbedBuilder; data: DataFormat } | null {
  const data = errorData[code];
  if (!data) return null;

  const titleArray = data.embed?.title || [];
  const title = titleArray.length > 0 ? titleArray[Math.floor(Math.random() * titleArray.length)] : undefined;

  const colorHex = (data.embed?.color || 'd50056').replace(/^#/, '');
  const embed = new EmbedBuilder()
    .setTitle(title ?? `Error ${code}`)
    .setDescription(data.embed?.description || 'No additional info.')
    .setColor(parseInt(colorHex, 16))
    .setFooter({ text: data.embed?.footer || `Akira | Error ${code}` });

  if (data.embed?.showTimestamp ?? true) {
    embed.setTimestamp();
  }

  return {
    embed,
    data: {
      ...data,
      code,
    }
  };
}

