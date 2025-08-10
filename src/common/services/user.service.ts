import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole, UserStatus } from '../../entities/user.entity';
import { RegisterDto } from '../../modules/auth/dto/auth.dto.js';
import { DatabaseErrorHandler } from '../../common/utils/database-error-handler';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    public readonly userRepository: Repository<User>,
  ) {}

  async create(registerDto: RegisterDto, role: UserRole = UserRole.USER): Promise<User> {
    try {
      // Проверяем, существует ли пользователь с таким email
      const existingUser = await this.findByEmail(registerDto.email);

      if (existingUser) {
        throw new ConflictException('Пользователь с таким email уже существует');
      }

      // Создаем нового пользователя
      const user = this.userRepository.create({
        email: registerDto.email,
        name: registerDto.name,
        password: registerDto.password,
        role,
        status: UserStatus.ACTIVE,
      });

      // Сохраняем пользователя в базу данных
      const savedUser = await this.userRepository.save(user);
      
      if (!savedUser) {
        throw new BadRequestException('Не удалось создать пользователя');
      }

      return savedUser;
    } catch (error) {
      // Если это наша кастомная ошибка, пробрасываем её
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      
      // Обрабатываем ошибки базы данных
      DatabaseErrorHandler.handle(error, 'создании пользователя');
    }
  }

  async findById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
    });
  }



  async update(id: number, updateData: Partial<User>): Promise<User> {
    try {
      const user = await this.findById(id);

      // Если обновляется email, проверяем уникальность
      if (updateData.email && updateData.email !== user.email) {
        const existingUser = await this.findByEmail(updateData.email);
        if (existingUser) {
          throw new ConflictException('Пользователь с таким email уже существует');
        }
      }

      // Обновляем пользователя
      Object.assign(user, updateData);
      const updatedUser = await this.userRepository.save(user);
      
      if (!updatedUser) {
        throw new BadRequestException('Не удалось обновить пользователя');
      }

      return updatedUser;
    } catch (error) {
      // Если это наша кастомная ошибка, пробрасываем её
      if (error instanceof ConflictException || error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      
      // Обрабатываем ошибки базы данных
      DatabaseErrorHandler.handle(error, 'обновлении пользователя');
    }
  }

  async delete(id: number): Promise<void> {
    try {
      const user = await this.findById(id);
      const result = await this.userRepository.remove(user);
      
      if (!result) {
        throw new BadRequestException('Не удалось удалить пользователя');
      }
    } catch (error) {
      // Если это наша кастомная ошибка, пробрасываем её
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      
      // Обрабатываем ошибки базы данных
      DatabaseErrorHandler.handle(error, 'удалении пользователя');
    }
  }

  async updateLastLogin(id: number): Promise<void> {
    await this.userRepository.update(id, {
      lastLoginAt: new Date(),
    });
  }

  async updateRefreshToken(id: number, refreshToken: string | null): Promise<void> {
    await this.userRepository.update(id, {
      refreshToken: refreshToken || undefined,
    });
  }

  async verifyEmail(id: number): Promise<User> {
    const user = await this.findById(id);
    user.emailVerifiedAt = new Date();
    return this.userRepository.save(user);
  }

  /**
   * Поиск неактивных пользователей
   */
  async findInactiveUsers(sinceDate: Date): Promise<User[]> {
    return this.userRepository
      .createQueryBuilder('user')
      .where('user.lastLoginAt < :sinceDate', { sinceDate })
      .orWhere('user.lastLoginAt IS NULL')
      .andWhere('user.status = :status', { status: UserStatus.ACTIVE })
      .getMany();
  }

  /**
   * Проверяет, есть ли у пользователя активный контент
   */
  async hasActiveContent(userId: number): Promise<boolean> {
    // В будущем здесь будет проверка активных объявлений, откликов и т.д.
    // Пока возвращаем false для простоты
    return false;
  }

  /**
   * Получает статистику неактивных пользователей
   */
  async getInactiveUsersStatistics(): Promise<any> {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const inactiveUsers = await this.findInactiveUsers(sixMonthsAgo);

    return {
      total: inactiveUsers.length,
      withEmailVerified: inactiveUsers.filter(u => u.emailVerifiedAt).length,
      withoutEmailVerified: inactiveUsers.filter(u => !u.emailVerifiedAt).length,
    };
  }

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    
    const [users, total] = await this.userRepository.findAndCount({
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      users: users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      }),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async searchUsers(query: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    
    const [users, total] = await this.userRepository
      .createQueryBuilder('user')
      .where('user.email ILIKE :query OR user.name ILIKE :query', { query: `%${query}%` })
      .skip(skip)
      .take(limit)
      .orderBy('user.createdAt', 'DESC')
      .getManyAndCount();

    return {
      users: users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      }),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getUsersByRole(role: UserRole, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    
    const [users, total] = await this.userRepository.findAndCount({
      where: { role },
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      users: users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      }),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getUsersByStatus(status: UserStatus, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    
    const [users, total] = await this.userRepository.findAndCount({
      where: { status },
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      users: users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      }),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getUsersStatistics() {
    const [totalUsers, activeUsers, bannedUsers, admins, verifiedUsers] = await Promise.all([
      this.userRepository.count(),
      this.userRepository.count({ where: { status: UserStatus.ACTIVE } }),
      this.userRepository.count({ where: { status: UserStatus.BANNED } }),
      this.userRepository.count({ where: { role: UserRole.ADMIN } }),
      this.userRepository.createQueryBuilder('user').where('user.emailVerifiedAt IS NOT NULL').getCount(),
    ]);

    return {
      total: totalUsers,
      active: activeUsers,
      banned: bannedUsers,
      admins,
      verified: verifiedUsers,
      unverified: totalUsers - verifiedUsers,
    };
  }
}
