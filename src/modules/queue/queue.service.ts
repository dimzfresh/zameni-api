import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { QueueEngineService } from './queue-engine.service';
import { UserRegistrationProcessor } from './processors/user-registration.processor';
import { UserAuthProcessor } from './processors/user-auth.processor';
import { NotificationProcessor } from './processors/notification.processor';
import { QueueTopic } from './enums/queue.enum';
import { QueueOptions } from './interfaces/queue.interface';

@Injectable()
export class QueueService implements OnModuleInit {
  private readonly logger = new Logger(QueueService.name);

  constructor(
    private readonly queueEngine: QueueEngineService,
    private readonly userRegistrationProcessor: UserRegistrationProcessor,
    private readonly userAuthProcessor: UserAuthProcessor,
    private readonly notificationProcessor: NotificationProcessor,
  ) {}

  async onModuleInit() {
    this.setupQueueHandlers();
    this.logger.log('Queue service initialized with handlers');
  }

  /**
   * Отправка сообщения в очередь
   */
  async send(
    topic: string | QueueTopic,
    data: any,
    options: QueueOptions = {},
  ): Promise<string> {
    return this.queueEngine.send(topic, data, options);
  }

  /**
   * Получение статистики очередей
   */
  getQueueStats() {
    return this.queueEngine.getQueueStats();
  }

  /**
   * Получение статуса сообщения
   */
  async getMessageStatus(messageId: string) {
    return this.queueEngine.getMessageStatus(messageId);
  }

  /**
   * Очистка очередей (для тестирования)
   */
  clearQueues(): void {
    this.queueEngine.clearQueues();
  }

  /**
   * Настройка обработчиков очередей
   */
  private setupQueueHandlers(): void {
    // Обработчик для регистрации пользователей
    this.queueEngine.subscribe(QueueTopic.USER_REGISTRATION, {
      handle: async (message) => {
        await this.userRegistrationProcessor.process(message);
      },
    });

    // Обработчики для аутентификации пользователей
    this.queueEngine.subscribe(QueueTopic.USER_LOGIN, {
      handle: async (message) => {
        await this.userAuthProcessor.process(message);
      },
    });

    this.queueEngine.subscribe(QueueTopic.USER_REFRESH, {
      handle: async (message) => {
        await this.userAuthProcessor.process(message);
      },
    });

    this.queueEngine.subscribe(QueueTopic.USER_LOGOUT, {
      handle: async (message) => {
        await this.userAuthProcessor.process(message);
      },
    });

    this.queueEngine.subscribe(QueueTopic.USER_DELETE, {
      handle: async (message) => {
        await this.userAuthProcessor.process(message);
      },
    });

    // Обработчик для отправки уведомлений
    this.queueEngine.subscribe(QueueTopic.NOTIFICATION_SEND, {
      handle: async (message) => {
        await this.notificationProcessor.process(message);
      },
    });

    this.logger.log('Queue handlers setup completed');
  }
}
