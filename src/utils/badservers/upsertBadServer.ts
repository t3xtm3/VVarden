import { ServerType } from '@prisma/client';
import { Snowflake } from 'discord.js';
import { Bot } from '../../classes';

/**
 * Create a user
 *
 * @export
 * @param {Bot} client
 * @param {Snowflake} id
 * @param {string} name This is the servers name
 * @param {Snowflake} addedBy
 */
export async function upsertBadServer({
    client,
    id,
    name,
    type,
    addedBy,
}: {
    client: Bot;
    id: Snowflake;
    name: string;
    type: ServerType;
    addedBy: Snowflake;
}) {
    return await client.db.badServers.upsert({
        where: {
            id,
        },
        update: {
            name,
            type,
            addedBy,
        },
        create: {
            id,
            name,
            type,
            addedBy,
        },
    });
}
