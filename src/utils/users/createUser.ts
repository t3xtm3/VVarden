import { Bot } from '../../classes';

export async function createUser({
    client,
    id,
    status,
    user_type,
    servers,
    reason,
    filter_type,
}: {
    client: Bot;
    id: string;
    status: string;
    user_type: string;
    servers: string;
    reason: string;
    filter_type: string;
}) {
    return await client.db.users.create({
        data: {
            id,
            status,
            user_type,
            servers,
            reason,
            filter_type,
        },
    });
}
