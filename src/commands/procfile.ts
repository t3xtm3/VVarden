import { BaseCommandInteraction, TextBasedChannel } from 'discord.js';
import { Bot, SlashCommand } from '../classes';
import { processCSVImport } from '../utils/helpers';
import sendEmbed from '../utils/messages/sendEmbed';
import { getSettings } from '../utils/settings/getSettings';

export default class ProcfileCommand extends SlashCommand {
    constructor(client: Bot) {
        super({
            client,
            name: 'procfile',
            description: 'Process and Import User files',
            type: 'CHAT_INPUT',
            options: [],
            defaultPermission: true,
        });
    }

    public async run(client: Bot, interaction: BaseCommandInteraction): Promise<boolean> {
        const settings = await getSettings({ client });
        const chan =
            (await client.channels.cache.get(settings.logChannel)) ??
            (await client.channels.fetch(settings.logChannel));

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
