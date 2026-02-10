import { Module } from '@nestjs/common';
import { JobController } from './job.controller';
import { BrokerService } from '@shared/broker/services/broker.service';
import { JobService } from './job.service';
import { HttpModule } from '@nestjs/axios';
import { MailModule } from '@features/mail/mail.module';

@Module({
  imports: [HttpModule, MailModule],
  controllers: [JobController],
  providers: [JobService],
})
export class JobModule {
  constructor(private $broker: BrokerService) {}
}
