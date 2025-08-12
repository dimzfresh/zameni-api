import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RegisterDto, LoginDto, AuthResponseDto } from './dto/auth.dto.js';
import { JwtPayload } from './strategies/jwt.strategy.js';
import { User, UserRole, UserStatus } from '../../entities/user.entity';
import { JWT } from '../../common/constants/app.constants';
import { UserService } from '../../common/services/user.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private userService: UserService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, name, password } = registerDto;

    // Проверяем, существует ли пользователь
    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }

    // Создаем пользователя (пароль будет автоматически захеширован в entity)
    const newUser = await this.userService.create(registerDto);

    // Обновляем время последнего входа
    await this.userService.updateLastLogin(newUser.id);

    // Генерируем токен
    return this.generateAuthResponse(newUser);
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Находим пользователя
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    // Проверяем статус пользователя
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Аккаунт заблокирован или неактивен');
    }

    // Проверяем пароль
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    // Обновляем время последнего входа
    await this.userService.updateLastLogin(user.id);

    // Генерируем токен
    return this.generateAuthResponse(user);
  }

  async refreshToken(refreshToken: string): Promise<AuthResponseDto> {
    try {
      // Проверяем refresh token
      const payload = this.jwtService.verify(refreshToken);

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Неверный тип токена');
      }

      const userId = payload.sub;
      const user = await this.userService.findById(userId);

      if (!user) {
        throw new UnauthorizedException('Пользователь не найден');
      }

      // Проверяем, что refresh token в БД совпадает
      if (user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Refresh token недействителен');
      }

      // Проверяем статус пользователя
      if (user.status !== UserStatus.ACTIVE) {
        throw new UnauthorizedException('Аккаунт заблокирован или неактивен');
      }

      return this.generateAuthResponse(user);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Недействительный refresh token');
    }
  }

  async logout(userId: number): Promise<void> {
    // Очищаем refresh token
    await this.userService.updateRefreshToken(userId, null);

    // В будущем здесь можно добавить:
    // 1. Добавить токен в blacklist (Redis)
    // 2. Уменьшить время жизни access token
    // 3. Отправить событие для инвалидации на всех устройствах
  }

  async deleteAccount(userId: number): Promise<void> {
    // Очищаем refresh token перед удалением
    await this.userService.updateRefreshToken(userId, null);

    // Удаляем пользователя из БД
    await this.userService.delete(userId);
  }

  private async generateAuthResponse(user: User): Promise<AuthResponseDto> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      type: 'access',
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: JWT.ACCESS_TOKEN_EXPIRES_IN,
    });

    const refreshPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      type: 'refresh',
    };

    const refreshToken = this.jwtService.sign(refreshPayload, {
      expiresIn: JWT.REFRESH_TOKEN_EXPIRES_IN,
    });

    // Сохраняем refresh token в БД
    await this.userService.updateRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: JWT.DEFAULT_EXPIRES_IN,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
      },
    };
  }
}
