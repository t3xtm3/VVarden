import { BaseCommandInteraction } from 'discord.js';
import { Bot, SlashCommand } from '../classes';
import sendEmbed from '../utils/messages/sendEmbed';

export default class InviteCommand extends SlashCommand {
    constructor(client: Bot) {
        super({
            client,
            name: 'invite',
            description: 'Shares the link to invite this bot to your own discord',
            type: 'CHAT_INPUT',
            options: [],
            defaultPermission: true,
        });
    }

    public async run(client: Bot, interaction: BaseCommandInteraction): Promise<boolean> {
        sendEmbed({
            interaction,
            embed: {
                title: 'Invite Me',
                description:
                    'If you would like to invite me to your own discord, please visit this link:\n<https://discord.com/api/oauth2/authorize?client_id=874059310869655662&permissions=8&scope=bot%20applications.commands>\n\nI will need kick and ban permissions as well as a role higher than the users I am acting on.',
                color: 0x008000,
                footer: {
                    text: 'VVarden by Vampire#8144',
                },
            },
        });
        return true;
    }
}
