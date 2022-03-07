import { Bot } from '../../classes';

export async function anonymiseUser({ client, id }: { client: Bot; id: string }) {
    return await client.db.users.update({
        where: {
            id,
        },
        data: {
            avatar: 'https://cpng.pikpng.com/pngl/s/264-2647034_superhero-mask-free-printable-aqua-incredibles-2-mask.png',
            last_username: 'unknown#0000',
            servers: '860760302227161118',
            roles: '',
        },
    });
}
