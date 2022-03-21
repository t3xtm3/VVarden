import { Bot } from '../classes/Bot';

export default async function (client: Bot) {
    client.logger.info('Bot is ready!');

    const arr = client.commands.map(c => c);
    client.application.commands
        .set(arr)
        .then(() => client.logger.info('Loaded successfully'))
        .catch(e => console.log(e));
}
