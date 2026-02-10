import { DatabaseModule } from '@database/database.module';
import { Module } from '@nestjs/common';
import { WorkerController } from './worker.controller';
import { WorkerService } from './worker.service';

@Module({
  imports: [DatabaseModule],
  providers: [WorkerService],
  controllers: [WorkerController],
})
export class WorkerModule {}
