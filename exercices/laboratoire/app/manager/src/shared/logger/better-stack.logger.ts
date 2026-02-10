import { Logtail } from '@logtail/node';
import { format, transports } from 'winston';
import { LogtailTransport } from '@logtail/winston';
import { utilities, WinstonModule } from 'nest-winston';

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
      new transports.Console({
        format: consoleFormat,
        level:
          process.env.NODE_ENV === 'production'
            ? LogLevel.WARNING
            : LogLevel.DEBUG,
      }),
      new LogtailTransport(logtail, {
        format: consoleFormat,
        level: options.logLevel,
      }),
    ],
  });

  return logger;
};
