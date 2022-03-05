import { FilterType } from '@prisma/client';
import { BaseCommandInteraction, TextBasedChannel } from 'discord.js';
import * as fs from 'fs';
import * as readline from 'readline';
import { Bot } from '../classes';
import sendEmbed from './messages/sendEmbed';
import { upsertUser } from './users/upsertUser';
let processState = '';

export function combineRoles(oldRoles: string, newRoles: string) {
    // Takes a delimited role string and combines it, removing dupes
    const wipOldArr = oldRoles.split(';');
    const wipNewArr = newRoles.split(';');
    const combArr = wipOldArr.concat(wipNewArr.filter(item => wipOldArr.indexOf(item) < 0));

    return combArr;
}

export function CSVtoArray(text: any) {
    const re_valid =
        /^\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*(?:,\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*)*$/;
    const re_value =
        /(?!\s*$)\s*(?:'([^'\\]*(?:\\[\S\s][^'\\]*)*)'|"([^"\\]*(?:\\[\S\s][^"\\]*)*)"|([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*))\s*(?:,|$)/g;

    // Return NULL if input string is not well formed CSV string.
    if (!re_valid.test(text)) return null;

    const a = []; // Initialize array to receive values.
    text.replace(
        re_value, // "Walk" the string using replace with callback.
        (m0: any, m1: any, m2: any, m3: any) => {
            // Remove backslash from \' in single quoted values.
            if (m1 !== undefined) a.push(m1.replace(/\\'/g, "'"));
            // Remove backslash from \" in double quoted values.
            else if (m2 !== undefined) a.push(m2.replace(/\\"/g, '"'));
            else if (m3 !== undefined) a.push(m3);
            return ''; // Return empty string.
        }
    );

    // Handle special case of empty last value.
    if (/,\s*$/.test(text)) a.push('');
    return a;
}

export async function processCSVImport(
    client: Bot,
    interaction: BaseCommandInteraction,
    chan: TextBasedChannel
) {
    try {
        processState = 'import';

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
                        color: 0x008000,
                    },
                });
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
                    const lineArr = CSVtoArray(line);
                    if (lineArr !== null && lineArr[0] !== 'username') {
                        await upsertUser({
                            client,
                            id: lineArr[7],
                            status: 'blacklisted',
                            server: serverid,
                            roles: lineArr[3],
                            user_type: type,
                            filter_type: FilterType.SEMI_AUTO,
                        }).then((result: any) => {
                            if (Array.isArray(result)) {
                                permblacklisted++;
                                client.logger.debug(
                                    `:shield: Updated status for <@${result[0]}>.\nUser has been permanently blacklisted.`
                                );
                                sendEmbed({
                                    channel: logChan,
                                    embed: {
                                        description: `:shield: Updated status for <@${result[0]}>.\nUser has been permanently blacklisted.`,
                                        color: 0x800000,
                                    },
                                });
                            } else blacklisted++;
                        });
                    }
                }

                total.blacklisted += blacklisted;
                total.permblacklisted += permblacklisted;

                client.logger.debug('Completed user imports');

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
