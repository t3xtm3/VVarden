import { Guild } from 'discord.js';
import { Bot } from '../../classes';

export async function createGuild({
    client,
    guild,
    logchan,
}: {
    client: Bot;
    guild: Guild;
    logchan: string;
}) {
    return await client.db.guild.upsert({
        where: {
            id: guild.id,
        },
        update: {
            name: guild.name,
        },
        create: {
            id: guild.id,
            name: guild.name,
            logchan,
        },
    });
}
