import { Controller, Get, Post, Put, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { ResponseDto } from '../../common/dto/response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { UserRole, UserStatus } from '../../entities/user.entity';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@ApiTags('Администрирование (внутреннее)')
@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth('JWT-auth')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('users')
  @ApiOperation({ 
    summary: 'Получить всех пользователей',
    description: 'Возвращает список всех пользователей с пагинацией'
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Список пользователей получен' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  async getAllUsers(@Query() query: PaginationQueryDto) {
    const { page, limit } = query.getPaginationParams();
    const result = await this.adminService.findAll(page, limit);
    return ResponseDto.success(result, 'Список пользователей получен');
  }

  @Get('users/search')
  @ApiOperation({ 
    summary: 'Поиск пользователей',
    description: 'Поиск пользователей по email или имени'
  })
  @ApiQuery({ name: 'q', required: true, description: 'Поисковый запрос' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Результаты поиска получены' })
  async searchUsers(
    @Query('q') query: string,
    @Query() pagination: PaginationQueryDto
  ) {
    const { page, limit } = pagination.getPaginationParams();
    const result = await this.adminService.searchUsers(query, page, limit);
    return ResponseDto.success(result, 'Результаты поиска получены');
  }

  @Get('users/role/:role')
  @ApiOperation({ 
    summary: 'Получить пользователей по роли',
    description: 'Возвращает пользователей с указанной ролью'
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Пользователи по роли получены' })
  async getUsersByRole(
    @Param('role') role: UserRole,
    @Query() pagination: PaginationQueryDto
  ) {
    const { page, limit } = pagination.getPaginationParams();
    const result = await this.adminService.getUsersByRole(role, page, limit);
    return ResponseDto.success(result, 'Пользователи по роли получены');
  }

  @Get('users/status/:status')
  @ApiOperation({ 
    summary: 'Получить пользователей по статусу',
    description: 'Возвращает пользователей с указанным статусом'
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Пользователи по статусу получены' })
  async getUsersByStatus(
    @Param('status') status: UserStatus,
    @Query() pagination: PaginationQueryDto
  ) {
    const { page, limit } = pagination.getPaginationParams();
    const result = await this.adminService.getUsersByStatus(status, page, limit);
    return ResponseDto.success(result, 'Пользователи по статусу получены');
  }

  @Put('users/:id/role/:role')
  @ApiOperation({ 
    summary: 'Изменить роль пользователя',
    description: 'Изменяет роль пользователя (USER/ADMIN)'
  })
  @ApiResponse({ status: 200, description: 'Роль пользователя изменена' })
  @ApiResponse({ status: 400, description: 'Нельзя удалить последнего администратора' })
  async updateUserRole(
    @Param('id') id: number,
    @Param('role') role: UserRole
  ) {
    const result = await this.adminService.updateRole(id, role);
    return ResponseDto.success(result, 'Роль пользователя изменена');
  }

  @Put('users/:id/status/:status')
  @ApiOperation({ 
    summary: 'Изменить статус пользователя',
    description: 'Изменяет статус пользователя (ACTIVE/BANNED)'
  })
  @ApiResponse({ status: 200, description: 'Статус пользователя изменен' })
  async updateUserStatus(
    @Param('id') id: number,
    @Param('status') status: UserStatus
  ) {
    const result = await this.adminService.updateStatus(id, status);
    return ResponseDto.success(result, 'Статус пользователя изменен');
  }

  @Post('users/:id/make-admin')
  @ApiOperation({ 
    summary: 'Назначить администратором',
    description: 'Назначает пользователя администратором'
  })
  @ApiResponse({ status: 200, description: 'Пользователь назначен администратором' })
  async makeAdmin(@Param('id') id: number) {
    const result = await this.adminService.makeAdmin(id);
    return ResponseDto.success(result, 'Пользователь назначен администратором');
  }

  @Post('users/:id/remove-admin')
  @ApiOperation({ 
    summary: 'Убрать права администратора',
    description: 'Убирает права администратора у пользователя'
  })
  @ApiResponse({ status: 200, description: 'Права администратора убраны' })
  async removeAdmin(@Param('id') id: number) {
    const result = await this.adminService.removeAdmin(id);
    return ResponseDto.success(result, 'Права администратора убраны');
  }

  @Post('users/:id/ban')
  @ApiOperation({ 
    summary: 'Заблокировать пользователя',
    description: 'Блокирует пользователя'
  })
  @ApiResponse({ status: 200, description: 'Пользователь заблокирован' })
  async banUser(@Param('id') id: number) {
    const result = await this.adminService.banUser(id);
    return ResponseDto.success(result, 'Пользователь заблокирован');
  }

  @Post('users/:id/unban')
  @ApiOperation({ 
    summary: 'Разблокировать пользователя',
    description: 'Разблокирует пользователя'
  })
  @ApiResponse({ status: 200, description: 'Пользователь разблокирован' })
  async unbanUser(@Param('id') id: number) {
    const result = await this.adminService.unbanUser(id);
    return ResponseDto.success(result, 'Пользователь разблокирован');
  }

  @Get('statistics')
  @ApiOperation({ 
    summary: 'Статистика пользователей',
    description: 'Возвращает общую статистику по пользователям'
  })
  @ApiResponse({ status: 200, description: 'Статистика получена' })
  async getStatistics() {
    const stats = await this.adminService.getUsersStatistics();
    return ResponseDto.success(stats, 'Статистика пользователей получена');
  }

  @Get('users/:id')
  @ApiOperation({ 
    summary: 'Получить пользователя по ID',
    description: 'Возвращает информацию о конкретном пользователе'
  })
  @ApiResponse({ status: 200, description: 'Пользователь найден' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  async getUserById(@Param('id') id: number) {
    const user = await this.adminService.findById(id);
    return ResponseDto.success(user, 'Пользователь найден');
  }

  @Post('users/:id/verify-email')
  @ApiOperation({ 
    summary: 'Подтвердить email пользователя',
    description: 'Подтверждает email пользователя администратором'
  })
  @ApiResponse({ status: 200, description: 'Email подтвержден' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  async verifyUserEmail(@Param('id') id: number) {
    const user = await this.adminService.verifyEmail(id);
    return ResponseDto.success(user, 'Email пользователя подтвержден');
  }
}
