import { BaseCommandInteraction, Snowflake, TextChannel } from 'discord.js';
import { Bot } from '../classes';
import { client } from '../entry.bot';
import { sendEmbed } from './messages';

export async function getChannelByID(
    client: Bot,
    channel: Snowflake,
    cache: boolean,
    guildID: Snowflake
) {
    const chan = ((await client.channels.cache.get(channel)) ||
        (await client.channels.fetch(channel))) as TextChannel;
    if (cache) client.logChans.set(guildID, chan);
    return chan;
}

export function getProcessState() {
    return client.processing.isProcessing();
}

export function processInformationMsg(interaction: BaseCommandInteraction) {
    sendEmbed({
        interaction,
        embed: {
            description: 'This command is currently disabled while VVarden processes new information.',
            author: {
                name: `${interaction.user.username}#${interaction.user.discriminator}`,
                icon_url: interaction.user.displayAvatarURL(),
            },
            color: 0xffff00,
        },
    }).catch();
}

export function combineRoles(oldRoles: string, newRoles: string) {
    // Takes a delimited role string and combines it, removing dupes
    const wipOldArr = oldRoles.split(';');
    const wipNewArr = newRoles.split(';');
    const combArr = wipOldArr.concat(wipNewArr.filter(item => wipOldArr.indexOf(item) < 0));

    return combArr;
}

export function enumToMap(enumeration: any): Map<string, string | number> {
    const map = new Map<string, string | number>();
    for (const key in enumeration) {
        //TypeScript does not allow enum keys to be numeric
        if (!isNaN(Number(key))) continue;

        const val = enumeration[key] as string | number;

        //TypeScript does not allow enum value to be null or undefined
        if (val !== undefined && val !== null) map.set(key, val);
    }

    return map;
}
