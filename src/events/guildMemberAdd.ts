import { UserStatus, UserType } from '@prisma/client';
import { GuildMember } from 'discord.js';
import { Bot } from '../classes/Bot';
import { getGuild } from '../utils/guild';
import { getUser } from '../utils/users';
import { punishUser } from '../utils/users/punishUser';
import data from '../config.json';

export default async function (client: Bot, member: GuildMember) {
    const guild = member.guild;
    const settings = await getGuild({ client, id: guild.id });

    if (!settings) {
        client.logger.error(
            `CRITICAL: GUILD HAS NO SETTINGS ${guild.name} ${guild.id} - OWNER: ${member.guild.ownerId}`
        );
        return false;
    }

    const user = await getUser({ client, id: member.id });
    if (!user) {
        return false;
    }

    if (
        guild.id === data.MAIN_GUILD &&
        user.user_type !== UserType.SUPPORTER &&
        user.user_type !== UserType.OWNER
    )
        return false;

    // Dynamically set this in future?
    if (user.status === UserStatus.BLACKLIST || user.status === UserStatus.PERM_BLACKLIST) {
        client.logger.debug(`guildMemberAdd ${guild.name}: ${member.id} - ${user.status}`);
        punishUser({
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
