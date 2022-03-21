import { Bot } from '../classes/Bot';

export default async function (client: Bot) {
    client.logger.info('Bot is ready!');

    await client.application.commands.set(client.commands.map(c => c));
}
