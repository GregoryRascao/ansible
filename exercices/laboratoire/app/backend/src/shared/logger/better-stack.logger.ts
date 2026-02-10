import { Logtail } from '@logtail/node';
import { LogtailTransport } from '@logtail/winston';
import { utilities, WinstonModule } from 'nest-winston';
import { format, transports } from 'winston';

export enum LogLevel {
  EMERGENCY = 'emerg',
  ALERT = 'alert',
  CRITICAL = 'crit',
  ERROR = 'error',
  WARNING = 'warn',
  NOTICE = 'notice',
  INFO = 'info',
  DEBUG = 'debug',
}

export interface BetterStackLoggerOptions {
  logLevel?: LogLevel;
  sourceToken: string;
  endpoint: string;
}

export const betterStackLogger = (
  appName: string,
  options: BetterStackLoggerOptions,
) => {
  const logtail = new Logtail(options.sourceToken, {
    endpoint: `https://${options.endpoint}`,
  });

  if (!options.logLevel) {
    options.logLevel = LogLevel.WARNING;
  }

  const consoleFormat = format.combine(
    format.timestamp(),
    format.ms(),
    utilities.format.nestLike(appName, { colors: true, prettyPrint: true }),
  );

  const logger = WinstonModule.createLogger({
    transports: [
      new transports.Console({ format: consoleFormat }),
      new LogtailTransport(logtail, {
        level: options.logLevel,
      }),
    ],
  });

  return logger;
};
