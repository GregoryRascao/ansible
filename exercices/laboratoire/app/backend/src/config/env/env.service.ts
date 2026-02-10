import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Env } from '@config/env/envSchema';

@Injectable()
export class EnvService {
  constructor(private readonly $config: ConfigService<Env, true>) {}

  get<T extends keyof Env>(key: T) {
    return this.$config.get(key, { infer: true });
  }
}
