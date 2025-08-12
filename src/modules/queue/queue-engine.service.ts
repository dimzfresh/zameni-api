import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  QueueMessage,
  QueueOptions,
  QueueHandler,
  QueueStats,
  IQueueService,
} from './interfaces/queue.interface';
import { QueuePriority, QueueTopic } from './enums/queue.enum';
import { IdGenerator } from '../../common/utils/id-generator';
import { TIMEOUTS } from '../../common/constants/app.constants';

@Injectable()
export class QueueEngineService implements IQueueService {
  private readonly logger = new Logger(QueueEngineService.name);
  private readonly queues: Map<string, QueueMessage[]> = new Map();
  private readonly processing: Set<string> = new Set();
  private readonly handlers: Map<string, QueueHandler[]> = new Map();
  private readonly maxRetries: number;
  private readonly timeout: number;

  constructor(
    private configService: ConfigService,
    private eventEmitter: EventEmitter2,
  ) {
    this.maxRetries = this.configService.get(
      'queue.maxRetries',
      TIMEOUTS.QUEUE_MAX_RETRIES,
    );
    this.timeout = this.configService.get(
      'queue.timeout',
      TIMEOUTS.QUEUE_PROCESSING,
    );

    // Подписываемся на события обработки сообщений
    this.eventEmitter.on('queue.message', (message: QueueMessage) => {
      this.processMessage(message);
    });
  }

  /**
   * Отправка сообщения в очередь
   */
  async send(
    topic: string,
    data: any,
    options: QueueOptions = {},
  ): Promise<string> {
    const messageId = this.generateMessageId();
    const message: QueueMessage = {
      id: messageId,
      topic,
      data,
      timestamp: new Date(),
      retryCount: 0,
      priority: options.priority || QueuePriority.NORMAL,
    };

    // Получаем или создаем очередь для топика
    if (!this.queues.has(topic)) {
      this.queues.set(topic, []);
    }

    const queue = this.queues.get(topic)!;

    // Добавляем сообщение в очередь в зависимости от приоритета
    if (message.priority === QueuePriority.HIGH) {
      queue.unshift(message);
    } else {
      queue.push(message);
    }

    this.logger.log(`Message ${messageId} sent to queue ${topic}`);

    // Эмитим событие для обработки
    this.eventEmitter.emit('queue.message', message);

    return messageId;
  }

  /**
   * Подписка на топик
   */
  subscribe(topic: string, handler: QueueHandler): void {
    if (!this.handlers.has(topic)) {
      this.handlers.set(topic, []);
    }
    this.handlers.get(topic)!.push(handler);
  }

  /**
   * Обработка сообщения
   */
  private async processMessage(message: QueueMessage): Promise<void> {
    if (this.processing.has(message.id)) {
      return; // Уже обрабатывается
    }

    this.processing.add(message.id);

    try {
      this.logger.log(
        `Processing message ${message.id} from topic ${message.topic}`,
      );

      // Получаем обработчики для топика
      const topicHandlers = this.handlers.get(message.topic) || [];

      if (topicHandlers.length === 0) {
        this.logger.warn(`No handlers found for topic: ${message.topic}`);
        return;
      }

      // Устанавливаем таймаут
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(
          () => reject(new Error('Message processing timeout')),
          this.timeout,
        );
      });

      // Обрабатываем сообщение всеми обработчиками
      const processPromises = topicHandlers.map((handler) =>
        handler.handle(message),
      );
      const processPromise = Promise.all(processPromises);

      await Promise.race([processPromise, timeoutPromise]);

      // Удаляем сообщение из очереди после успешной обработки
      this.removeMessageFromQueue(message.topic, message.id);

      this.logger.log(`Message ${message.id} processed successfully`);
    } catch (error) {
      this.logger.error(
        `Error processing message ${message.id}: ${error.message}`,
      );

      // Увеличиваем счетчик попыток
      message.retryCount = (message.retryCount || 0) + 1;

      if (message.retryCount < this.maxRetries) {
        // Возвращаем сообщение в очередь для повторной обработки
        this.logger.log(
          `Retrying message ${message.id} (attempt ${message.retryCount})`,
        );
        setTimeout(() => {
          this.eventEmitter.emit('queue.message', message);
        }, TIMEOUTS.QUEUE_RETRY_DELAY * message.retryCount); // Экспоненциальная задержка
      } else {
        // Превышен лимит попыток - отправляем в dead letter queue
        this.logger.error(
          `Message ${message.id} exceeded retry limit, moving to dead letter queue`,
        );
        await this.sendToDeadLetterQueue(message);
        this.removeMessageFromQueue(message.topic, message.id);
      }
    } finally {
      this.processing.delete(message.id);
    }
  }

  /**
   * Отправка в dead letter queue
   */
  private async sendToDeadLetterQueue(message: QueueMessage): Promise<void> {
    const deadLetterMessage: QueueMessage = {
      ...message,
      topic: 'dead-letter',
      timestamp: new Date(),
    };

    if (!this.queues.has('dead-letter')) {
      this.queues.set('dead-letter', []);
    }

    this.queues.get('dead-letter')!.push(deadLetterMessage);
    this.logger.warn(`Message ${message.id} sent to dead letter queue`);
  }

  /**
   * Удаление сообщения из очереди
   */
  private removeMessageFromQueue(topic: string, messageId: string): void {
    const queue = this.queues.get(topic);
    if (queue) {
      const index = queue.findIndex((msg) => msg.id === messageId);
      if (index !== -1) {
        queue.splice(index, 1);
      }
    }
  }

  /**
   * Получение статистики очередей
   */
  getQueueStats(): Record<string, QueueStats> {
    const stats: Record<string, QueueStats> = {};

    for (const [topic, queue] of this.queues.entries()) {
      const processingCount = Array.from(this.processing).filter((id) =>
        queue.some((msg) => msg.id === id),
      ).length;

      stats[topic] = {
        pending: queue.length,
        processing: processingCount,
        oldestMessage: queue.length > 0 ? queue[0].timestamp : null,
        failed: queue.filter((msg) => (msg.retryCount || 0) >= this.maxRetries)
          .length,
      };
    }

    return stats;
  }

  /**
   * Получение статуса сообщения
   */
  async getMessageStatus(messageId: string): Promise<any> {
    // Ищем сообщение в очереди
    for (const [topic, queue] of this.queues.entries()) {
      const message = queue.find((msg) => msg.id === messageId);
      if (message) {
        return {
          messageId,
          status: this.processing.has(messageId) ? 'processing' : 'pending',
          timestamp: message.timestamp.toISOString(),
          retryCount: message.retryCount || 0,
          topic: message.topic,
        };
      }
    }

    // Если сообщение не найдено в очереди, возможно оно уже обработано
    return {
      messageId,
      status: 'completed',
      timestamp: new Date().toISOString(),
      message: 'Message processed successfully',
    };
  }

  /**
   * Очистка очередей (для тестирования)
   */
  clearQueues(): void {
    this.queues.clear();
    this.processing.clear();
    this.logger.log('All queues cleared');
  }

  /**
   * Генерация уникального ID сообщения
   */
  private generateMessageId(): string {
    return IdGenerator.generateMessageId();
  }
}
