import { Module } from '@nestjs/common';
import { PluginController } from './plugin.controller';
import { PluginService } from './plugin.service';
import { MailModule } from '@features/mail/mail.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [MailModule, HttpModule],
  controllers: [PluginController],
  providers: [PluginService],
})
export class PluginModule {}
