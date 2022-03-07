import { FilterType } from '@prisma/client';
import { BaseCommandInteraction, Snowflake } from 'discord.js';
import { Bot, SlashCommand } from '../classes';
import sendEmbed from '../utils/messages/sendEmbed';
import { createUser } from '../utils/users';

export default class AddUserCommand extends SlashCommand {
    constructor(client: Bot) {
        super({
            client,
            name: 'adduser',
            description: 'adduser',
            type: 'CHAT_INPUT',
            options: [
                {
                    type: 3,
                    name: 'id',
                    description: 'User ID',
                    required: true,
                },
                {
                    type: 3,
                    name: 'reason',
                    description: 'Reason for adding user',
                    required: false,
                },
                {
                    type: 3,
                    name: 'server',
                    description: 'Linked Server ID',
                    required: false,
                },
                {
                    type: 3,
                    name: 'status',
                    description: 'Status of User',
                    required: false,
                },
                {
                    type: 3,
                    name: 'type',
                    description: 'User Type',
                    required: false,
                },
            ],
            defaultPermission: true,
            staffRole: 'dev',
        });
    }

    public async run(client: Bot, interaction: BaseCommandInteraction): Promise<boolean> {
        const id = interaction.options.get('id').value as Snowflake;
        const user = await client.users.fetch(id);

        if (!user) {
            await sendEmbed({
                interaction,
                embed: {
                    description: 'Invalid user id provided',
                    color: 0xffff00,
                },
            });
            return false;
        }

        const reason =
            interaction.options.get('reason')?.value.toString() || 'Manual: Member of Blacklisted Discord Server';

        const user_type = interaction.options.get('type')?.value.toString() || 'leaker';
        const status = interaction.options.get('status')?.value.toString() || 'blacklisted';
        const server = (interaction.options.get('server')?.value || interaction.guildId) as Snowflake;

        await createUser({
            client,
            id,
            avatar: user.displayAvatarURL(),
            last_username: `${user.username}#${user.discriminator}`,
            status,
            user_type,
            servers: server,
            reason,
            filter_type: FilterType.MANUAL,
        })
            .then(async () => {
                await sendEmbed({
                    interaction,
                    embed: {
                        description: 'Successfully added user to the database',
                        color: 0x008000,
                    },
                });

                client.emit('logAction', {
                    type: 'USER_ADD',
                    author: interaction.user,
                    userID: id,
                    last_username: user.username,
                    details: { guild: server, reason },
                });
            })
            .catch(async () => {
                sendEmbed({
                    interaction,
                    embed: {
                        description: ':shield: User is already in database\nChange status if nessary using /upstatus',
                        color: 0xffff00,
                    },
                });
            });

        return true;
    }
}
