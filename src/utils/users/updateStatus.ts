import { UserStatus, UserType } from '@prisma/client';
import { Snowflake } from 'discord.js';
import { Bot } from '../../classes';

/**
 * Updates the users status
 *
 * @param {Bot} client
 * @param {Snowflake} id
 * @param {UserStatus} status
 * @param {UserType} user_type
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
    status: UserStatus;
    user_type?: UserType;
    reason?: string;
}) {
    let data = {
        id,
        status,
        reason,
    };
    if (user_type) data = { ...data, ...{ user_type } };

    return await client.db.users.update({
        where: {
            id,
        },
        data,
    });
}
