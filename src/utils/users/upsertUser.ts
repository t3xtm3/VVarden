import { FilterType, UserStatus, UserType } from '@prisma/client';
import { getUser, globalFindCheck, updateStatus } from '.';
import { Bot } from '../../classes';
import { combineRoles } from '../helpers';

/**
 * Upserts a user in the database
 * from importing a csv file
 *
 * @param {Bot} client
 * @param {Snowflake} id
 * @param {string} avatar
 * @param {string} last_username
 * @param {string} status
 * @param {string} user_type
 * @param {string} server
 * @param {string} roles
 * @param {FilterType} filter_type
 */
export async function upsertUser({
    client,
    id,
    avatar,
    last_username,
    status,
    user_type,
    server,
    roles,
    filter_type,
}: {
    client: Bot;
    id: string;
    avatar: string;
    last_username: string;
    status: UserStatus;
    user_type: UserType;
    server: string;
    roles: string;
    filter_type: FilterType;
}) {
    const user = await getUser({ client, id });
    if (user) {
        const newRoles = combineRoles(user.roles, roles).join(';');
        const spServers = user.servers.split(';');
        if (spServers.includes(server)) {
            if (user.status === UserStatus.APPEALED) {
                updateStatus({
                    client,
                    id,
                    status: UserStatus.PERM_BLACKLIST,
                }).then(() => {
                    globalFindCheck({ client, id });
                    return [id];
                });
            } else return false;
        } else {
            spServers.push(server);

            await client.db.users
                .update({
                    where: {
                        id,
                    },
                    data: {
                        servers: spServers.length > 1 ? spServers.join(';') : spServers.join(''),
                        roles: newRoles,
                        status:
                            user.status === UserStatus.APPEALED
                                ? UserStatus.PERM_BLACKLIST
                                : user.status,
                    },
                })
                .then(() => {
                    globalFindCheck({ client, id });
                    return user.status === UserStatus.APPEALED ? [id] : false;
                });
        }
    } else {
        await client.db.users.create({
            data: {
                id,
                avatar,
                last_username,
                status,
                user_type,
                roles: roles,
                servers: server,
                reason: '',
                filter_type,
            },
        });
        return false;
    }
    return false;
}
