import { BaseCommandInteraction, Snowflake } from 'discord.js';
import { Bot, SlashCommand } from '../classes';
import { getBadServersByIDs } from '../utils/badservers';
import sendEmbed from '../utils/messages/sendEmbed';
import { getStaffMember } from '../utils/staff';
import { getUser } from '../utils/users';

export default class CheckUserAdminCommand extends SlashCommand {
    constructor(client: Bot) {
        super({
            client,
            name: 'checkuseradmin',
            description: 'Check user database status as an admin',
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

    public async run(
        client: Bot,
        interaction: BaseCommandInteraction
    ): Promise<boolean> {
        const id = (
            interaction.options.getUser('user')?.id ||
            interaction.options.get('userid')
        )?.toString();

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

        const discordUser =
            (await client.users.cache.get(id)) ||
            (await client.users.fetch(id));

        await getUser({ client, id })
            .then(async user => {
                const roles =
                    user.roles !== ''
                        ? user.roles.split(';').join(',\n')
                        : 'None';

                const ids = user.servers.split(';');

                const badServers = await getBadServersByIDs({
                    client,
                    ids,
                });

                const notBad = badServers.filter(i => ids.includes(i.id));
                const badNames = badServers.map(i => i.name);

                sendEmbed({
                    interaction,
                    embed: {
                        title: ':shield: User In Database',
                        description: `<@${user.id}> has been seen in ${
                            user.servers.split(';').length
                        } bad Discord servers.`,
                        author: {
                            name: discordUser.username,
                            icon_url: discordUser.displayAvatarURL(),
                        },
                        thumbnail: { url: discordUser.displayAvatarURL() },
                        color: 0xffff00,
                        fields: [
                            // Array of field objects
                            {
                                name: 'User Information', // Field
                                value: `**ID**: ${user.id} / **Name**: ${discordUser.username}`,
                                inline: false, // Whether you want multiple fields in same line
                            },
                            {
                                name: 'Known Discord Roles',
                                value: roles.substring(0, 1024),
                                inline: false,
                            },
                            {
                                name: 'Known Servers',
                                value:
                                    badNames.length > 0
                                        ? badNames
                                              .join(',\n')
                                              .substring(0, 1024)
                                        : 'None',
                                inline: false,
                            },
                            {
                                name: 'Database Information',
                                value: `**User Status**: ${user.status}\n**User Type**: ${user.user_type}\n**Details**: ${user.reason}`,
                                inline: false,
                            },
                            {
                                name: `Added Type: ${user.filter_type}`,
                                value: `**Date Added**: ${user.createdAt
                                    .toISOString()
                                    .replace(/T/, ' ')
                                    .replace(/\..+/, '')}`,
                                inline: false,
                            },
                        ],
                        footer: {
                            text: 'VVarden by Vampire#8144',
                        },
                    },
                });
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
