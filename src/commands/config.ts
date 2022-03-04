import { Punish } from '.prisma/client';
import { BaseCommandInteraction, Snowflake } from 'discord.js';
import { Bot, SlashCommand } from '../classes';
import { getGuild, updateGuild } from '../utils/guild';
import sendEmbed from '../utils/messages/sendEmbed';

const mainChoices = [
    {
        name: 'BAN',
        value: 'BAN',
    },
    {
        name: 'KICK',
        value: 'KICK',
    },
];

export default class ConfigCommand extends SlashCommand {
    constructor(client: Bot) {
        super({
            client,
            name: 'config',
            description: 'Adjust this Guilds Settings for Warden',
            type: 'CHAT_INPUT',
            options: [
                {
                    type: 1,
                    name: 'view',
                    description: 'View the current configuration',
                    options: [],
                },
                {
                    type: 1,
                    name: 'logchan',
                    description: 'Set the log channel',
                    options: [
                        {
                            type: 7,
                            name: 'channel',
                            description: 'Channel to send all logs to',
                            required: true,
                        },
                    ],
                },
                {
                    type: 1,
                    name: 'punown',
                    description: 'Punish owner',
                    options: [
                        {
                            type: 3,
                            name: 'type',
                            description: 'Type of punishment',
                            choices: [...mainChoices],
                            required: true,
                        },
                    ],
                },
                {
                    type: 1,
                    name: 'punsupp',
                    description: 'Punish supporters',
                    options: [
                        {
                            type: 3,
                            name: 'type',
                            description: 'Type of punishment',
                            choices: [...mainChoices],
                            required: true,
                        },
                    ],
                },
                {
                    type: 1,
                    name: 'punleaker',
                    description: 'Punish leakers',
                    options: [
                        {
                            type: 3,
                            name: 'type',
                            description: 'Type of punishment',
                            choices: [
                                ...mainChoices,
                                ...[
                                    {
                                        name: 'WARN',
                                        value: 'WARN',
                                    },
                                ],
                            ],
                            required: true,
                        },
                    ],
                },
                {
                    type: 1,
                    name: 'puncheat',
                    description: 'Punish cheaters',
                    options: [
                        {
                            type: 3,
                            name: 'type',
                            description: 'Type of punishment',
                            choices: [
                                ...mainChoices,
                                ...[
                                    {
                                        name: 'WARN',
                                        value: 'WARN',
                                    },
                                ],
                            ],
                            required: true,
                        },
                    ],
                },
            ],
            defaultPermission: true,
            permission: 'ADMINISTRATOR',
        });
    }

    public async run(
        client: Bot,
        interaction: BaseCommandInteraction
    ): Promise<boolean> {
        const name = interaction.options.data[0]?.name;
        if (name === 'view') {
            await getGuild({ client, id: interaction.guildId }).then(
                async guildInfo => {
                    sendEmbed({
                        interaction,
                        embed: {
                            title: 'Server Configuration',
                            description:
                                'To change a setting use the config command with one of the options\nFor example: `/config punleak ban`',
                            color: 0x008000,
                            fields: [
                                {
                                    name: 'logchan - Log Channel',
                                    value: `I am using <#${guildInfo.logchan}> for my logs\nThis is where I will post messages about the actions I take.`,
                                    inline: false,
                                },
                                {
                                    name: 'punown - Punish Owners [kick/ban]',
                                    value: `I am set to **${guildInfo.punown}** Leak and Cheat Server Owners\nThese are the Owners and Staff Members of these Discords`,
                                    inline: false,
                                },
                                {
                                    name: 'punsupp - Punish Supporters [kick/ban]',
                                    value: `I am set to **${guildInfo.punsupp}** Leak and Cheat Server Supporters\nThese are Nitro Boosters, Customers, or other types of Donators.`,
                                    inline: false,
                                },
                                {
                                    name: 'punleak - Punish Leakers [warn/kick/ban]',
                                    value: `I am set to **${guildInfo.punleak}** Members of Leaking Discords.\nThese are users with only a Member Role in these servers.`,
                                    inline: false,
                                },
                                {
                                    name: 'puncheat - Punish Cheaters [warn/kick/ban]',
                                    value: `I am set to **${guildInfo.puncheat}** Members of Cheating Discords.\nThese are users with only a Member Role in these servers.`,
                                    inline: false,
                                },
                            ],
                            footer: {
                                text: 'VVarden by Vampire#8144',
                            },
                        },
                    });
                }
            );
        } else if (name === 'logchan') {
            const choice = interaction.options.get('channel').channel.id;
            await updateGuild({
                client,
                id: interaction.guildId,
                logchan: choice,
            });
            sendEmbed({
                interaction,
                embed: {
                    description: `Changed setting \`${name}\` to \`${choice}\``,
                    author: {
                        name: `${interaction.user.username}#${interaction.user.discriminator}`,
                        icon_url: interaction.user.displayAvatarURL(),
                    },
                    color: 0x008000,
                },
            });
        } else if (name.includes('pun')) {
            const choice = interaction.options.get('type').value as Punish;
            if (name === 'punown') {
                await updateGuild({
                    client,
                    id: interaction.guildId,
                    punown: choice,
                });
            } else if (name === 'punsupp') {
                await updateGuild({
                    client,
                    id: interaction.guildId,
                    punsupp: choice,
                });
            } else if (name === 'punleak') {
                await updateGuild({
                    client,
                    id: interaction.guildId,
                    punleak: choice,
                });
            } else if (name === 'puncheat') {
                await updateGuild({
                    client,
                    id: interaction.guildId,
                    puncheat: choice,
                });
            }
            sendEmbed({
                interaction,
                embed: {
                    description: `Changed setting \`${name}\` to \`${choice}\``,
                    author: {
                        name: `${interaction.user.username}#${interaction.user.discriminator}`,
                        icon_url: interaction.user.displayAvatarURL(),
                    },
                    color: 0x008000,
                },
            });
        }
        return true;
    }
}
