import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { UpdateProfileDto } from './dto/update-user.dto';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(User)
    public readonly userRepository: Repository<User>,
  ) {}

  async findById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return user;
  }

  async updateProfile(id: number, updateData: UpdateProfileDto): Promise<User> {
    const user = await this.findById(id);

    // Обновляем только разрешенные поля профиля
    if (updateData.name) {
      user.name = updateData.name;
    }
    
    if (updateData.phone) {
      user.phone = updateData.phone;
    }

    const updatedUser = await this.userRepository.save(user);
    
    if (!updatedUser) {
      throw new NotFoundException('Не удалось обновить профиль');
    }

    return updatedUser;
  }

  async getProfileStats(userId: number): Promise<any> {
    const user = await this.findById(userId);
    
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      status: user.status,
      emailVerifiedAt: user.emailVerifiedAt,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
