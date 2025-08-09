import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AppService } from './app.service';
import { CreateUserDto } from './app.dto';
import { PaginationDto } from './common/dto/pagination.dto';
import { ResponseDto } from './common/dto/response.dto';

@ApiTags('Главная')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Приветственное сообщение',
    description: 'Возвращает приветственное сообщение API'
  })
  @ApiResponse({ status: 200, description: 'Успешный ответ' })
  getHello(): ResponseDto<string> {
    const message = this.appService.getHello();
    return ResponseDto.success(message, 'Welcome to Zameni API');
  }

  @Get('test')
  @ApiOperation({ summary: 'Тестовый endpoint' })
  getTest(): string {
    return 'Test endpoint works!';
  }

  @Get('users')
  @ApiOperation({ summary: 'Получить список пользователей' })
  @ApiResponse({ status: 200, description: 'Список пользователей получен успешно' })
  getUsers(@Query() pagination: PaginationDto): ResponseDto<any> {
    return ResponseDto.success(
      {
        users: [
          { id: 1, name: 'John Doe', email: 'john@example.com' },
          { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
        ],
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          skip: pagination.skip,
        },
      },
      'Users retrieved successfully',
    );
  }

  @Post('users')
  @ApiOperation({ summary: 'Создать пользователя' })
  @ApiResponse({ status: 201, description: 'Пользователь создан успешно' })
  @ApiResponse({ status: 400, description: 'Ошибка валидации данных' })
  createUser(@Body() createUserDto: CreateUserDto): ResponseDto<any> {
    return ResponseDto.success(
      {
        id: 123,
        ...createUserDto,
        createdAt: new Date().toISOString(),
      },
      'User created successfully',
    );
  }
}
