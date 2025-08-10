import { QueuePriority, QueueTopic } from '../enums/queue.enum';

export interface QueueMessage {
  id: string;
  topic: string | QueueTopic;
  data: any;
  timestamp: Date;
  retryCount?: number;
  priority?: QueuePriority;
}

export interface QueueOptions {
  maxRetries?: number;
  timeout?: number;
  priority?: QueuePriority;
}

export interface QueueHandler {
  handle(message: QueueMessage): Promise<void>;
}

export interface QueueProcessor {
  process(message: QueueMessage): Promise<void>;
}

export interface QueueStats {
  pending: number;
  processing: number;
  oldestMessage: Date | null;
  failed: number;
}

export interface IQueueService {
  send(topic: string, data: any, options?: QueueOptions): Promise<string>;
  subscribe(topic: string, handler: QueueHandler): void;
  getQueueStats(): Record<string, QueueStats>;
  getMessageStatus(messageId: string): Promise<any>;
  clearQueues(): void;
}
