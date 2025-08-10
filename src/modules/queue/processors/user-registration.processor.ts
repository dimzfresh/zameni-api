import { Injectable } from '@nestjs/common';
import { QueueMessage } from '../interfaces/queue.interface';
import { BaseQueueProcessor } from './base.processor';
import { UserService } from '../../../common/services/user.service';
import { UserRole } from '../../../entities/user.entity';

@Injectable()
export class UserRegistrationProcessor extends BaseQueueProcessor {
  constructor(private readonly userService: UserService) {
    super();
  }

  async process(message: QueueMessage): Promise<void> {
    this.logProcessing(message.id, message.topic);

    try {
      // Создаем пользователя в БД
      const user = await this.userService.create(message.data, UserRole.USER);
      
      // Обновляем время последнего входа
      await this.userService.updateLastLogin(user.id);
      
      this.logSuccess(message.id);
      
      // Здесь можно добавить дополнительные действия:
      // - Отправка приветственного email
      // - Создание профиля
      // - Аналитика
      
    } catch (error) {
      this.logError(message.id, error);
      throw error;
    }
  }
}
