import { Bot } from '../classes/Bot';

export default async function (client: Bot) {
    client.logger.info('Bot is ready!');

    await Promise.all(
        client.guilds.cache.map(async guild => {
            await guild.commands.fetch();
            const arr = client.commands.map(c => c);
            guild?.commands.set(arr);
        })
    );

    // client.guilds.cache.forEach(async guild => {
    //     await guild.commands.fetch();
    //     const arr = client.commands.map(c => c);
    //     guild?.commands.set(arr);
    // });
}
