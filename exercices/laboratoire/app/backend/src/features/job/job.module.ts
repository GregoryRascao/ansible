import { DatabaseModule } from '@database/database.module';
import { WorkflowModule } from '@features/workflow/workflow.module';
import { forwardRef, Module } from '@nestjs/common';
import { JobController } from './job.controller';
import { JobService } from './job.service';

@Module({
  imports: [DatabaseModule, forwardRef(() => WorkflowModule)],
  providers: [JobService],
  exports: [JobService],
  controllers: [JobController],
})
export class JobModule {}
