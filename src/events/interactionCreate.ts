// import { ChannelType, LogType } from '@prisma/client';
import { BaseCommandInteraction } from 'discord.js';
import { Bot } from '../classes/Bot';
import { sendEmbed } from '../utils/messages';
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
            if (staff && staff[slashCommand.staffRole as keyof typeof staff]) has = true;
            else
                message = `⚠️ You must be a \`Bot ${slashCommand.staffRole.toUpperCase()}\` to use this command`;
        } else if (slashCommand.permission) {
            if (interaction.memberPermissions.has(slashCommand.permission)) has = true;
            else
                message = `⚠️ You lack the \`${slashCommand.permission}\` permission to use this command`;
        } else has = true;

        if (has && slashCommand.cooldown) {
            const now = Date.now();
            const timestamps = client.getCooldownTimestamps(slashCommand.name);
            const cooldownAmount = slashCommand.cooldown ? slashCommand.cooldown * 1000 : 0;
            if (timestamps.has(interaction.user.id)) {
                const currentTime = timestamps.get(interaction.user.id);
                if (currentTime) {
                    const expiration = currentTime + cooldownAmount;

                    if (now < expiration) {
                        const timeLeft = (expiration - now) / 1000;
                        has = false;
                        message = `⏰ You must wait \`${Math.floor(timeLeft)}s\` to use this comand`;
                    }
                }
            } else {
                timestamps.set(interaction.user.id, now);
                setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
            }
        }

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
