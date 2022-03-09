import { BaseCommandInteraction, TextBasedChannel } from 'discord.js';
import { Bot, SlashCommand } from '../../classes';
import { getProcessState, processCSVImport, processInformationMsg } from '../../utils/helpers';
import { sendEmbed } from '../../utils/messages';
import data from '../../config.json';

export default class ProcfileCommand extends SlashCommand {
    constructor(client: Bot) {
        super({
            client,
            name: 'procfile',
            description: 'Process and Import User files',
            type: 'CHAT_INPUT',
            options: [],
            defaultPermission: true,
            staffRole: 'dev',
        });
    }

    public async run(client: Bot, interaction: BaseCommandInteraction): Promise<boolean> {
        if (getProcessState() === 1) {
            processInformationMsg(interaction);
            return false;
        }

        const chan =
            (await client.channels.cache.get(data.CHANNEL_LOG)) ??
            (await client.channels.fetch(data.CHANNEL_LOG));

        await sendEmbed({
            channel: chan as TextBasedChannel,
            embed: {
                description: `${interaction.user.username}#${interaction.user.discriminator} has started processing imports..`,
                color: 0x800000,
            },
        });

        await processCSVImport(client, interaction, chan as TextBasedChannel);
        return true;
    }
}
