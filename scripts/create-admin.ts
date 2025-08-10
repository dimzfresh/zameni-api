import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ProfileService } from '../src/modules/profile/profile.service';
import { UserRole, UserStatus } from '../src/entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { JWT } from '../src/common/constants/app.constants';

async function createAdmin() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const profileService = app.get(ProfileService);

  try {
    // Проверяем, есть ли уже администраторы
    const existingAdmins = await profileService.userRepository.find({
      where: { role: UserRole.ADMIN }
    });

    if (existingAdmins.length > 0) {
      console.log('✅ Администраторы уже существуют:');
      existingAdmins.forEach(admin => {
        console.log(`   - ${admin.email} (ID: ${admin.id})`);
      });
      return;
    }

    // Создаем первого администратора
    const adminData = {
      email: 'admin@zameni.com',
      password: 'admin123456',
      name: 'Системный администратор',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      emailVerifiedAt: new Date(), // Админ автоматически подтвержден
    };

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(adminData.password, JWT.SALT_ROUNDS);

    const admin = await profileService.userRepository.save({
      ...adminData,
      password: hashedPassword,
    });

    console.log('✅ Администратор успешно создан:');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Пароль: ${adminData.password}`);
    console.log(`   ID: ${admin.id}`);
    console.log('\n⚠️  ВАЖНО: Измените пароль после первого входа!');

  } catch (error) {
    console.error('❌ Ошибка при создании администратора:', error.message);
  } finally {
    await app.close();
  }
}

createAdmin();
