import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { RegisterDto, LoginDto, AuthResponseDto } from './dto/auth.dto';
import { JwtPayload } from './strategies/jwt.strategy';

// Временная модель пользователя (в реальном проекте будет из БД)
interface User {
  id: number;
  email: string;
  name: string;
  password: string;
  createdAt: Date;
}

@Injectable()
export class AuthService {
  private users: User[] = []; // Временное хранилище (в реальности - БД)
  private nextId = 1;

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, name, password } = registerDto;

    const existingUser = this.users.find(user => user.email === email);
    if (existingUser) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser: User = {
      id: this.nextId++,
      email,
      name,
      password: hashedPassword,
      createdAt: new Date(),
    };

    this.users.push(newUser);
    return this.generateAuthResponse(newUser);
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Находим пользователя
    const user = this.users.find(u => u.email === email);
    if (!user) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    // Проверяем пароль
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    return this.generateAuthResponse(user);
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = this.users.find(u => u.email === email);
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async findUserById(id: number): Promise<Omit<User, 'password'> | null> {
    const user = this.users.find(u => u.id === id);
    if (user) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  private async generateAuthResponse(user: User): Promise<AuthResponseDto> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
    };

    const accessToken = this.jwtService.sign(payload);
    const expiresIn = this.configService.get<number>('jwt.expiresIn', 3600);

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  // Метод для получения всех пользователей (для демо)
  async getAllUsers(): Promise<Omit<User, 'password'>[]> {
    return this.users.map(({ password, ...user }) => user);
  }
}
