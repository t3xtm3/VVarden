import { Guild, TextChannel } from 'discord.js';
import { Bot } from '../classes/Bot';
import { createGuild } from '../utils/guild';
import sendEmbed from '../utils/messages/sendEmbed';

export default async function (client: Bot, guild: Guild) {
    // Invited to New Guild
    client.logger.info(`Joined new guild ${guild.name} with ${guild.memberCount} members.`);

    const channel = (await guild.channels.fetch(guild.systemChannelId)) as TextChannel;
    await createGuild({ client, guild, logchan: guild.systemChannelId });

    if (channel) {
        sendEmbed({
            channel,
            embed: {
                title: `Hello ${guild.name}!`,
                description: `My name is VVarden!\nYou can call me Warden or 5 Warden (V Warden).\n\nThank you for inviting me to your Discord Server!\nI'm trying to make the CFX Community a better place.\n\nMake sure to check my configuration settings by using \`/config\` command!\nI also need to have the permissions to kick and ban members, with a role higher than them!\n\nI'm already acting on new member joins.
                \nIf you want to contribute to the project, use the Official Discord: <https://discord.gg/jeFeDRasfs>`,
                color: 0x008000,
                footer: {
                    text: 'VVarden by Vampire#8144',
                },
            },
        });
    }
}
