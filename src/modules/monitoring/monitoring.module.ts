import { Module } from '@nestjs/common';
import { MonitoringService } from './monitoring.service';
import { ServicesModule } from '../../common/services/services.module';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [ServicesModule, QueueModule],
  providers: [MonitoringService],
  exports: [MonitoringService],
})
export class MonitoringModule {}
