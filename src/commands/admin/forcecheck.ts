import { BaseCommandInteraction, Snowflake } from 'discord.js';
import { Bot, SlashCommand } from '../../classes';
import { sendEmbed } from '../../utils/messages';
import { globalFindCheck } from '../../utils/users';

export default class ForceCheckCommand extends SlashCommand {
    constructor(client: Bot) {
        super({
            client,
            name: 'forcecheck',
            description: 'Checks the DB status of a user and global automods if needed',
            type: 'CHAT_INPUT',
            options: [
                {
                    type: 3,
                    name: 'userid',
                    description: 'User ID to check',
                    required: false,
                },
                {
                    type: 6,
                    name: 'user',
                    description: 'User Mention to check',
                    required: false,
                },
            ],
            defaultPermission: true,
            staffRole: 'admin',
        });
    }

    public async run(client: Bot, interaction: BaseCommandInteraction): Promise<boolean> {
        const id = (interaction.options.getUser('user')?.id ||
            interaction.options.get('userid')?.value) as Snowflake;

        if (!id) {
            sendEmbed({
                interaction,
                embed: {
                    description: 'You must provided either a user or user id',
                    color: 0xffff00,
                },
            });
            return false;
        }

        await globalFindCheck({ client, id });
        sendEmbed({
            interaction,
            embed: {
                description: ':white_check_mark: Force checking user..',
                color: 0x008000,
            },
        });

        return true;
    }
}
