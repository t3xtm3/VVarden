import { Guild, Users } from '.prisma/client';
import { GuildMember, TextChannel } from 'discord.js';
import { Bot } from '../../classes';
import sendEmbed from '../messages/sendEmbed';

export async function punishUser({
    client,
    member,
    guildInfo,
    oldUser,
    toDM,
}: {
    client: Bot;
    member: GuildMember;
    guildInfo: Guild;
    oldUser: Users;
    toDM: any;
}) {
    const type = oldUser.user_type as string;
    const count = oldUser.servers.split(';').length;
    let toDo = '';

    if (member.user.bot) return;
    if (toDM) {
        await member
            .createDM(true)
            .then(chan => {
                chan.send({
                    content: `:shield: Warden\nYou are being automodded by ${guildInfo.name} for being associated with ${count} Leaking or Cheating Discord Servers.\nYou may attempt to appeal this via the Official Warden Discord:\nhttps://discord.gg/jeFeDRasfs`,
                });
            })
            .catch(() => {
                const channel = client.channels.cache.get(guildInfo.logchan) as TextChannel;
                sendEmbed({
                    channel,
                    embed: {
                        description: `:warning: Unable to Direct Message User <@${member.id}>`,
                        author: {
                            name: `${member.user.username}#${member.user.discriminator} / ${member.id}`,
                            icon_url: member.user.defaultAvatarURL,
                        },
                        color: 0xffff00,
                    },
                });
            });
    }

    switch (type) {
        case 'owner':
            toDo = guildInfo.punown;
            break;
        case 'supporter':
            toDo = guildInfo.punsupp;
            break;
        case 'leaker':
            toDo = guildInfo.punleak;
            break;
        case 'cheater':
            toDo = guildInfo.puncheat;
            break;
    }
    const channel = ((await client.channels.cache.get(guildInfo.logchan)) ||
        (await client.channels.fetch(guildInfo.logchan))) as TextChannel;

    if (toDo === 'WARN') {
        sendEmbed({
            channel,
            embed: {
                description: `:warning: User <@${member.id}> has been seen in ${count} bad discord servers.\n**User Status**: ${oldUser.status} / **User Type**: ${type}.\n**Details**: ${oldUser.reason}`,
                author: {
                    name: `${member.user.username}#${member.user.discriminator} / ${member.id}`,
                    icon_url: member.user.displayAvatarURL(),
                },
                color: 0x008000,
            },
        }).catch();
    } else {
        const action =
            toDo === 'BAN'
                ? member.ban({ reason: `Warden - User Type ${type}` })
                : member.kick(`Warden - User Type ${type}`);
        action
            .then(() => {
                sendEmbed({
                    channel,
                    embed: {
                        description: `:shield: User <@${member.id}> has been punished with a ${guildInfo.punown} on scan.\nThey have been seen in ${count} bad discord servers.\n**User Status**: ${oldUser.status} / **User Type**: ${type}.\n**Details**: ${oldUser.reason}`,
                        author: {
                            name: `${member.user.username}#${member.user.discriminator} / ${member.id}`,
                            icon_url: member.displayAvatarURL(),
                        },
                        color: 0x008000,
                    },
                });
            })
            .catch(() => {
                sendEmbed({
                    channel,
                    embed: {
                        description: `:warning: I tried to ${guildInfo.punown} <@${member.id}> but something errored!\nPlease verify I have this permission, and am a higher role than this user!`,
                        author: {
                            name: `${member.user.username}#${member.user.discriminator} / ${member.id}`,
                            icon_url: member.displayAvatarURL(),
                        },
                        color: 0x008000,
                    },
                });
            });
    }
}
