import { IsEmail, IsString, IsOptional, MinLength, MaxLength, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole, UserStatus } from '../../../entities/user.entity';
import { IsPhoneNumber, IsDigitsOnly } from '../../../common/validators/phone.validator';

export class UpdateUserDto {
  @ApiProperty({ example: 'ivan@example.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: 'Иван Петров', required: false, minLength: 2, maxLength: 50 })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name?: string;

  @ApiProperty({ example: 'Опытный разработчик', required: false, maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @ApiProperty({ 
    example: '+7 (999) 123-45-67', 
    required: false,
    description: 'Номер телефона. Поддерживает форматы: +7 (999) 123-45-67, +1234567890'
  })
  @IsOptional()
  @IsString()
  @IsPhoneNumber({ message: 'Номер телефона должен быть валидным' })
  phone?: string;

  @ApiProperty({ example: 'https://example.com/avatar.jpg', required: false })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty({ 
    enum: UserRole, 
    required: false,
    description: 'USER - обычный пользователь, ADMIN - администратор',
    example: 'user'
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiProperty({ enum: UserStatus, required: false })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}

export class UpdateProfileDto {
  @ApiProperty({ example: 'Иван Петров', required: false, minLength: 2, maxLength: 50 })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name?: string;

  @ApiProperty({ example: 'Опытный разработчик', required: false, maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @ApiProperty({ 
    example: '+7 (999) 123-45-67', 
    required: false,
    description: 'Номер телефона. Поддерживает форматы: +7 (999) 123-45-67, +1234567890'
  })
  @IsOptional()
  @IsString()
  @IsPhoneNumber({ message: 'Номер телефона должен быть валидным' })
  phone?: string;

  @ApiProperty({ example: 'https://example.com/avatar.jpg', required: false })
  @IsOptional()
  @IsString()
  avatar?: string;
}