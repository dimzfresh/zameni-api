import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Главная')
@Controller()
export class AppController {

  @Get()
  @ApiOperation({ 
    summary: 'Приветственное сообщение',
    description: 'Возвращает приветственное сообщение API'
  })
  @ApiResponse({ status: 200, description: 'Успешный ответ' })
  getHello(): { message: string } {
    return { message: 'Hello World!' };
  }
}
