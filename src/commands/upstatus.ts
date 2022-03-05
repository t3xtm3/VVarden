import { BaseCommandInteraction } from 'discord.js';
import { Bot, SlashCommand } from '../classes';
import sendEmbed from '../utils/messages/sendEmbed';
import { updateStatus } from '../utils/users';

export default class UpstatusCommand extends SlashCommand {
    constructor(client: Bot) {
        super({
            client,
            name: 'upstatus',
            description: 'Update user status in the database',
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
                {
                    type: 3,
                    name: 'status',
                    description: 'New Status of User',
                    required: false,
                },
                {
                    type: 3,
                    name: 'type',
                    description: 'New User Type',
                    required: false,
                },
                {
                    type: 3,
                    name: 'reason',
                    description: 'Reason for upstatus',
                    required: false,
                },
            ],
            defaultPermission: true,
            staffRole: 'admin',
        });
    }

    public async run(
        client: Bot,
        interaction: BaseCommandInteraction
    ): Promise<boolean> {
        const id = (
            interaction.options.getUser('user')?.id ||
            interaction.options.get('userid')
        )?.toString();

        const status = interaction.options.get('status').value as string;
        const user_type = interaction.options.get('type').value as string;
        const reason = interaction.options.get('reason').value as string;

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

        if (!status || !reason || !user_type) {
            sendEmbed({
                interaction,
                embed: {
                    description: 'You must provided all arguments',
                    color: 0xffff00,
                },
            });
            return false;
        }

        await updateStatus({ client, id, status, user_type, reason })
            .then(() => {
                sendEmbed({
                    interaction,
                    embed: {
                        description: `Updated <@${id}> to status \`${status}\`, type \`${user_type}\` with reason: \`${reason}\``,
                        author: {
                            name: `${interaction.user.username}#${interaction.user.discriminator}`,
                            icon_url: interaction.user.displayAvatarURL(),
                        },
                        color: 0x008000,
                    },
                });
                client.emit('logAction', {
                    type: 'STATUS_UPDATE',
                    author: interaction.user,
                    userID: id,
                    details: {
                        status,
                        user_type,
                        reason,
                    },
                });
            })
            .catch(e => {
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
