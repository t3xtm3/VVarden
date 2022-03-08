// import { ChannelType, LogType } from '@prisma/client';
import { BaseCommandInteraction } from 'discord.js';
import { Bot } from '../classes/Bot';
import sendEmbed from '../utils/messages/sendEmbed';
import { getStaffMember } from '../utils/staff';

export default async function (client: Bot, interaction: BaseCommandInteraction) {
    if (interaction.isCommand()) {
        const slashCommand = client.commands.find(c => c.name === interaction.commandName);
        if (!slashCommand) {
            await interaction.reply({
                content: 'An error has occurred',
                ephemeral: true,
            });
            return false;
        }
        let has;
        let message;
        if (slashCommand.staffRole) {
            const staff = await getStaffMember({ client, id: interaction.user.id });
            if (staff[slashCommand.staffRole as keyof typeof staff]) has = true;
            else
                message = `You must be a \`Bot ${slashCommand.staffRole.toUpperCase()}\` to use this command`;
        } else if (slashCommand.permission) {
            if (interaction.memberPermissions.has(slashCommand.permission)) has = true;
            else message = `You lack the \`${slashCommand.permission}\` permission to use this command`;
        } else has = true;

        await interaction.deferReply();
        if (has) await slashCommand.run(client, interaction);
        else {
            sendEmbed({
                interaction,
                embed: {
                    description: message,
                    color: 0xffff00,
                },
            });
        }
    }
    return true;
}
