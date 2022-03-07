import { FilterType } from '@prisma/client';
import { Bot } from '../../classes';

export async function createUser({
    client,
    id,
    avatar,
    last_username,
    status,
    user_type,
    servers,
    reason,
    filter_type,
}: {
    client: Bot;
    id: string;
    avatar: string;
    last_username: string;
    status: string;
    user_type: string;
    servers: string;
    reason: string;
    filter_type: FilterType;
}) {
    return await client.db.users.create({
        data: {
            id,
            avatar,
            last_username,
            status,
            user_type,
            servers,
            reason,
            filter_type,
        },
    });
}
