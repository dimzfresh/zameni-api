import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { QueueService } from './queue.service';
import { QueueController } from './queue.controller';
import { QueueEngineService } from './queue-engine.service';
import { UserRegistrationProcessor } from './processors/user-registration.processor';
import { UserAuthProcessor } from './processors/user-auth.processor';
import { NotificationProcessor } from './processors/notification.processor';
import { ServicesModule } from '../../common/services/services.module';

@Module({
  imports: [
    ConfigModule, 
    EventEmitterModule.forRoot(),
    ServicesModule
  ],
  providers: [
    QueueService,
    QueueEngineService,
    UserRegistrationProcessor,
    UserAuthProcessor,
    NotificationProcessor,
  ],
  controllers: [QueueController],
  exports: [QueueService],
})
export class QueueModule {}
