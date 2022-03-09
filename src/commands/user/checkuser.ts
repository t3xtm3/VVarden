import { BaseCommandInteraction, Snowflake } from 'discord.js';
import { Bot, SlashCommand } from '../../classes';
import sendEmbed from '../../utils/messages/sendEmbed';
import { getUser } from '../../utils/users';

export default class CheckUserCommand extends SlashCommand {
    constructor(client: Bot) {
        super({
            client,
            name: 'checkuser',
            description: 'Check user database status',
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
        });
    }

    public async run(client: Bot, interaction: BaseCommandInteraction): Promise<boolean> {
        const id =
            ((interaction.options.getUser('user')?.id ||
                interaction.options.get('userid')?.value) as Snowflake) ?? interaction.member.user.id;

        await getUser({ client, id })
            .then(async user => {
                if (user.status.includes('BLACKLIST')) {
                    sendEmbed({
                        interaction,
                        embed: {
                            title: ':shield: User Blacklisted',
                            description: `<@${user.id}> has been seen in ${
                                user.servers.split(';').length
                            } bad Discord servers.`,
                            author: {
                                name: user.last_username,
                                icon_url: user.avatar,
                            },
                            thumbnail: {
                                url: user.avatar,
                            },
                            color: 0x800000,
                            fields: [
                                {
                                    name: 'User Information',
                                    value: `**ID**: ${user.id} / **Name**: ${user.last_username}`,
                                },
                                {
                                    name: 'Blacklist Reason',
                                    value: `**User Type**: ${user.user_type}\n**Details**: ${user.reason}`,
                                },
                                {
                                    name: `Added Type: ${user.filter_type.replace('_', '-')}`,
                                    value: `**Date Added**: ${user.updatedAt}`,
                                },
                            ],
                            footer: {
                                text: 'VVarden by Vampire#8144',
                            },
                        },
                    });
                } else {
                    sendEmbed({
                        interaction,
                        embed: {
                            description:
                                ':white_check_mark: UserID not found in Database.\nThey are either fine or not yet listed.',
                            color: 0xffff00,
                        },
                    });
                }
            })
            .catch(async () => {
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
