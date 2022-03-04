import { Bot } from '../../classes';

export async function updateStatus({
    client,
    id,
    status,
    user_type,
    reason,
}: {
    client: Bot;
    id: string;
    status: string;
    user_type?: string;
    reason?: string;
}) {
    let data = {
        id,
        status,
        reason,
    };
    if (user_type !== '') data = { ...data, ...{ user_type } };

    return await client.db.users.update({
        where: {
            id,
        },
        data,
    });
}
