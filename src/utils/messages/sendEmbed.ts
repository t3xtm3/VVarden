import { EmbedOptions } from '../../@types';

export async function sendEmbed({ interaction, channel, content, embed, components }: EmbedOptions) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const options: any = {
        embeds: [{ ...embed }],
        components,
    };

    if (content) options.content = content;
    if (channel) return await channel.send(options);
    else {
        if (!interaction.deferred) await interaction.deferReply();
        return await interaction.editReply(options);
    }
}
