import { Logger } from '@nestjs/common';
import { QueueMessage, QueueProcessor } from '../interfaces/queue.interface';

export abstract class BaseQueueProcessor implements QueueProcessor {
  protected readonly logger = new Logger(this.constructor.name);

  abstract process(message: QueueMessage): Promise<void>;

  protected logProcessing(messageId: string, topic: string): void {
    this.logger.log(`Processing message ${messageId} from topic ${topic}`);
  }

  protected logSuccess(messageId: string): void {
    this.logger.log(`Message ${messageId} processed successfully`);
  }

  protected logError(messageId: string, error: Error): void {
    this.logger.error(
      `Error processing message ${messageId}: ${error.message}`,
    );
  }
}
