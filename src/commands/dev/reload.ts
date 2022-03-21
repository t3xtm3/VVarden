import { BaseCommandInteraction } from 'discord.js';
import { Bot, SlashCommand } from '../../classes';
import { getProcessState, processInformationMsg } from '../../utils/helpers';

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

        // client.commands.sweep(() => true);
        // await client.loadCommands(__dirname + '/commands');
        return true;
    }
}
