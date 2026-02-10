import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { HttpModule } from '@nestjs/axios';
import { EnvModule } from '@config/env/env.module';

@Module({
  imports: [HttpModule, EnvModule],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
