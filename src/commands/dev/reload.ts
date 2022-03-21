import { BaseCommandInteraction } from 'discord.js';
import { Bot, SlashCommand } from '../../classes';
import { getProcessState, processInformationMsg } from '../../utils/helpers';
import * as simpleGit from 'simple-git';
import path from 'path';

import glob from 'glob';
import { promisify } from 'util';
const globPromise = promisify(glob);
export default class ProcfileCommand extends SlashCommand {
    constructor(client: Bot) {
        super({
            client,
            name: 'reload',
            description: 'Reload the bot',
            type: 'CHAT_INPUT',
            options: [],
            defaultPermission: true,
            staffRole: 'dev',
        });
    }

    /**
     * WIP
     */
    public async run(client: Bot, interaction: BaseCommandInteraction): Promise<boolean> {
        if (getProcessState() === 1) {
            processInformationMsg(interaction);
            return false;
        }

        const progress = ({ method, stage, progress }: simpleGit.SimpleGitProgressEvent) => {
            console.log(`reload: git ${method} ${stage} stage ${progress}% complete`);
        };

        const baseDir = path.join(__dirname, '../../../');
        const git = simpleGit.default({ baseDir, progress });
        await git.checkout('ts-refactor');
        await git.pull();

        client.commands.sweep(() => true);
        const commandFiles = await globPromise(`${path.join(__dirname, '../../commands')}/*/*{.ts,.js}`);
        for (const filePath of commandFiles) {
            const commandFile = require(filePath);
            const command = new commandFile.default(this);

            if (!command.name) return false;
            client.commands.set(command.name, command);
        }
        return true;
    }
}
