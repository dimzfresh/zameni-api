import { Controller, Get, Post, Delete, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { QueueService } from './queue.service';
import { AdminGuard } from '../auth/guards/admin.guard';
import { ResponseDto } from '../../common/dto/response.dto';
import { QueueTopic, QueuePriority } from './enums/queue.enum';

@ApiTags('Очереди (внутреннее)')
@Controller('queue')
@UseGuards(AdminGuard)
@ApiBearerAuth('JWT-auth')
export class QueueController {
  constructor(private queueService: QueueService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Получить статистику очередей' })
  @ApiResponse({ status: 200, description: 'Статистика очередей' })
  async getStats(): Promise<ResponseDto<any>> {
    const stats = this.queueService.getQueueStats();
    return ResponseDto.success(stats, 'Статистика очередей получена');
  }

  @Post('send')
  @ApiOperation({ summary: 'Отправить тестовое сообщение в очередь' })
  @ApiResponse({ status: 200, description: 'Сообщение отправлено' })
  async sendMessage(
    @Body() body: { topic: string; data: any; priority?: QueuePriority },
  ): Promise<ResponseDto<{ messageId: string }>> {
    const messageId = await this.queueService.send(body.topic, body.data, {
      priority: body.priority || QueuePriority.NORMAL,
    });

    return ResponseDto.success({ messageId }, 'Сообщение отправлено в очередь');
  }

  @Delete('clear')
  @ApiOperation({ summary: 'Очистить все очереди (только для тестирования)' })
  @ApiResponse({ status: 200, description: 'Очереди очищены' })
  async clearQueues(): Promise<ResponseDto<null>> {
    this.queueService.clearQueues();
    return ResponseDto.success(null, 'Все очереди очищены');
  }
}
