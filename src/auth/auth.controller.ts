import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, AuthResponseDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ResponseDto } from '../common/dto/response.dto';

@ApiTags('Аутентификация')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Регистрация нового пользователя' })
  @ApiResponse({ status: 201, description: 'Пользователь успешно зарегистрирован' })
  @ApiResponse({ status: 400, description: 'Ошибка валидации данных' })
  @ApiResponse({ status: 409, description: 'Пользователь с таким email уже существует' })
  async register(@Body() registerDto: RegisterDto): Promise<ResponseDto<AuthResponseDto>> {
    const result = await this.authService.register(registerDto);
    return ResponseDto.success(result, 'Регистрация прошла успешно');
  }

  @Post('login')
  @ApiOperation({ summary: 'Вход в систему' })
  @ApiResponse({ status: 200, description: 'Успешная авторизация' })
  @ApiResponse({ status: 401, description: 'Неверные учетные данные' })
  async login(@Body() loginDto: LoginDto): Promise<ResponseDto<AuthResponseDto>> {
    const result = await this.authService.login(loginDto);
    return ResponseDto.success(result, 'Авторизация прошла успешно');
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Получить профиль текущего пользователя' })
  @ApiResponse({ status: 200, description: 'Профиль пользователя' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async getProfile(@Request() req): Promise<ResponseDto<any>> {
    const user = await this.authService.findUserById(req.user.id);
    return ResponseDto.success(user, 'Профиль получен успешно');
  }

  @Get('users')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Получить список всех пользователей (демо)' })
  @ApiResponse({ status: 200, description: 'Список пользователей' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async getAllUsers(): Promise<ResponseDto<any[]>> {
    const users = await this.authService.getAllUsers();
    return ResponseDto.success(users, 'Список пользователей получен');
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Выход из системы' })
  @ApiResponse({ status: 200, description: 'Успешный выход' })
  async logout(): Promise<ResponseDto<null>> {
    // В реальном приложении здесь может быть логика добавления токена в blacklist
    return ResponseDto.success(null, 'Выход выполнен успешно');
  }
}
