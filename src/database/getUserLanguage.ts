import { prisma } from ".";

/**
 * Fetches the language setting for a user by their Discord user ID.
 * @param userId - The Discord user ID to fetch the language for.
 * @returns The user's language setting, or a default value if not found.
 */
export async function getUserLanguage(userId: string): Promise<string> {
  try {
    const userSettings = await prisma.userSettings.findUnique({
      where: {
        userId: userId,
      },
      select: {
        language: true,
      },
    });

    if (userSettings) {
      return userSettings.language;
    } else {
      return 'en-US';
    }
  } catch (error) {
    console.error('Error fetching user language:', error);
    return 'en-US';
  }
}
