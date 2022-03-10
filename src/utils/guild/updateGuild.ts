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
}: {
    client: Bot;
    id: string;
    name?: string;
    logchan?: string;
    punown?: Punish;
    puncheat?: Punish;
    punleak?: Punish;
    punsupp?: Punish;
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
