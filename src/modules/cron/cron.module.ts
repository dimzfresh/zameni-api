import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CronService } from './cron.service';
import { CronController } from './cron.controller';
import { ServicesModule } from '../../common/services/services.module';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [ServicesModule, QueueModule],
  providers: [CronService],
  controllers: [CronController],
  exports: [CronService],
})
export class CronModule {}
