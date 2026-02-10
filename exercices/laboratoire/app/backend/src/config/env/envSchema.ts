import { z } from 'zod';
import { LogLevel } from '@shared/logger/better-stack.logger';

export const EnvSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'acceptance'])
    .default('development'),
  ALLOW_ORIGINS: z.string(),
  WORKERS_MANAGER_SERVICE_URL: z.string(),

  MONGODB_URI: z.string().optional(),
  MONGODB_HOST: z.string().optional(),
  MONGODB_PORT: z.number().optional(),
  MONGODB_USERNAME: z.string().optional(),
  MONGODB_PASSWORD: z.string().optional(),
  MONGODB_DATABASE: z.string().optional(),
  MONGODB_AUTH_SOURCE: z.string().optional(),

  BETTER_STACK_TOKEN: z.string(),
  BETTER_STACK_ENDPOINT: z.string(),
  BETTER_STACK_LOG_LEVEL: z
    .enum(['debug', 'info', 'warn', 'error'])
    .default(LogLevel.WARNING),

  KEYCLOAK_REALM: z.string(),
  KEYCLOAK_CLIENT_ID: z.string(),
  KEYCLOAK_AUTH_SERVER_URL: z.string(),
  KEYCLOAK_SECRET: z.string(),
});

export type Env = z.infer<typeof EnvSchema>;
