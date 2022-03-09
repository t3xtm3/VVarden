import { EmbedOptions } from '../../@types';

export async function sendEmbed({ interaction, channel, content, embed, components }: EmbedOptions) {
    const options: any = {
        embeds: [{ ...embed }],
        components,
    };

    if (content) options.content = content;
    if (channel) return await channel.send(options);
    else return await interaction.editReply(options);
}
