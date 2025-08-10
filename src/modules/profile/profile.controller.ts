import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import { User } from '../../entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ResponseDto } from '../../common/dto/response.dto';
import { UpdateProfileDto } from './dto/update-user.dto';

@ApiTags('Профиль')
@Controller('profile')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('current')
  @ApiOperation({ summary: 'Получить профиль текущего пользователя' })
  @ApiResponse({ status: 200, description: 'Профиль получен успешно' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async getProfile(@Request() req): Promise<ResponseDto<User>> {
    const user = await this.profileService.findById(req.user.id);
    return {
      success: true,
      data: user,
      message: 'Профиль получен успешно',
    };
  }

  @Put('current')
  @ApiOperation({ summary: 'Обновить профиль текущего пользователя' })
  @ApiResponse({ status: 200, description: 'Профиль обновлен успешно' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async updateProfile(
    @Request() req,
    @Body() updateData: UpdateProfileDto,
  ): Promise<ResponseDto<User>> {
    const user = await this.profileService.updateProfile(req.user.id, updateData);
    return {
      success: true,
      data: user,
      message: 'Профиль обновлен успешно',
    };
  }

  @Post('current')
  @ApiOperation({ summary: 'Обновить профиль текущего пользователя (POST)' })
  @ApiResponse({ status: 200, description: 'Профиль обновлен успешно' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async updateProfilePost(
    @Request() req,
    @Body() updateData: UpdateProfileDto,
  ): Promise<ResponseDto<User>> {
    const user = await this.profileService.updateProfile(req.user.id, updateData);
    return {
      success: true,
      data: user,
      message: 'Профиль обновлен успешно',
    };
  }
}
