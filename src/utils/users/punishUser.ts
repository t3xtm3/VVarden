import { Guild, Users } from '.prisma/client';
import { GuildMember, TextChannel } from 'discord.js';
import { Colours } from '../../@types';
import { Bot } from '../../classes';
import { getChannelByID } from '../helpers';
import { sendEmbed } from '../messages';

/**
 * Punishes user in a guild with
 * approiate actions where configured
 *
 * @param {Bot} client
 * @param {GuildMember} member
 * @param {Guild} guildInfo
 * @param {Users} oldUser
 * @param {boolean} toDM
 */
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
    toDM: boolean;
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
                    content: `:shield: Warden
                    You are being automodded by ${guildInfo.name} for being associated with ${count} Leaking or Cheating Discord Servers.
                    You may attempt to appeal this via the Official Warden Discord:
                    https://discord.gg/jeFeDRasfs`,
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
                        color: Colours.RED,
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
    const cachedChannel = client.logChans.get(guildInfo.id);
    const channel =
        cachedChannel.id === guildInfo.logchan
            ? cachedChannel
            : await getChannelByID(client, guildInfo.logchan, true, guildInfo.id);

    if (toDo === 'WARN') {
        sendEmbed({
            channel,
            embed: {
                description: `:warning: User ${oldUser.last_username} (${member.id}) has been seen in ${count} bad discord servers.
                **User Status**: ${oldUser.status} / **User Type**: ${type}.
                **Details**: ${oldUser.reason}`,
                author: {
                    name: `${member.user.username}#${member.user.discriminator} / ${member.id}`,
                    icon_url: member.user.displayAvatarURL(),
                },
                color: Colours.GREEN,
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
                        description: `:shield: User ${oldUser.last_username} (${member.id}) has been punished with a ${guildInfo.punown} on scan.
                        They have been seen in ${count} bad discord servers.
                        **User Status**: ${oldUser.status} / **User Type**: ${type}.
                        **Details**: ${oldUser.reason}`,
                        author: {
                            name: `${member.user.username}#${member.user.discriminator} / ${member.id}`,
                            icon_url: member.displayAvatarURL(),
                        },
                        color: Colours.GREEN,
                    },
                });
            })
            .catch(() => {
                sendEmbed({
                    channel,
                    embed: {
                        description: `:warning: I tried to ${guildInfo.punown} ${oldUser.last_username} (${member.id}) but something errored!
                        Please verify I have this permission, and am a higher role than this user!`,
                        author: {
                            name: `${member.user.username}#${member.user.discriminator} / ${member.id}`,
                            icon_url: member.displayAvatarURL(),
                        },
                        color: Colours.RED,
                    },
                });
            });
    }
}
