import { Bot } from '../../classes';

export async function getUser({ client, id }: { client: Bot; id: string }) {
    return await client.db.users.findUnique({
        where: {
            id,
        },
    });
}
