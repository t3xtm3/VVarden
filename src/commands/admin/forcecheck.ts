import { BaseCommandInteraction, Snowflake } from 'discord.js';
import { Colours } from '../../@types';
import { Bot, SlashCommand } from '../../classes';
import { getGuild } from '../../utils/guild';
import { sendEmbed } from '../../utils/messages';
import { getUser } from '../../utils/users';
import { punishUser } from '../../utils/users/punishUser';

export default class ForceCheckCommand extends SlashCommand {
    constructor(client: Bot) {
        super({
            client,
            name: 'forcecheck',
            description: 'Checks the DB status of a user and global automods if needed',
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

    public async run(client: Bot, interaction: BaseCommandInteraction): Promise<boolean> {
        const id = (interaction.options.getUser('user')?.id ||
            interaction.options.get('userid')?.value) as Snowflake;

        if (!id) {
            sendEmbed({
                interaction,
                embed: {
                    description: 'You must provided either a user or user id',
                    color: Colours.YELLOW,
                },
            });
            return false;
        }

        sendEmbed({
            interaction,
            embed: {
                description: ':white_check_mark: Force checking user..',
                color: Colours.YELLOW,
            },
        });

        const oldUser = await getUser({ client, id });

        const begin = Date.now();
        client.logger.info(`forceCheck ${id}: Starting..`);
        await client.guilds.fetch();
        await client.guilds.cache.reduce(async (a, guild) => {
            await a;
            await guild.members.fetch();
            const member = guild.members.cache.find(m => m.id === id);
            if (member) {
                const settings = await getGuild({ client, id: guild.id });
                await punishUser({
                    client,
                    member,
                    oldUser,
                    guildInfo: settings,
                    toDM: false,
                });
                client.logger.debug(`forceCheck ${id}: Finished actioning ${guild.name}`);
            } else {
                client.logger.debug(`forceCheck ${id}: Skipping ${guild.name} not in guild`);
            }
        }, Promise.resolve());

        const end = Date.now();
        client.logger.info(
            `forceCheck ${id}: Finished actioning on ${client.guilds.cache.size} guilds, took ${
                (end - begin) / 1000
            }s`
        );

        return true;
    }
}
