import { BaseCommandInteraction, Snowflake } from 'discord.js';
import { Colours } from '../../@types';
import { Bot, SlashCommand } from '../../classes';
import { sendEmbed } from '../../utils/messages';

export default class CheckServerCommand extends SlashCommand {
    constructor(client: Bot) {
        super({
            client,
            name: 'checkserver',
            description: 'Check if a server is bad',
            type: 'CHAT_INPUT',
            options: [
                {
                    type: 3,
                    name: 'id',
                    description: 'Server ID to check',
                    required: true,
                },
            ],
            defaultPermission: true,
        });
    }

    public async run(client: Bot, interaction: BaseCommandInteraction): Promise<boolean> {
        const sid = interaction.options.get('id')?.value as Snowflake;

        if (sid.length !== 18) {
            sendEmbed({
                interaction,
                embed: {
                    description: 'Invalid server id provided',
                    color: Colours.YELLOW,
                },
            });
            return false;
        }

        client.db.badServers
            .findFirst({ where: { id: sid } })
            .then(server => {
                sendEmbed({
                    interaction,
                    embed: {
                        title: ':shield: Server Blacklisted',
                        color: Colours.RED,
                        fields: [
                            {
                                name: 'Server Information',
                                value: `**ID**: ${server.id} / **Name**: ${server.name}\n
                                **Details**: ${server.type.toLowerCase()}\n
                                **Date Added**: ${server.createdAt
                                    .toISOString()
                                    .replace(/T/, ' ')
                                    .replace(/\..+/, '')}\n
                                **Added By**: ${server.addedBy}`,
                            },
                        ],
                    },
                });
            })
            .catch(() => {
                sendEmbed({
                    interaction,
                    embed: {
                        description: ':white_check_mark: Server ID not found in Database.',
                        color: Colours.YELLOW,
                    },
                });
            });

        return true;
    }
}
