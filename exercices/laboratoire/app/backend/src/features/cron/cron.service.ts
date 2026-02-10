import { Injectable, Logger } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { format } from 'date-fns';

@Injectable()
export class CronService {
  constructor(private readonly $schedulerRegistry: SchedulerRegistry) {}

  isCronJobExists(name: string): boolean {
    try {
      this.$schedulerRegistry.getCronJob(name);
      return true;
    } catch (error) {
      return false;
    }
  }

  createCronJob(name: string, cronExpression: string, callback: () => void) {
    const cronJob = new CronJob(cronExpression, callback);
    this.$schedulerRegistry.addCronJob(name, cronJob);

    Logger.log(
      `Next execution for Job "${name}" @ : ${format(cronJob.nextDate().toJSDate(), 'dd/MM/yyyy HH:mm:ss')}`,
      CronService.name,
    );

    return cronJob;
  }

  async startCronJob(
    name: string,
    cronExpression: string,
    callback: () => void,
  ) {
    const cronJob = this.$schedulerRegistry.getCronJob(name);
    await cronJob.stop();

    this.$schedulerRegistry.deleteCronJob(name);
    const newCronJob = this.createCronJob(name, cronExpression, callback);
    newCronJob.start();
  }

  async deleteCronJob(name: string): Promise<boolean> {
    try {
      const cronJob = this.$schedulerRegistry.getCronJob(name);
      await cronJob.stop();

      this.$schedulerRegistry.deleteCronJob(name);

      Logger.log(
        `Cron job "${name}" was deleted from the Scheduler Registry`,
        CronService.name,
      );

      return true;
    } catch (error) {
      Logger.error(
        `Cron job "${name}" does not exist in the Scheduler Registry`,
        CronService.name,
      );

      return false;
    }
  }
}
