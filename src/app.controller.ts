import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Главная')
@Controller()
export class AppController {
  @Get()
  @ApiOperation({
    summary: 'Приветственное сообщение',
    description: 'Возвращает приветственное сообщение API',
  })
  @ApiResponse({ status: 200, description: 'Успешный ответ' })
  getHello(): { message: string } {
    return { message: 'Hello World!' };
  }

  @Get('health')
  @ApiOperation({
    summary: 'Health check',
    description: 'Проверка состояния сервиса',
  })
  @ApiResponse({ status: 200, description: 'Сервис работает' })
  @ApiResponse({ status: 503, description: 'Сервис недоступен' })
  getHealth(): { status: string; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
