import { BaseCommandInteraction, Snowflake } from 'discord.js';
import { Bot, SlashCommand } from '../classes';
import sendEmbed from '../utils/messages/sendEmbed';

export default class AboutCommand extends SlashCommand {
    constructor(client: Bot) {
        super({
            client,
            name: 'about',
            description: 'Information about this bot, its purpose, and author',
            type: 'CHAT_INPUT',
            options: [],
            defaultPermission: true,
        });
    }

    public async run(
        client: Bot,
        interaction: BaseCommandInteraction
    ): Promise<boolean> {
        sendEmbed({
            interaction,
            embed: {
                title: 'About Me',
                description:
                    "Hello, my name is VVarden!\nYou can call me Warden or 5 Warden (V Warden).\n\nI was created by Vampire#8144 in an effort to combat the prevalence of pirated code and cheating in the FiveM community, commonly called 'leaks' and 'hacks/cheats'.\n\nI am the frontend for a database of users in Leaking and Cheating Discord servers, with settings to prevent those users from entering your discord server.\n\nYou can join the Official Discord for more information: <https://discord.gg/jeFeDRasfs>",
                color: 0x008000,
                footer: {
                    text: 'VVarden by Vampire#8144',
                },
            },
        });
        return true;
    }
}
