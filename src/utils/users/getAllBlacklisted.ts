import { Bot } from '../../classes';

export async function getAllBlacklisted({ client }: { client: Bot }) {
    return await client.db.users.count({
        where: {
            status: {
                in: ['blacklisted', 'permblacklisted'],
            },
        },
    });
}
