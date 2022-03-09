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
export async function addBadServer({
    client,
    id,
    name,
    addedBy,
}: {
    client: Bot;
    id: Snowflake;
    name: string;
    addedBy: Snowflake;
}) {
    return await client.db.badServers.create({
        data: {
            id,
            name,
            addedBy,
        },
    });
}
