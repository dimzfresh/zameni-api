import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import * as bcrypt from 'bcryptjs';
import { JWT } from '../common/constants/app.constants';

/**
 * Роли пользователей
 *
 * Преимущества упрощенной системы ролей:
 * - Универсальность: один пользователь может быть и работодателем, и исполнителем
 * - Простота: не нужно выбирать роль при регистрации
 * - Гибкость: танцор может искать замену и предлагать свои услуги
 * - Масштабируемость: легко добавлять новые возможности для всех пользователей
 *
 * USER - Обычный пользователь, который может:
 * - Публиковать объявления о поиске исполнителей
 * - Откликаться на объявления других пользователей
 * - Быть как работодателем, так и исполнителем
 *
 * ADMIN - Администратор системы:
 * - Доступ к веб-админке
 * - Модерация контента
 * - Управление пользователями
 */
export enum UserRole {
  USER = 'user', // Обычный пользователь (может быть и исполнителем, и работодателем)
  ADMIN = 'admin', // Администратор (для веб-админки)
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BANNED = 'banned',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  bio?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  @Column({ nullable: true })
  @Exclude()
  password?: string;

  @Column({ nullable: true })
  @Exclude()
  refreshToken?: string;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastLogoutAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  emailVerifiedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, JWT.SALT_ROUNDS);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    if (!this.password) return false;
    return bcrypt.compare(password, this.password);
  }

  toJSON() {
    const { password, refreshToken, ...user } = this;
    return user;
  }
}
