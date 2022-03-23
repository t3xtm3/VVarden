import * as fs from 'fs';
import * as fastCsv from 'fast-csv';
import { UserType } from '@prisma/client';
import { Colours, ServerDataOptions } from '../@types';
import { sendEmbed } from '../utils/messages';
import { BaseCommandInteraction, TextChannel } from 'discord.js';

export class Processing {
    processState: number;
    serverCount: number;
    blacklisted: number;
    permblacklisted: number;

    constructor() {
        this.processState = 0;
        this.serverCount = 0;
        this.blacklisted = 0;
        this.permblacklisted = 0;
    }

    isProcessing() {
        return this.processState === 1;
    }

    setProcessing(int: number) {
        this.processState = int;
    }

    setBlacklisted(int: number) {
        this.blacklisted = int;
    }

    setPermBlacklisted(int: number) {
        this.permblacklisted = int;
    }

    reset() {
        this.serverCount = 0;
        this.processState = 0;
    }

    getServerCount() {
        return this.serverCount;
    }

    getFiles(type: string) {
        try {
            const dir = fs.readdirSync(`./imports/${type}`);
            return dir;
        } catch (e) {
            console.log(e);
            return [];
        }
    }

    csvToObject(path: string) {
        return new Promise(resolve => {
            const rows: any[] = [];
            fs.createReadStream(path)
                .pipe(fastCsv.parse({ headers: true }))
                .on('error', (error: any) => console.error(error))
                .on('data', (row: any) => {
                    rows.push(row);
                })
                .on('end', () => {
                    resolve(rows);
                });
        });
    }

    sendCompletionMsg(interaction: BaseCommandInteraction, chan: TextChannel) {
        sendEmbed({
            channel: chan,
            embed: {
                description: `:shield: Sucessfully completed imports for ${this.getServerCount()} servers.\n+ ${
                    this.blacklisted
                } users have been added.\n+ ${this.permblacklisted} users were permanently blacklisted.`,
                author: {
                    name: `${interaction.user.username}#${interaction.user.discriminator}`,
                    icon_url: interaction.user.displayAvatarURL(),
                },
                color: Colours.GREEN,
            },
        });
    }

    async processData(type: string): Promise<ServerDataOptions[]> {
        const dir = await this.getFiles(type);
        if (!dir) {
            return [];
        }
        const serverData: ServerDataOptions[] = [];
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

        for await (const filename of dir) {
            const rawServerID = filename.split('-');
            const serverid = rawServerID[3].slice(0, rawServerID[3].length - 4);

            const filePath = `./imports/${type}/${filename}`;
            const readStream = await this.csvToObject(filePath);
            this.serverCount += 1;

            serverData.push({ id: serverid, type: newType, data: readStream });
        }

        return serverData;
    }
}
