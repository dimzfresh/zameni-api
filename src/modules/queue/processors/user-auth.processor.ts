import { Injectable } from '@nestjs/common';
import { QueueMessage } from '../interfaces/queue.interface';
import { BaseQueueProcessor } from './base.processor';
import { UserService } from '../../../common/services/user.service';
import { QueueTopic } from '../enums/queue.enum';

@Injectable()
export class UserAuthProcessor extends BaseQueueProcessor {
  constructor(private readonly userService: UserService) {
    super();
  }

  async process(message: QueueMessage): Promise<void> {
    this.logProcessing(message.id, message.topic);

    try {
      switch (message.topic) {
        case QueueTopic.USER_LOGIN:
          await this.handleUserLogin(message.data);
          break;
        case QueueTopic.USER_REFRESH:
          await this.handleUserRefresh(message.data);
          break;
        case QueueTopic.USER_LOGOUT:
          await this.handleUserLogout(message.data);
          break;
        case QueueTopic.USER_DELETE:
          await this.handleUserDelete(message.data);
          break;
        default:
          throw new Error(`Unknown auth topic: ${message.topic}`);
      }

      this.logSuccess(message.id);
    } catch (error) {
      this.logError(message.id, error);
      throw error;
    }
  }

  private async handleUserLogin(data: any): Promise<void> {
    // Логика входа пользователя
    const user = await this.userService.findByEmail(data.email);
    if (user) {
      await this.userService.updateLastLogin(user.id);
    }
  }

  private async handleUserRefresh(data: any): Promise<void> {
    // Логика обновления токена
    console.log('Refreshing token for user');
  }

  private async handleUserLogout(data: any): Promise<void> {
    // Логика выхода пользователя
    if (data.userId) {
      await this.userService.updateLastLogout(data.userId);
    }
  }

  private async handleUserDelete(data: any): Promise<void> {
    // Логика удаления пользователя
    if (data.userId) {
      await this.userService.deleteUser(data.userId);
    }
  }
}
