import { Snowflake } from 'discord.js';
import { Bot } from '../../classes';

/**
 * Anonymise a user
 *
 * @export
 * @param {Bot} client
 * @param {Snowflake} id
 */
export async function anonymiseUser({ client, id }: { client: Bot; id: Snowflake }) {
    return await client.db.users.update({
        where: {
            id,
        },
        data: {
            avatar: 'http://cdn.mk3ext.dev/AqFvdbUWmp.png',
            last_username: 'unknown#0000',
            servers: '860760302227161118',
            roles: '',
        },
    });
}
