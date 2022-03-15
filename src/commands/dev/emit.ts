import { BaseCommandInteraction, TextBasedChannel } from 'discord.js';
import { Bot, SlashCommand } from '../../classes';
import { getProcessState, processCSVImport, processInformationMsg } from '../../utils/helpers';
import { sendEmbed } from '../../utils/messages';
import data from '../../config.json';
import { Colours } from '../../@types';

export default class EmitCommand extends SlashCommand {
    constructor(client: Bot) {
        super({
            client,
            name: 'emit',
            description: 'Emit a certain event',
            type: 'CHAT_INPUT',
            options: [
                {
                    type: 3,
                    name: 'event',
                    description: 'Event to emit',
                    choices: [
                        {
                            name: 'guildMemberAdd',
                            value: 'guildMemberAdd',
                        },
                    ],
                    required: true,
                },
            ],
            defaultPermission: true,
            staffRole: 'dev',
        });
    }

    public async run(client: Bot, interaction: BaseCommandInteraction): Promise<boolean> {
        const emit = interaction.options.get('event')?.value as string;

        await sendEmbed({
            interaction,
            embed: {
                description: `Emitted ${emit}`,
                color: Colours.YELLOW,
            },
        });

        const member = await interaction.guild.members.fetch(interaction.user.id);
        await client.emit(emit, interaction.guild, member);

        return true;
    }
}
