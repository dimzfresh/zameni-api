import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'ivan@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Иван Петров', minLength: 2, maxLength: 50 })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @ApiProperty({ example: 'mySecurePassword123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;
}

export class LoginDto {
  @ApiProperty({ example: 'ivan@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'mySecurePassword123' })
  @IsString()
  password: string;
}

export class AuthResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  refreshToken: string;

  @ApiProperty({ example: 'Bearer' })
  tokenType: string;

  @ApiProperty({ example: 3600 })
  expiresIn: number;

  @ApiProperty({
    example: {
      id: 1,
      email: 'ivan@example.com',
      name: 'Иван Петров',
      role: 'user',
      status: 'active',
      emailVerifiedAt: '2024-01-01T00:00:00.000Z',
      lastLoginAt: '2024-01-01T00:00:00.000Z',
      createdAt: '2024-01-01T00:00:00.000Z',
    },
  })
  user: {
    id: number;
    email: string;
    name: string;
    role?: string;
    status?: string;
    emailVerifiedAt?: Date;
    lastLoginAt?: Date;
    createdAt?: Date;
  };
}

export class RefreshTokenDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  @IsString()
  refreshToken: string;
}

export class ChangePasswordDto {
  @ApiProperty({ example: 'oldPassword123' })
  @IsString()
  currentPassword: string;

  @ApiProperty({ example: 'newSecurePassword456', minLength: 6 })
  @IsString()
  @MinLength(6)
  newPassword: string;
}

export class AsyncRegisterResponseDto {
  @ApiProperty({ example: 'msg_1234567890_abc123def' })
  messageId: string;

  @ApiProperty({ example: 'Регистрация принята в обработку' })
  message: string;

  @ApiProperty({ example: 'req_1234567890' })
  requestId: string;
}

export class RegistrationStatusDto {
  @ApiProperty({ example: 'msg_1234567890_abc123def' })
  messageId: string;

  @ApiProperty({
    example: 'pending',
    enum: ['pending', 'processing', 'completed', 'failed'],
  })
  status: 'pending' | 'processing' | 'completed' | 'failed';

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  timestamp: string;

  @ApiProperty({
    example: 'User registration completed successfully',
    required: false,
  })
  message?: string;

  @ApiProperty({
    example: { id: 1, email: 'user@example.com' },
    required: false,
  })
  result?: any;
}
