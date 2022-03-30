import { ServerType } from '@prisma/client';
import { BaseCommandInteraction, MessageEmbed, Snowflake } from 'discord.js';
import _ from 'lodash';
import { Colours } from '../../@types';
import { Bot, SlashCommand } from '../../classes';
import { getAllBadServers, removeBadServer, upsertBadServer } from '../../utils/badservers';
import { enumToMap } from '../../utils/helpers';
import { sendEmbed, sendPagination } from '../../utils/messages';
import { getStaffMember } from '../../utils/staff';

const map = enumToMap(ServerType);
const choices = Array.from(map.entries()).map(m => ({
    name: m[0],
    value: `${m[1]}`,
}));

export default class BadServerCommand extends SlashCommand {
    constructor(client: Bot) {
        super({
            client,
            name: 'badserver',
            description: 'View and Manage Bad Servers',
            type: 'CHAT_INPUT',
            options: [
                {
                    type: 1,
                    name: 'add',
                    description: 'Add or update a server',
                    options: [
                        {
                            type: 3,
                            name: 'sid',
                            description: 'Server ID',
                            required: true,
                        },
                        {
                            type: 3,
                            name: 'name',
                            description: 'Server Name',
                            required: true,
                        },
                        {
                            type: 3,
                            name: 'type',
                            description: 'Server Type',
                            choices,
                            required: true,
                        },
                    ],
                },
                {
                    type: 1,
                    name: 'remove',
                    description: 'Remove a server',
                    options: [
                        {
                            type: 3,
                            name: 'sid',
                            description: 'Server ID',
                            required: true,
                        },
                    ],
                },
                {
                    type: 1,
                    name: 'edit',
                    description: 'Edit a server',
                    options: [
                        {
                            type: 3,
                            name: 'sid',
                            description: 'Server ID',
                            required: true,
                        },
                        {
                            type: 3,
                            name: 'name',
                            description: 'New Name',
                            required: true,
                        },
                    ],
                },
                {
                    type: 1,
                    name: 'view',
                    description: 'View all bad servers',
                    options: [],
                },
            ],
            defaultPermission: true,
        });
    }

    public async run(client: Bot, interaction: BaseCommandInteraction): Promise<boolean> {
        const name = interaction.options.data[0]?.name;
        const sid = interaction.options.get('sid')?.value as Snowflake;

        if (['add', 'remove', 'edit'].includes(name)) {
            const staff = await getStaffMember({ client, id: interaction.user.id });
            if (!(staff && staff['dev' as keyof typeof staff])) {
                const message = '⚠️ You must be a `Bot DEV` to use this command';
                sendEmbed({
                    interaction,
                    embed: {
                        description: message,
                        color: Colours.YELLOW,
                    },
                });
                return false;
            }
        }

        if (['add', 'remove', 'edit'].includes(name) && sid.length !== 18) {
            sendEmbed({
                interaction,
                embed: {
                    description: 'Invalid server id provided',
                    color: 0xffff00,
                },
            });
            return false;
        }

        if (name === 'add') {
            const type = interaction.options.get('type')?.value as ServerType;
            const serverName = interaction.options.get('name')?.value as string;
            upsertBadServer({
                client,
                id: sid,
                name: serverName,
                type,
                addedBy: interaction.user.id,
            })
                .then(() => {
                    sendEmbed({
                        interaction,
                        embed: {
                            description: `Successfully added \`${sid}\` as a bad server`,
                            color: Colours.GREEN,
                        },
                    });
                })
                .catch(() => {
                    sendEmbed({
                        interaction,
                        embed: {
                            description: 'An unknown error has occured',
                            color: Colours.RED,
                        },
                    });
                });
        } else if (name === 'remove') {
            removeBadServer({ client, id: sid })
                .then(() => {
                    sendEmbed({
                        interaction,
                        embed: {
                            description: `Successfully removed \`${sid}\` as a bad server`,
                            color: Colours.GREEN,
                        },
                    });
                })
                .catch(() => {
                    sendEmbed({
                        interaction,
                        embed: {
                            description: `The server \`${sid}\` is not listed`,
                            color: Colours.YELLOW,
                        },
                    });
                });
        } else if (name === 'edit') {
            const newName = interaction.options.get('name')?.value as string;

            client.db.badServers
                .update({
                    where: {
                        id: sid,
                    },
                    data: {
                        name: newName,
                    },
                })
                .then(() => {
                    sendEmbed({
                        interaction,
                        embed: {
                            description: `Successfully updated \`${sid}\``,
                            color: Colours.GREEN,
                        },
                    });
                })
                .catch(() => {
                    sendEmbed({
                        interaction,
                        embed: {
                            description: `The server \`${sid}\` is not listed`,
                            color: Colours.YELLOW,
                        },
                    });
                });
        } else if (name === 'view') {
            const badServers = await getAllBadServers({ client });
            const desc: string[] = [];
            badServers.forEach(server => desc.push(`${server.id} | ${server.name}`));

            const chunks = _.chunk(desc, 15);
            const pages: MessageEmbed[] = [];
            chunks.forEach(chunk => {
                pages.push(
                    new MessageEmbed({
                        author: {
                            name: 'Bad Server Listing',
                            icon_url:
                                interaction.guild?.iconURL() ?? 'http://cdn.mk3ext.dev/vh5NME2rgr.png',
                        },
                        description: `\`\`\`ID                 | Name\n${chunk.join('\n')}\`\`\``,
                        color: Colours.RED,
                    })
                );
            });
            sendPagination(interaction, pages, 60000);
        }
        return true;
    }
}
