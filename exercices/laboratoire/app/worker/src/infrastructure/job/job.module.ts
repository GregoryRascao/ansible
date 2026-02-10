import { forwardRef, Module } from '@nestjs/common';
import { JobExecutorService } from './job-executor.service';
import { PluginModule } from '../plugin/plugin.module';

@Module({
  imports: [forwardRef(() => PluginModule)],
  providers: [JobExecutorService],
  exports: [JobExecutorService],
})
export class JobModule {}
