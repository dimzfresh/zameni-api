import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CronService } from './cron.service';
import { AdminGuard } from '../auth/guards/admin.guard';
import { ResponseDto } from '../../common/dto/response.dto';

@ApiTags('Автоматическое удаление (внутреннее)')
@Controller('cron')
@UseGuards(AdminGuard)
@ApiBearerAuth('JWT-auth')
export class CronController {
  constructor(private cronService: CronService) {}

  @Post('cleanup/manual')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Ручной запуск очистки неактивных пользователей',
    description: 'Удаляет пользователей, неактивных более 6 месяцев'
  })
  @ApiResponse({ status: 200, description: 'Очистка выполнена' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async manualCleanup(): Promise<ResponseDto<{ deleted: number; errors: number }>> {
    const result = await this.cronService.manualCleanup();
    return ResponseDto.success(result, 'Очистка неактивных пользователей выполнена');
  }

  @Get('cleanup/stats')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Статистика неактивных пользователей',
    description: 'Показывает количество пользователей, подлежащих удалению'
  })
  @ApiResponse({ status: 200, description: 'Статистика получена' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async getCleanupStats(): Promise<ResponseDto<any>> {
    const stats = await this.cronService.getInactiveUsersStats();
    return ResponseDto.success(stats, 'Статистика неактивных пользователей получена');
  }
}
