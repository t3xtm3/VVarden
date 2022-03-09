import { BaseCommandInteraction, MessageEmbed, Snowflake } from 'discord.js';
import _ from 'lodash';
import { Bot, SlashCommand } from '../../classes';
import { addBadServer, getAllBadServers, removeBadServer } from '../../utils/badservers';
import { sendEmbed, sendPagination } from '../../utils/messages';

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
                    description: 'Add a server',
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
                    name: 'view',
                    description: 'View all bad servers',
                    options: [],
                },
            ],
            defaultPermission: true,
            staffRole: 'dev',
        });
    }

    public async run(client: Bot, interaction: BaseCommandInteraction): Promise<boolean> {
        const name = interaction.options.data[0]?.name;
        const sid = interaction.options.get('sid')?.value as Snowflake;

        if (name in ['add', 'remove'] && sid.length !== 18) {
            await sendEmbed({
                interaction,
                embed: {
                    description: 'Invalid server id provided',
                    color: 0xffff00,
                },
            });
            return false;
        }

        if (name === 'add') {
            const serverName = interaction.options.get('name')?.value as string;
            await addBadServer({ client, id: sid, name: serverName, addedBy: interaction.user.id })
                .then(() => {
                    sendEmbed({
                        interaction,
                        embed: {
                            description: `Successfully added \`${sid}\` as a bad server`,
                            color: 0x008000,
                        },
                    });
                })
                .catch(() => {
                    sendEmbed({
                        interaction,
                        embed: {
                            description: `The server \`${sid}\` is a bad server already`,
                            color: 0x800000,
                        },
                    });
                });
        } else if (name === 'remove') {
            await removeBadServer({ client, id: sid })
                .then(() => {
                    sendEmbed({
                        interaction,
                        embed: {
                            description: `Successfully removed \`${sid}\` as a bad server`,
                            color: 0x008000,
                        },
                    });
                })
                .catch(() => {
                    sendEmbed({
                        interaction,
                        embed: {
                            description: `The server \`${sid}\` is not listed`,
                            color: 0x800000,
                        },
                    });
                });
        } else if (name === 'view') {
            const badServers = await getAllBadServers({ client });
            const desc: string[] = [];
            badServers.forEach(server => desc.push(`${server.id} | ${server.name}`));

            const chunks = _.chunk(desc, 15);
            const pages: MessageEmbed[] = [];
            chunks.forEach(async chunk => {
                pages.push(
                    new MessageEmbed({
                        author: {
                            name: 'Bad Server Listing',
                            icon_url: interaction.guild.iconURL(),
                        },
                        description: `\`\`\`ID                 | Name\n${chunk.join('\n')}\`\`\``,
                        color: 0xffff00,
                    })
                );
            });
            sendPagination(interaction, pages, 60000);
        }
        return true;
    }
}
