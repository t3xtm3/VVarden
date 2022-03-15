import { UserStatus } from '@prisma/client';
import { Bot } from '../../classes';

/**
 * Returns all blacklisted and permblacklisted users
 *
 * @export
 * @param {Bot} client
 */
export async function getAllBlacklisted({ client }: { client: Bot }) {
    return await client.db.users.findMany({
        where: {
            status: {
                in: [UserStatus.BLACKLIST, UserStatus.PERM_BLACKLIST],
            },
        },
    });
}
