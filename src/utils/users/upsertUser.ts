import { getUser, globalFindCheck, updateStatus } from '.';
import { Bot } from '../../classes';
import { combineRoles } from '../helpers';

export async function upsertUser({
    client,
    id,
    status,
    user_type,
    server,
    roles,
    filter_type,
}: {
    client: Bot;
    id: string;
    status: string;
    user_type: string;
    server: string;
    roles: string;
    filter_type: string;
}) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise<any>(async resolve => {
        const user = await getUser({ client, id });
        if (user) {
            const newRoles = combineRoles(user.roles, roles).join(';');
            console.log(newRoles);
            const spServers = user.servers.split(';');
            if (spServers.includes(server)) {
                if (user.status === 'appealed') {
                    updateStatus({
                        client,
                        id,
                        status: 'permblacklisted',
                    }).then(() => {
                        globalFindCheck({ client, id });
                        resolve([id]);
                    });
                } else resolve(false);
            } else {
                spServers.push(server);

                if (user.status === 'appealed') {
                    await client.db.users
                        .update({
                            where: {
                                id,
                            },
                            data: {
                                servers:
                                    spServers.length > 1 ? spServers.join(';') : spServers.join(''),
                                roles: newRoles,
                                status: 'permblacklisted',
                            },
                        })
                        .then(() => {
                            globalFindCheck({ client, id });
                            resolve([id]);
                        });
                } else {
                    await client.db.users
                        .update({
                            where: {
                                id,
                            },
                            data: {
                                servers:
                                    spServers.length > 1 ? spServers.join(';') : spServers.join(''),
                                roles: newRoles,
                            },
                        })
                        .then(() => {
                            globalFindCheck({ client, id });
                            resolve(false);
                        });
                }
            }
        } else {
            await client.db.users.create({
                data: {
                    id,
                    status,
                    user_type,
                    roles: roles,
                    servers: server,
                    reason: '',
                    filter_type,
                },
            });
            resolve(false);
        }
    });
}
