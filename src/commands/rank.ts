import { BaseCommandInteraction } from 'discord.js';
import { Bot, SlashCommand } from '../classes';
import sendEmbed from '../utils/messages/sendEmbed';
import { getStaffMember } from '../utils/staff';

export default class RankCommand extends SlashCommand {
    constructor(client: Bot) {
        super({
            client,
            name: 'rank',
            description: 'Responds with your bot command rank',
            type: 'CHAT_INPUT',
            options: [],
            defaultPermission: true,
        });
    }

    public async run(client: Bot, interaction: BaseCommandInteraction): Promise<boolean> {
        const staff = await getStaffMember({ client, id: interaction.user.id });
        const member =
            (await interaction.guild.members.cache.get(interaction.user.id)) ||
            (await interaction.guild.members.fetch(interaction.user.id));

        const embed = {
            description: '',
            color: 0x008000,
        };
        if (staff.dev) {
            embed.description = 'Your wish is my command **Bot Owner**!';
        } else if (staff.admin) {
            embed.description = 'Your wish is my command **Bot Admin**!';
        } else if (member.permissions.has('ADMINISTRATOR')) {
            embed.description = 'Your wish is my command **Discord Admin**!';
        } else if (interaction.user.id === '102498921640640512') {
            embed.description = "You're looking great today Leah. Let me know what you need.";
        } else if (interaction.user.id === '160347445711077376') {
            embed.description = 'What is thy bidding, my master?';
        } else {
            embed.description = "You're a **Bot User**";
        }
        embed.description = `<@${interaction.user.id}> ${embed.description}`;
        sendEmbed({ interaction, embed });

        return true;
    }
}
