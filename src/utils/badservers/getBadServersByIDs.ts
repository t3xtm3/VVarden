import { Bot } from '../../classes';

export async function getBadServersByIDs({ client, ids }: { client: Bot; ids: any }) {
    return await client.db.badServers.findMany({
        where: {
            id: {
                in: ids,
            },
        },
    });
}
