import { BaseCommandInteraction, Snowflake } from 'discord.js';
import { Bot, SlashCommand } from '../classes';
import sendEmbed from '../utils/messages/sendEmbed';
import { getStaffMember } from '../utils/staff';
import { updateStatus } from '../utils/users';

export default class AppealCommand extends SlashCommand {
    constructor(client: Bot) {
        super({
            client,
            name: 'appeal',
            description: 'appeal',
            type: 'CHAT_INPUT',
            options: [
                {
                    type: 6,
                    name: 'user',
                    description: 'Member to appeal',
                    required: true,
                },
            ],
            defaultPermission: true,
            staffRole: 'admin',
        });
    }

    public async run(client: Bot, interaction: BaseCommandInteraction): Promise<boolean> {
        const user = interaction.options.getUser('user');
        const date = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');

        const info = {
            id: user.id,
            reason: `Appealed ${date} - ${interaction.user.username}`,
            status: 'appealed',
            user_type: '',
        };

        await updateStatus({ client, ...info })
            .then(async updated => {
                sendEmbed({
                    interaction,
                    embed: {
                        description: `Updated <@${info.id}> to status \`${info.status}\`, type \`${updated.user_type}\` with reason: \`${info.reason}\``,
                        color: 0x008000,
                    },
                });
                client.emit('logAction', {
                    type: 'APPEAL',
                    author: interaction.user,
                    userID: user.id,
                });
            })
            .catch(() => {
                sendEmbed({
                    interaction,
                    embed: {
                        description:
                            ':white_check_mark: UserID not found in Database.\nThey are either fine or not yet listed.',
                        color: 0xffff00,
                    },
                });
            });

        return true;
    }
}
