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
            user_type: {
                in: ['blacklisted', 'permblacklisted'],
            },
        },
    });
}
