import { FilterType, UserStatus, UserType } from '@prisma/client';
import { BaseCommandInteraction, Snowflake, TextBasedChannel, TextChannel } from 'discord.js';
import * as fs from 'fs';
import * as readline from 'readline';
import { Colours } from '../@types';
import { Bot } from '../classes';
import { sendEmbed } from './messages';
import { upsertUser } from './users/upsertUser';
let processState = 0;

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
    return processState;
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
    });
}

export function combineRoles(oldRoles: string, newRoles: string) {
    // Takes a delimited role string and combines it, removing dupes
    const wipOldArr = oldRoles.split(';');
    const wipNewArr = newRoles.split(';');
    const combArr = wipOldArr.concat(wipNewArr.filter(item => wipOldArr.indexOf(item) < 0));

    return combArr;
}

export async function processCSVImport(
    client: Bot,
    interaction: BaseCommandInteraction,
    chan: TextBasedChannel
) {
    try {
        processState = 1;

        processFiles(client, 'leaker', chan).then(ret => {
            processFiles(client, 'cheater', chan).then(retb => {
                sendEmbed({
                    channel: chan,
                    embed: {
                        description: `:shield: Sucessfully completed imports for ${
                            ret?.count + retb?.count
                        } servers.\n+ ${
                            ret?.blacklisted + retb?.blacklisted
                        } users have been added.\n+ ${
                            ret?.permblacklisted + retb?.permblacklisted
                        } users were permanently blacklisted.`,
                        author: {
                            name: `${interaction.user.username}#${interaction.user.discriminator}`,
                            icon_url: interaction.user.displayAvatarURL(),
                        },
                        color: Colours.GREEN,
                    },
                });
                processState = 0;
            });
        });
    } catch (e) {
        console.log(e);
    }
}

async function processFiles(client: Bot, type: string, logChan: TextBasedChannel) {
    const total = { count: 0, blacklisted: 0, permblacklisted: 0 };
    try {
        const dir = fs.readdirSync(`./imports/${type}`);
        if (Array.isArray(dir) && dir.length > 0) {
            for (const filename of dir) {
                const rawServerID = filename.split('-');
                const serverid = rawServerID[3].slice(0, rawServerID[3].length - 4);

                const rl = readline.createInterface({
                    input: fs.createReadStream(`./imports/${type}/${filename}`),
                    crlfDelay: Infinity,
                });

                let blacklisted = 0;
                let permblacklisted = 0;
                total.count++;

                for await (const line of rl) {
                    const lineArr = line.split(',');
                    if (lineArr !== null && lineArr[0] !== 'username') {
                        const newType =
                            type === 'leaker'
                                ? UserType.LEAKER
                                : type === 'cheater'
                                ? UserType.CHEATER
                                : type === 'supporter'
                                ? UserType.SUPPORTER
                                : type === 'owner'
                                ? UserType.OWNER
                                : UserType.LEAKER;
                        await upsertUser({
                            client,
                            id: lineArr[7],
                            avatar: lineArr[2],
                            last_username: `${lineArr[0]}#${lineArr[1]}`,
                            status: UserStatus.BLACKLIST,
                            server: serverid,
                            roles: lineArr[3],
                            user_type: newType,
                            filter_type: FilterType.SEMI_AUTO,
                        }).then((result: any) => {
                            if (Array.isArray(result)) {
                                permblacklisted++;
                                client.logger.debug(
                                    `CSV Import -> Updated status for <@${result[0]}>.\nUser has been permanently blacklisted.`
                                );
                                sendEmbed({
                                    channel: logChan,
                                    embed: {
                                        description: `:shield: Updated status for <@${result[0]}>.\nUser has been permanently blacklisted.`,
                                        color: Colours.RED,
                                    },
                                });
                            } else blacklisted++;
                        });
                    }
                }

                total.blacklisted += blacklisted;
                total.permblacklisted += permblacklisted;

                fs.unlink(`./imports/${type}/${filename}`, err => {
                    if (err) throw err;
                });
                return total;
            }
        }
        return total;
    } catch (e) {
        console.log(e);
        return total;
    }
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
