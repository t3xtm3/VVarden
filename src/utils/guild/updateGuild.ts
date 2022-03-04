import { Punish } from '.prisma/client';
import { Bot } from '../../classes';

export async function updateGuild({
    client,
    id,
    name,
    logchan,
    punown,
    puncheat,
    punleak,
    punsupp,
    data,
}: {
    client: Bot;
    id: string;
    name?: string;
    logchan?: string;
    punown?: Punish;
    puncheat?: Punish;
    punleak?: Punish;
    punsupp?: Punish;
    data?: any;
}) {
    return await client.db.guild.update({
        where: {
            id: id,
        },
        data: {
            name,
            logchan,
            punown,
            puncheat,
            punleak,
            punsupp,
        },
        select: null,
    });
}
