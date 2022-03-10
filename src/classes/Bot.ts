import * as fs from 'fs/promises';
import * as path from 'path';
import { Client, ClientOptions, Collection, Snowflake, TextChannel } from 'discord.js';
import { SlashCommand } from './SlashCommand';
import { Logger } from '../utils/logger';
import { PrismaClient } from '@prisma/client';
import glob from 'glob';
import { promisify } from 'util';
const globPromise = promisify(glob);

/**
 * Custom bot class
 */
class Bot extends Client {
    logger: Logger;
    db: PrismaClient;

    /**
     * Collection for bot commands
     */
    commands: Collection<string, SlashCommand>;

    /**
     * Collection for all events
     */
    events: Collection<string, Event>;

    /**
     * Collection for caching guild log channels
     */
    logChans: Collection<Snowflake, TextChannel>;

    /**
     * Collection for command cooldown registration.
     */
    cooldowns: Collection<string, Collection<string, number>>;

    constructor(logger: Logger, db: PrismaClient, options: ClientOptions) {
        super(options);

        this.commands = new Collection();
        this.events = new Collection();
        this.logChans = new Collection();
        this.cooldowns = new Collection();
        this.logger = logger;
        this.db = db;
    }

    async loadCommands(dir: string): Promise<void> {
        const commandFiles = await globPromise(`${dir}/*/*{.ts,.js}`);
        for (const filePath of commandFiles) {
            const commandFile = await require(filePath);
            const command = new commandFile.default(this);

            if (!command.name) return;
            this.commands.set(command.name, command);
            this.logger.debug(`Loaded command: ${command.name}`);
        }

        this.logger.info('Registering commands');
    }

    async loadEvents(dir: string): Promise<void> {
        const items = await fs.readdir(dir);

        for (let i = 0; i < items.length; i++) {
            const item = items[i];

            const eventFile = require(path.join(dir, item));
            this.on(item.split('.')[0], eventFile.default.bind(null, this));
        }
    }

    /**
     * Returns timestamps of the command.
     * @param commandName Name of the command
     */
    getCooldownTimestamps(commandName: string): Collection<string, number> {
        if (!this.cooldowns.has(commandName))
            this.cooldowns.set(commandName, new Collection<string, number>());
        return this.cooldowns.get(commandName) as Collection<string, number>;
    }
}

export { Bot };
