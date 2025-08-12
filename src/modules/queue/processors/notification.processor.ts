import { Injectable } from '@nestjs/common';
import { QueueMessage } from '../interfaces/queue.interface';
import { BaseQueueProcessor } from './base.processor';

@Injectable()
export class NotificationProcessor extends BaseQueueProcessor {
  async process(message: QueueMessage): Promise<void> {
    this.logProcessing(message.id, message.topic);

    try {
      // Здесь будет реальная отправка уведомлений
      this.logger.log(
        `Notification processed: ${JSON.stringify(message.data)}`,
      );

      // Имитируем отправку email/SMS
      await new Promise((resolve) => setTimeout(resolve, 100));

      this.logSuccess(message.id);
    } catch (error) {
      this.logError(message.id, error);
      throw error;
    }
  }
}
