import { Bot } from '../../classes';

export async function getGuild({ client, id }: { client: Bot; id: string }) {
    return await client.db.guild.findUnique({
        where: {
            id,
        },
    });
}
