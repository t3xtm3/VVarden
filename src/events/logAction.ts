import { TextBasedChannel } from 'discord.js';
import { Bot } from '../classes/Bot';
import sendEmbed from '../utils/messages/sendEmbed';
import { getSettings } from '../utils/settings/getSettings';

export default async function (client: Bot, info: any) {
    const settings = await getSettings({ client });

    if (info.type === 'USER_ADD') {
        const channel = await getChannel(client, settings.addUserLog);
        if (!channel) return false;
        await sendEmbed({
            channel,
            embed: {
                author: {
                    name: `${info.author.username}#${info.author.discriminator}`,
                    icon_url: info.author.displayAvatarURL(),
                },
                description: `${info.author.username}#${info.author.discriminator} added <@${
                    info.userID
                }> (${info.userID}) to the database with: \`\`\`${JSON.stringify(
                    info.details,
                    null,
                    2
                )}\`\`\``,
                color: 0x008000,
            },
        });
        return true;
    } else if (info.type === 'APPEAL') {
        const channel = await getChannel(client, settings.logChannel);
        if (!channel) return false;
        await sendEmbed({
            channel,
            embed: {
                author: {
                    name: `${info.author.username}#${info.author.discriminator}`,
                    icon_url: info.author.displayAvatarURL(),
                },
                description: `${info.author.username}#${info.author.discriminator} appealed <@${info.userID}> (${info.userID})`,
                color: 0x008000,
            },
        });
        return true;
    } else if (info.type === 'STATUS_UPDATE') {
        const channel = await getChannel(client, settings.logChannel);
        if (!channel) return false;
        await sendEmbed({
            channel,
            embed: {
                author: {
                    name: `${info.author.username}#${info.author.discriminator}`,
                    icon_url: info.author.displayAvatarURL(),
                },
                description: `${info.author.username}#${info.author.discriminator} updated status for <@${info.userID}> (${info.userID})\nUser Status: ${info.details.status}\nUser Type: ${info.details.user_type}\nReason: ${info.details.reason}`,
                color: 0x008000,
            },
        });
    }
    return false;
}

async function getChannel(client: Bot, chan: any) {
    const channel = (await client.channels.fetch(chan)) as TextBasedChannel;
    if (!channel) {
        client.logger.error(`src/events/logAction.ts - ${chan} channel not set or found`);
        return false;
    }
    return channel;
}
