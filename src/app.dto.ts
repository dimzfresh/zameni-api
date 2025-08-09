import { IsString, IsEmail, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'Иван Иванов', minLength: 2, maxLength: 50 })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @ApiProperty({ example: 'ivan@example.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: 'Разработчик с опытом 5+ лет', maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  bio?: string;
}

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Иван Петров', minLength: 2, maxLength: 50 })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name?: string;

  @ApiPropertyOptional({ example: 'ivan.petrov@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'Старший разработчик с опытом 7+ лет', maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  bio?: string;
}
