import dotenv from 'dotenv';
dotenv.config();

import * as prisma from '@prisma/client';

import { Intents } from 'discord.js';
import { Bot } from './classes/Bot';
import { Logger } from './utils/logger';

const logger = new Logger();
export const db = new prisma.PrismaClient({
    log: [
        {
            emit: 'event',
            level: 'query',
        },
        {
            emit: 'event',
            level: 'error',
        },
        {
            emit: 'event',
            level: 'info',
        },
        {
            emit: 'event',
            level: 'warn',
        },
    ],
});

const client = new Bot(logger, db, {
    intents: new Intents(32767),
    partials: ['CHANNEL', 'REACTION', 'USER', 'GUILD_MEMBER', 'MESSAGE'],
});

(async () => {
    await client.loadEvents(__dirname + '/events');
    await client.loadCommands(__dirname + '/commands');
    await client.login(process.env.TOKEN);
})();

process.on('unhandledRejection', (err: any) => {
    console.log(`Unhandled Promise Rejection\n\n${err.stack}`);
});

/**
 * Database events
 */

db.$on('info', (e: any) => {
    client.logger.prisma(e);
});

db.$use(async (params, next) => {
    const before = Date.now();
    const result = await next(params);
    if (params.action === 'findUnique') return result;
    const after = Date.now();
    client.logger.prisma(`Query - ${params.model}.${params.action} took ${after - before}ms`);

    return result;
});

db.$on('warn', (e: any) => {
    client.logger.prisma(e);
});

db.$on('error', (e: any) => {
    client.logger.prisma(e);
});

export { client };
