import * as winston from 'winston';
import { LeveledLogMethod } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { grey, gray, white } from 'chalk';

const consoleFormat = winston.format.printf(({ level, message, timestamp }) => {
    const opening = gray('[');
    const closing = gray(']');
    const seperator = grey('-');

    return `${opening}${grey(timestamp)}${closing} ${opening}${level}${closing} ${seperator} ${white(`${message}`)}`;
});

const fileFormat = winston.format.printf(({ level, message, timestamp }) => {
    return `[${timestamp}] [${level}] - ${message}`;
});

const customLevels = {
    levels: {
        prisma: 0,
        info: 1,
        debug: 2,
        error: 3,
    },
    colors: {
        prisma: 'blue',
    },
};
winston.addColors(customLevels.colors);
export class Logger {
    logger: winston.Logger;

    info: LeveledLogMethod;
    debug: LeveledLogMethod;
    error: LeveledLogMethod;

    constructor() {
        this.logger = winston.createLogger({
            level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
            levels: customLevels.levels,
            transports: [
                new winston.transports.Console({
                    format: winston.format.combine(
                        winston.format.timestamp({
                            format: 'YYYY-MM-DD HH:mm:ss',
                        }),
                        winston.format.colorize(),
                        winston.format.splat(),
                        consoleFormat
                    ),
                }),
                new DailyRotateFile({
                    filename: 'logs/%DATE%.log',
                    format: winston.format.combine(
                        winston.format.timestamp({
                            format: 'YYYY-MM-DD HH:mm:ss',
                        }),
                        winston.format.splat(),
                        fileFormat
                    ),
                }),
            ],
        });

        this.debug = this.logger.debug.bind(this.logger);
        this.info = this.logger.info.bind(this.logger);
        this.error = this.logger.error.bind(this.logger);
    }

    async prisma(message: any) {
        this.logger.log('prisma', message);
    }
}
