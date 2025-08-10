import { Injectable } from '@nestjs/common';
import { QueueMessage } from '../interfaces/queue.interface';
import { BaseQueueProcessor } from './base.processor';
import { AuthService } from '../../auth/auth.service';
import { QueueTopic } from '../enums/queue.enum';

@Injectable()
export class UserAuthProcessor extends BaseQueueProcessor {
  constructor(private readonly authService: AuthService) {
    super();
  }

  async process(message: QueueMessage): Promise<void> {
    this.logProcessing(message.id, message.topic);

    try {
      switch (message.topic) {
        case QueueTopic.USER_LOGIN:
          await this.authService.login(message.data);
          break;
        case QueueTopic.USER_REFRESH:
          await this.authService.refreshToken(message.data.refreshToken);
          break;
        case QueueTopic.USER_LOGOUT:
          await this.authService.logout(message.data.userId);
          break;
        case QueueTopic.USER_DELETE:
          await this.authService.deleteAccount(message.data.userId);
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
}
