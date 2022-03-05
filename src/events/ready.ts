import { Bot } from '../classes/Bot';

export default async function (client: Bot) {
    client.logger.info('Bot is ready!');

    client.guilds.cache.forEach(async guild => {
        await guild.commands.fetch();
        const arr = client.commands.map(c => c);
        guild?.commands.set(arr);
    });
}
