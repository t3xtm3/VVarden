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

    if (!user) return false;

    if (user.status.includes('BLACKLIST')) {
        // User is blacklisted
        await Promise.all(
            (
                await client.guilds.fetch()
            ).map(async (_, guildID) => {
                const guild = client.guilds.cache.get(guildID);
                const member = (await guild.members.cache.get(id)) || (await guild.members.fetch(id));
                if (member) {
                    const settings = await getGuild({ client, id: guild.id });
                    await punishUser({
                        client,
                        member,
                        guildInfo: settings,
                        oldUser: user,
                        toDM: false,
                    });
                }
            })
        );
    }
    return true;
}
