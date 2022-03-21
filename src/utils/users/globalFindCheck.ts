import { Snowflake } from 'discord.js';
import { Bot } from '../../classes';
import { getGuild } from '../guild';
import { punishUser } from './punishUser';

/**
 * Loops over all discords which the
 * bot is in and punshes user where needed
 *
 * @export
 * @param {Bot} client
 * @param {id} Snowflake
 */
export async function globalFindCheck({ client, id }: { client: Bot; id: Snowflake }) {
    const user = await client.db.users.findUnique({
        where: {
            id,
        },
    });

    if (!user) {
        client.logger.debug(`globalFindCheck: ${id} not in database`);
        return false;
    }

    if (user.status.includes('BLACKLIST')) {
        // User is blacklisted
        await client.guilds.fetch();
        await client.guilds.cache.reduce(async (a, guild) => {
            await a;
            await guild.members
                .fetch(id)
                .then(async member => {
                    client.logger.debug(`globalFindCheck: Found ${member.id} in discord: ${guild.name}`);
                    const settings = await getGuild({ client, id: guild.id });
                    await punishUser({
                        client,
                        member,
                        guildInfo: settings,
                        oldUser: user,
                        toDM: false,
                    });
                    return true;
                })
                .catch(() => {
                    return false;
                });
        }, Promise.resolve());
    }
    return true;
}
