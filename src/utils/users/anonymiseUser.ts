import { Bot } from '../../classes';

export async function anonymiseUser({
    client,
    id,
}: {
    client: Bot;
    id: string;
}) {
    return await client.db.users.update({
        where: {
            id,
        },
        data: {
            servers: '860760302227161118',
            roles: '',
        },
    });
}
