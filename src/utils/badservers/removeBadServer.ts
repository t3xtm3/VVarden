import { Snowflake } from 'discord.js';
import { Bot } from '../../classes';

/**
 * Create a user
 *
 * @export
 * @param {Bot} client
 * @param {Snowflake} id
 */
export async function removeBadServer({ client, id }: { client: Bot; id: Snowflake }) {
    return await client.db.badServers.delete({
        where: {
            id,
        },
    });
}
