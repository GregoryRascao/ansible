import { z } from 'zod';
import { LogLevel } from '@shared/logger/better-stack.logger';

export const EnvSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'acceptance'])
    .default('development'),
  ALLOW_ORIGINS: z.string(),

  WAVES_BACK: z.string(),

  BROKER_URI: z.hostname().or(z.ipv4()).or(z.ipv6()),
  BROKER_USERNAME: z.string(),
  BROKER_PASSWORD: z.string(),
  BROKER_VHOST: z.string().default('/'),
  BROKER_TOKEN: z.string(),

  BETTER_STACK_TOKEN: z.string(),
  BETTER_STACK_ENDPOINT: z.string(),
  BETTER_STACK_LOG_LEVEL: z
    .enum(['debug', 'info', 'warn', 'error'])
    .default(LogLevel.WARNING),

  KEEPALIVE_INTERVAL: z
    .string()
    .transform((str) => parseInt(str))
    .default(5),
});

export type Env = z.infer<typeof EnvSchema>;
