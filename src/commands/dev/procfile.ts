import { BaseCommandInteraction, TextBasedChannel, TextChannel } from 'discord.js';
import { Bot, SlashCommand } from '../../classes';
import { getProcessState, processInformationMsg } from '../../utils/helpers';
import { sendEmbed } from '../../utils/messages';
import data from '../../config.json';
import { Colours, UserOptions } from '../../@types';
import { FilterType, UserStatus } from '@prisma/client';
import { getAllUsersByIDs } from '../../utils/users';
import { getGuild } from '../../utils/guild';
import { punishUser } from '../../utils/users/punishUser';

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
        if (getProcessState()) {
            processInformationMsg(interaction);
            return false;
        }

        const chan: TextChannel = ((await client.channels.cache.get(data.CHANNEL_LOG)) ??
            (await client.channels.fetch(data.CHANNEL_LOG))) as TextChannel;

        sendEmbed({
            channel: chan as TextBasedChannel,
            embed: {
                description: `${interaction.user.username}#${interaction.user.discriminator} has started processing imports..`,
                color: Colours.RED,
            },
        });

        const process = client.processing;

        client.processing.setProcessing(1);

        const leakerData = await process.processData('leaker');
        const cheaterData = await process.processData('cheater');
        const resellerData = await process.processData('reseller');
        const allData = [...leakerData, ...cheaterData, ...resellerData];

        const users: UserOptions[] = [];

        await allData.reduce(async (a, server) => {
            await a;
            for await (const user of Object.create(server.data)) {
                users.push({
                    id: user['id'],
                    last_username: `${user['username']}#${user['discriminator']}`,
                    avatar: user['avatar_url'],
                    status: UserStatus.BLACKLIST,
                    user_type: server.type,
                    servers: server.id,
                    roles: user['roles'],
                    filter_type: FilterType.AUTO,
                    reason: 'AUTO: Member of Blacklisted Discord',
                });
            }
        }, Promise.resolve());

        const userIDs = users.map(u => u.id);
        const currentUsers = await getAllUsersByIDs({ client, ids: userIDs });
        // let permblacklisted = 0;

        // await users.reduce(async (a, user) => {
        //     await a;
        //     // Check if is already blacklisted
        //     const found = currentUsers?.find(b => b.id === user.id);
        //     if (found) {
        //         const currServers = found.servers.split(';');
        //         let status;
        //         if (found.status === UserStatus.APPEALED && currServers.includes(user.servers)) {
        //             permblacklisted++;
        //             status = UserStatus.PERM_BLACKLIST;
        //         } else if (found.status === UserStatus.PERM_BLACKLIST) {
        //             status = UserStatus.PERM_BLACKLIST;
        //         } else {
        //             status = UserStatus.BLACKLIST;
        //         }
        //         await client.db.users.update({
        //             where: { id: user.id },
        //             data: {
        //                 roles: combineRoles(found.roles, user.roles).join(';'),
        //                 status,
        //                 servers: currServers.includes(user.servers)
        //                     ? currServers.join(';')
        //                     : currServers.concat([user.servers]).join(';'),
        //             },
        //         });
        //     } else {
        //         await client.db.users
        //             .create({
        //                 data: user,
        //             })
        //             // Update cached current users, otherwise if the user is in two imports can throw error
        //             .then(u => currentUsers.push(u));
        //     }
        // }, Promise.resolve());

        // process.setBlacklisted(users.length - permblacklisted);
        // process.setPermBlacklisted(permblacklisted);
        // process.sendCompletionMsg(interaction, chan);
        client.logger.debug('procfile: Processed all data, now globalFindCheck time :D');

        await client.guilds.fetch();
        await client.guilds.cache.reduce(async (a, guild) => {
            await a;
            await guild.members.fetch();
            const toAction = guild.members.cache.filter(u => userIDs.includes(u.id));
            if (toAction.size >= 1) {
                const settings = await getGuild({ client, id: guild.id });
                await toAction.reduce(async (a, member) => {
                    await a;
                    if (member.user.bot) return;
                    client.logger.debug(
                        `globalFindCheck ${guild.name}: Actioning ${member.user.username}#${member.user.discriminator} (${member.id})`
                    );
                    await punishUser({
                        client,
                        member,
                        oldUser: currentUsers.find(u => u.id === member.id),
                        guildInfo: settings,
                        toDM: false,
                    });
                    await new Promise(resolve => setTimeout(resolve, 50));
                }, Promise.resolve());
                client.logger.debug(`globalFindCheck ${guild.name}: Finished actioning`);
            } else {
                client.logger.debug(`globalFindCheck ${guild.name}: Skipping no one to action`);
            }
        }, Promise.resolve());
        client.logger.debug(
            `globalFindCheck: Finished actioning on all ${client.guilds.cache.size} guilds`
        );

        process.reset();
        return true;
    }
}
