import { BaseCommandInteraction } from 'discord.js';
import { Bot, SlashCommand } from '../classes';
import sendEmbed from '../utils/messages/sendEmbed';
import { assignAdmin, removeAdmin } from '../utils/staff';

export default class AdminCommand extends SlashCommand {
    constructor(client: Bot) {
        super({
            client,
            name: 'admin',
            description: 'Manage Bot Admins',
            type: 'CHAT_INPUT',
            options: [
                {
                    type: 1,
                    name: 'add',
                    description: 'Add a Bot Admin',
                    options: [
                        {
                            type: 6,
                            name: 'user',
                            description: 'User',
                            required: true,
                        },
                    ],
                },
                {
                    type: 1,
                    name: 'remove',
                    description: 'Remove a Bot Admin',
                    options: [
                        {
                            type: 6,
                            name: 'user',
                            description: 'User',
                            required: true,
                        },
                    ],
                },
            ],
            defaultPermission: true,
            staffRole: 'dev',
        });
    }

    public async run(client: Bot, interaction: BaseCommandInteraction): Promise<boolean> {
        const name = interaction.options.data[0]?.name;
        const id = interaction.options.getUser('user').id;

        if (name === 'add') {
            await assignAdmin({ client, id }).then(() => {
                sendEmbed({
                    interaction,
                    embed: {
                        description: `Successfully added <@${id}>`,
                        color: 0x008000,
                    },
                });
                return true;
            });
        } else if (name === 'remove') {
            await removeAdmin({ client, id })
                .then(() => {
                    sendEmbed({
                        interaction,
                        embed: {
                            description: `Successfully removed <@${id}>`,
                            color: 0x008000,
                        },
                    });
                    return true;
                })
                .catch(() => {
                    sendEmbed({
                        interaction,
                        embed: {
                            description: '❌ That user is not an admin',
                            color: 0x800000,
                        },
                    });
                    return false;
                });
        }

        return true;
    }
}
