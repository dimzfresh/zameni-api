import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
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
}
