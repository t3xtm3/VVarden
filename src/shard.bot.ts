import { ShardingManager } from 'discord.js';
import dotenv from 'dotenv';
import { Logger } from './utils/logger';
dotenv.config();

export class Sharding {
    static start(): void {
        // Must be the compiled file
        const manager = new ShardingManager('./build/entry.bot.js', {
            token: process.env.TOKEN,
        });

        const logger = new Logger();

        manager.on('shardCreate', shard => {
            logger.debug(`Launched shard ${shard.id}`);
        });

        manager.spawn();
    }
}
Sharding.start();
