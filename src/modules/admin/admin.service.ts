import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from '../../common/services/user.service';
import { UserRole, UserStatus } from '../../entities/user.entity';
import { PAGINATION } from '../../common/constants/app.constants';

@Injectable()
export class AdminService {
  constructor(private userService: UserService) {}

  /**
   * Получить всех пользователей с пагинацией
   */
  async findAll(page: number = 1, limit: number = PAGINATION.DEFAULT_LIMIT) {
    return this.userService.findAll(page, limit);
  }

  /**
   * Поиск пользователей по email или имени
   */
  async searchUsers(
    query: string,
    page: number = 1,
    limit: number = PAGINATION.DEFAULT_LIMIT,
  ) {
    return this.userService.searchUsers(query, page, limit);
  }

  /**
   * Получить пользователей по роли
   */
  async getUsersByRole(
    role: UserRole,
    page: number = 1,
    limit: number = PAGINATION.DEFAULT_LIMIT,
  ) {
    return this.userService.getUsersByRole(role, page, limit);
  }

  /**
   * Получить пользователей по статусу
   */
  async getUsersByStatus(
    status: UserStatus,
    page: number = 1,
    limit: number = PAGINATION.DEFAULT_LIMIT,
  ) {
    return this.userService.getUsersByStatus(status, page, limit);
  }

  /**
   * Получить пользователя по ID
   */
  async findById(userId: number) {
    const user = await this.userService.findById(userId);
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Подтвердить email пользователя
   */
  async verifyEmail(userId: number) {
    const user = await this.userService.verifyEmail(userId);
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Обновить статус пользователя
   */
  async updateStatus(userId: number, status: UserStatus) {
    const user = await this.userService.update(userId, { status });
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Обновить роль пользователя
   */
  async updateRole(userId: number, role: UserRole) {
    const user = await this.userService.findById(userId);

    // Проверяем, что не удаляем последнего администратора
    if (user.role === UserRole.ADMIN && role === UserRole.USER) {
      const adminCount = await this.userService.userRepository.count({
        where: { role: UserRole.ADMIN },
      });

      if (adminCount <= 1) {
        throw new BadRequestException(
          'Нельзя удалить последнего администратора',
        );
      }
    }

    await this.userService.update(userId, { role });

    return { message: 'Роль пользователя обновлена' };
  }

  /**
   * Назначить пользователя администратором
   */
  async makeAdmin(userId: number) {
    return this.updateRole(userId, UserRole.ADMIN);
  }

  /**
   * Убрать права администратора
   */
  async removeAdmin(userId: number) {
    return this.updateRole(userId, UserRole.USER);
  }

  /**
   * Заблокировать пользователя
   */
  async banUser(userId: number) {
    return this.updateStatus(userId, UserStatus.BANNED);
  }

  /**
   * Разблокировать пользователя
   */
  async unbanUser(userId: number) {
    return this.updateStatus(userId, UserStatus.ACTIVE);
  }

  /**
   * Получить статистику пользователей
   */
  async getUsersStatistics() {
    return this.userService.getUsersStatistics();
  }
}
