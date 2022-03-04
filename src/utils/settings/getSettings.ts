import { Bot } from '../../classes';

export async function getSettings({ client }: { client: Bot }) {
    return await client.db.settings.findUnique({
        where: {
            id: 1,
        },
    });
}
