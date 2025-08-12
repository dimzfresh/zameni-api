import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UserService } from '../../common/services/user.service';
import { QueueService } from '../queue/queue.service';
import { UserStatus, UserRole } from '../../entities/user.entity';
import { CRON, USER } from '../../common/constants/app.constants';
import { QueueTopic, QueuePriority } from '../queue/enums/queue.enum';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(
    private userService: UserService,
    private queueService: QueueService,
  ) {}

  /**
   * Автоматическое удаление неактивных пользователей
   * Запускается каждый день в 2:00 утра
   * Работает асинхронно через очередь, не блокируя пользователей
   */
  @Cron(CRON.CLEANUP_INACTIVE_USERS)
  async cleanupInactiveUsers() {
    this.logger.log('Starting async cleanup of inactive users...');

    try {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      // Находим неактивных пользователей
      const inactiveUsers =
        await this.userService.findInactiveUsers(sixMonthsAgo);

      this.logger.log(
        `Found ${inactiveUsers.length} inactive users to process`,
      );

      // Отправляем каждого пользователя в очередь для асинхронной обработки
      for (const user of inactiveUsers) {
        try {
          await this.queueService.send(
            QueueTopic.USER_CLEANUP,
            {
              userId: user.id,
              email: user.email,
              lastLoginAt: user.lastLoginAt,
              emailVerifiedAt: user.emailVerifiedAt,
              role: user.role,
            },
            {
              priority: QueuePriority.LOW, // Низкий приоритет, не блокирует пользователей
            },
          );

          this.logger.log(
            `Queued user for cleanup: ${user.email} (ID: ${user.id})`,
          );
        } catch (error) {
          this.logger.error(
            `Error queuing user ${user.id} for cleanup: ${error.message}`,
          );
        }
      }

      this.logger.log(`Cleanup queued for ${inactiveUsers.length} users`);
    } catch (error) {
      this.logger.error(`Error during cleanup queueing: ${error.message}`);
    }
  }

  /**
   * Уведомление пользователей о предстоящем удалении
   * Запускается каждый день в 10:00 утра
   */
  @Cron(CRON.NOTIFY_INACTIVE_USERS)
  async notifyInactiveUsers() {
    this.logger.log('Starting notification of inactive users...');

    try {
      const fiveMonthsAgo = new Date();
      fiveMonthsAgo.setMonth(fiveMonthsAgo.getMonth() - 5);

      // Находим пользователей, которые скоро будут удалены
      const soonToBeDeletedUsers =
        await this.userService.findInactiveUsers(fiveMonthsAgo);

      this.logger.log(`Found ${soonToBeDeletedUsers.length} users to notify`);

      for (const user of soonToBeDeletedUsers) {
        try {
          await this.sendDeletionWarning(user);
          this.logger.log(`Warning sent to user: ${user.email}`);
        } catch (error) {
          this.logger.error(
            `Error sending warning to ${user.email}: ${error.message}`,
          );
        }
      }
    } catch (error) {
      this.logger.error(`Error during notification: ${error.message}`);
    }
  }

  /**
   * Проверяет, должен ли пользователь быть удален
   */
  private async shouldDeleteUser(user: any): Promise<boolean> {
    // Не удаляем администраторов
    if (user.role === UserRole.ADMIN) {
      return false;
    }

    // Не удаляем пользователей с активными заказами/объявлениями
    const hasActiveContent = await this.userService.hasActiveContent(user.id);
    if (hasActiveContent) {
      return false;
    }

    // Не удаляем пользователей, которые подтвердили email
    if (user.emailVerifiedAt) {
      // Для подтвержденных пользователей увеличиваем срок до 1 года
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      return user.lastLoginAt < oneYearAgo;
    }

    // Для неподтвержденных пользователей - 6 месяцев
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    return user.lastLoginAt < sixMonthsAgo;
  }

  /**
   * Отправляет предупреждение о предстоящем удалении
   */
  private async sendDeletionWarning(user: any): Promise<void> {
    // Здесь будет логика отправки email/SMS
    this.logger.log(`Sending deletion warning to ${user.email}`);

    // TODO: Интеграция с email сервисом
    // await this.emailService.sendDeletionWarning(user.email);
  }

  /**
   * Ручной запуск очистки (для тестирования)
   */
  async manualCleanup(): Promise<{ deleted: number; errors: number }> {
    this.logger.log('Manual cleanup triggered');

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const inactiveUsers =
      await this.userService.findInactiveUsers(sixMonthsAgo);

    let deletedCount = 0;
    let errorCount = 0;

    for (const user of inactiveUsers) {
      try {
        if (await this.shouldDeleteUser(user)) {
          await this.userService.delete(user.id);
          deletedCount++;
        }
      } catch (error) {
        errorCount++;
        this.logger.error(`Error deleting user ${user.id}: ${error.message}`);
      }
    }

    return { deleted: deletedCount, errors: errorCount };
  }

  /**
   * Получение статистики неактивных пользователей
   */
  async getInactiveUsersStats(): Promise<any> {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const inactiveUsers =
      await this.userService.findInactiveUsers(sixMonthsAgo);

    const stats = {
      total: inactiveUsers.length,
      verified: inactiveUsers.filter((u) => u.emailVerifiedAt).length,
      unverified: inactiveUsers.filter((u) => !u.emailVerifiedAt).length,
      admins: inactiveUsers.filter((u) => u.role === UserRole.ADMIN).length,
      regular: inactiveUsers.filter((u) => u.role === UserRole.USER).length,
    };

    return stats;
  }
}
