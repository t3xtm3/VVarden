import { Snowflake } from 'discord.js';
import { Bot } from '../../classes';

/**
 * Updates the users status
 *
 * @param {Bot} client
 * @param {Snowflake} id
 * @param {string} status
 * @param {string} user_type
 */
export async function updateStatus({
    client,
    id,
    status,
    user_type,
    reason,
}: {
    client: Bot;
    id: Snowflake;
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
