import { Guild, GuildMember } from 'discord.js';
import { Bot } from '../classes/Bot';
import { getGuild } from '../utils/guild';
import { getUser } from '../utils/users';
import { punishUser } from '../utils/users/punishUser';

export default async function (client: Bot, guild: Guild, member: GuildMember) {
    const settings = await getGuild({ client, id: guild.id });

    if (!settings) {
        client.logger.error(`src/events/guildMemberAdd.ts - Bot is in unknown guild - ${guild.id}`);
        return false;
    }

    const user = await getUser({ client, id: member.id });

    if (!user) return false;

    // Dynamically set this in future?
    const block = ['blacklisted', 'permblacklisted'];
    if (block.includes(user.status)) {
        await punishUser({
            client,
            member,
            guildInfo: settings,
            oldUser: user,
            toDM: true,
        });
        return true;
    }

    return false;
}
