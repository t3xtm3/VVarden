import { Bot } from '../../classes';

export async function getABGuilds({ client }: { client: Bot }) {
    return await client.db.guild.findMany({
        where: {
            appealunban: {
                equals: true,
            },
        },
    });
}
