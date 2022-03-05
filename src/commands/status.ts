import { BaseCommandInteraction } from 'discord.js';
import { Bot, SlashCommand } from '../classes';
import sendEmbed from '../utils/messages/sendEmbed';
import { getAllBlacklisted } from '../utils/users';

export default class StatusCommand extends SlashCommand {
    constructor(client: Bot) {
        super({
            client,
            name: 'status',
            description: 'Shows bot status and stats about its services',
            type: 'CHAT_INPUT',
            options: [],
            defaultPermission: true,
        });
    }

    public async run(
        client: Bot,
        interaction: BaseCommandInteraction
    ): Promise<boolean> {
        const uptime = process.uptime();

        const blacklistedUsers = await getAllBlacklisted({ client });
        sendEmbed({
            interaction,
            embed: {
                title: ':desktop: Bot Status',
                color: 0x008000,
                fields: [
                    {
                        name: 'Shard Count',
                        value: `I am using ${client.shard?.count} Shards`,
                        inline: false,
                    },
                    {
                        name: 'Protected Guilds',
                        value: `I am watching ${client.guilds.cache.size} Guilds`,
                        inline: false,
                    },
                    {
                        name: 'Blacklisted Accounts',
                        value: `I am blocking ${blacklistedUsers} discord accounts`,
                        inline: false,
                    },
                    {
                        name: 'Bot Uptime',
                        value: `I have been up for ${format(uptime)}`,
                        inline: false,
                    },
                    {
                        name: 'Memory Usage',
                        value: `I am currently using ${
                            Math.round(
                                (process.memoryUsage().heapUsed / 1024 / 1024) *
                                    100
                            ) / 100
                        } MB.`,
                        inline: false,
                    },
                ],
                footer: {
                    text: 'VVarden by Vampire#8144',
                },
            },
        });
        return true;
    }
}

function format(seconds: number) {
    const hours = Math.floor(seconds / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    const secs = Math.floor(seconds % 60);
    const time = [];
    if (hours >= 1) time.push(`${hours}h`);
    if (minutes >= 1) time.push(`${minutes}m`);
    if (seconds >= 1) time.push(`${secs}s`);

    return time.join(' ');
}
