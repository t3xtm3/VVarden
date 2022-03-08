import { BaseCommandInteraction } from 'discord.js';
import { Bot, SlashCommand } from '../../classes';
import { getGuild } from '../../utils/guild';
import { getProcessState, processInformationMsg } from '../../utils/helpers';
import sendEmbed from '../../utils/messages/sendEmbed';
import { getUser } from '../../utils/users';
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
        });
    }

    public async run(client: Bot, interaction: BaseCommandInteraction): Promise<boolean> {
        if (getProcessState() === 1) {
            processInformationMsg(interaction);
            return false;
        }

        await interaction.guild.members.fetch().then(async () => {
            const settings = await getGuild({
                client,
                id: interaction.guildId,
            });
            if (!settings)
                return client.logger.error(
                    `src/commands/scanusers.ts - Bot is in unknown guild - ${interaction.guildId}`
                );
            sendEmbed({
                interaction,
                embed: {
                    description:
                        "Now scanning users. This may take awhile so be patient.\nBe aware this is resource intensive, and shouldn't be used often.\nAbuse of this command will result in punishment.",
                    color: 0xffff00,
                },
            });

            interaction.guild.members.cache.forEach(async member => {
                const user = await getUser({ client, id: member.id });
                if (!user) return;
                const block = ['blacklisted', 'permblacklisted'];
                if (block.includes(user.status)) {
                    await punishUser({
                        client,
                        member,
                        guildInfo: settings,
                        oldUser: user,
                        toDM: false,
                    });
                }
            });
            return true;
        });

        return true;
    }
}
