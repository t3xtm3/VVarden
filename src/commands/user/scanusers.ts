import { BaseCommandInteraction } from 'discord.js';
import { Colours } from '../../@types';
import { Bot, SlashCommand } from '../../classes';
import { getGuild } from '../../utils/guild';
import { getProcessState, processInformationMsg } from '../../utils/helpers';
import { sendEmbed } from '../../utils/messages';
import { getAllBlacklisted } from '../../utils/users';
import { punishUser } from '../../utils/users/punishUser';

export default class ScanUsers extends SlashCommand {
    constructor(client: Bot) {
        super({
            client,
            name: 'scanusers',
            description: 'Scans your discord users and punishes them if blacklisted',
            type: 'CHAT_INPUT',
            options: [],
            defaultPermission: true,
            permission: 'ADMINISTRATOR',
            cooldown: 3600,
        });
    }

    public async run(client: Bot, interaction: BaseCommandInteraction): Promise<boolean> {
        if (getProcessState() === 1) {
            processInformationMsg(interaction);
            return false;
        }

        const begin = Date.now();
        await interaction.guild.members.fetch().then(async () => {
            const settings = await getGuild({
                client,
                id: interaction.guildId,
            });
            if (!settings) {
                client.logger.error(
                    `src/commands/scanusers.ts - Bot is in unknown guild - ${interaction.guildId}`
                );
                return false;
            }
            sendEmbed({
                interaction,
                embed: {
                    description:
                        "Now scanning users. This may take awhile so be patient.\nBe aware this is resource intensive, and shouldn't be used often.\nAbuse of this command will result in punishment.",
                    color: Colours.YELLOW,
                },
            });

            // Reduce database calls from one per member to one
            // Bulk grab all blacklisted then check if exists
            // Rather than checking database per member
            const ids = interaction.guild.members.cache.map(u => u.id);
            const users = await getAllBlacklisted({ client, ids });
            users.forEach(async user => {
                await punishUser({
                    client,
                    member: interaction.guild.members.cache.get(user.id),
                    guildInfo: settings,
                    oldUser: user,
                    toDM: false,
                }).catch(e => console.log(e));
            });
            sendEmbed({
                channel: interaction.channel,
                embed: {
                    description: 'Scanning completed',
                    color: Colours.GREEN,
                },
            }).catch(e => console.log(e));

            const end = Date.now();
            client.logger.debug(`scanUsers ${interaction.guild.name}: Ran in ${(end - begin) / 1000}s`);
            return true;
        });

        return true;
    }
}
