// import { UserType } from '.prisma/client';
import { ApplicationCommandDataResolvable } from 'discord.js';
import { Bot } from '../classes/Bot';
import { createGuild } from '../utils/guild';

export default async function (client: Bot) {
    client.logger.info('Bot is ready!');

    client.guilds.cache.forEach(async guild => {

        const users = guild.members.cache
            .filter(user => !user.user.bot)
            .map(user => user);

        await guild.commands.fetch();
        const arr = client.commands.map(c => c)
        guild?.commands.set(arr)

        // users.forEach(async (user) => {
        //     createUser({client, user: user.id, userType: UserType.ADMIN})
        // })
    })
}
