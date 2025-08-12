import {
  Controller,
  Post,
  Delete,
  Body,
  UseGuards,
  Request,
  Get,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  RegisterDto,
  LoginDto,
  AuthResponseDto,
  RefreshTokenDto,
  AsyncRegisterResponseDto,
  RegistrationStatusDto,
} from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ResponseDto } from '../../common/dto/response.dto';
import { QueueService } from '../queue/queue.service';
import { HTTP_STATUS } from '../../common/constants/app.constants';
import { QueueTopic, QueuePriority } from '../queue/enums/queue.enum';
import { IdGenerator } from '../../common/utils/id-generator';

@ApiTags('Аутентификация')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private queueService: QueueService,
  ) {}

  @Post('register')
  @ApiOperation({
    summary: 'Регистрация нового пользователя (асинхронная)',
    description:
      'Регистрация через очередь сообщений для защиты от DDoS. Возвращает messageId для отслеживания.',
  })
  @ApiResponse({
    status: HTTP_STATUS.ACCEPTED,
    description: 'Регистрация принята в обработку',
  })
  @ApiResponse({
    status: HTTP_STATUS.BAD_REQUEST,
    description: 'Ошибка валидации данных',
  })
  async register(
    @Body() registerDto: RegisterDto,
  ): Promise<ResponseDto<AsyncRegisterResponseDto>> {
    const messageId = await this.queueService.send(
      QueueTopic.USER_REGISTRATION,
      registerDto,
      {
        priority: QueuePriority.HIGH,
      },
    );

    const requestId = IdGenerator.generateRequestId();

    return ResponseDto.success(
      {
        messageId,
        message: 'Регистрация принята в обработку',
        requestId,
      },
      'Запрос на регистрацию отправлен в очередь',
    );
  }

  @Post('login')
  @ApiOperation({
    summary: 'Вход в систему (асинхронный)',
    description: 'Асинхронная авторизация через очередь для защиты от DDoS',
  })
  @ApiResponse({
    status: HTTP_STATUS.ACCEPTED,
    description: 'Запрос на вход принят в обработку',
  })
  @ApiResponse({
    status: HTTP_STATUS.BAD_REQUEST,
    description: 'Ошибка валидации данных',
  })
  async login(
    @Body() loginDto: LoginDto,
  ): Promise<ResponseDto<AsyncRegisterResponseDto>> {
    const messageId = await this.queueService.send(
      QueueTopic.USER_LOGIN,
      loginDto,
      {
        priority: QueuePriority.HIGH,
      },
    );

    const requestId = IdGenerator.generateRequestId();

    return ResponseDto.success(
      {
        messageId,
        message: 'Запрос на вход принят в обработку',
        requestId,
      },
      'Запрос на авторизацию отправлен в очередь',
    );
  }

  @Post('refresh')
  @ApiOperation({
    summary: 'Обновить токен доступа (асинхронный)',
    description: 'Асинхронное обновление токена через очередь',
  })
  @ApiResponse({
    status: HTTP_STATUS.ACCEPTED,
    description: 'Запрос на обновление токена принят',
  })
  @ApiResponse({
    status: HTTP_STATUS.BAD_REQUEST,
    description: 'Ошибка валидации данных',
  })
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<ResponseDto<AsyncRegisterResponseDto>> {
    const messageId = await this.queueService.send(
      QueueTopic.USER_REFRESH,
      refreshTokenDto,
      {
        priority: QueuePriority.NORMAL,
      },
    );

    const requestId = IdGenerator.generateRequestId();

    return ResponseDto.success(
      {
        messageId,
        message: 'Запрос на обновление токена принят в обработку',
        requestId,
      },
      'Запрос на обновление токена отправлен в очередь',
    );
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Выход из системы (асинхронный)',
    description: 'Асинхронный выход через очередь',
  })
  @ApiResponse({
    status: HTTP_STATUS.ACCEPTED,
    description: 'Запрос на выход принят',
  })
  @ApiResponse({
    status: HTTP_STATUS.UNAUTHORIZED,
    description: 'Не авторизован',
  })
  async logout(@Request() req): Promise<ResponseDto<AsyncRegisterResponseDto>> {
    const messageId = await this.queueService.send(
      QueueTopic.USER_LOGOUT,
      { userId: req.user.id },
      {
        priority: QueuePriority.NORMAL,
      },
    );

    const requestId = IdGenerator.generateRequestId();

    return ResponseDto.success(
      {
        messageId,
        message: 'Запрос на выход принят в обработку',
        requestId,
      },
      'Запрос на выход отправлен в очередь',
    );
  }

  @Delete('delete')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Удаление аккаунта (асинхронное)',
    description: 'Асинхронное удаление аккаунта через очередь',
  })
  @ApiResponse({
    status: HTTP_STATUS.ACCEPTED,
    description: 'Запрос на удаление принят',
  })
  @ApiResponse({
    status: HTTP_STATUS.UNAUTHORIZED,
    description: 'Не авторизован',
  })
  async deleteAccount(
    @Request() req,
  ): Promise<ResponseDto<AsyncRegisterResponseDto>> {
    const messageId = await this.queueService.send(
      QueueTopic.USER_DELETE,
      { userId: req.user.id },
      {
        priority: QueuePriority.HIGH,
      },
    );

    const requestId = IdGenerator.generateRequestId();

    return ResponseDto.success(
      {
        messageId,
        message: 'Запрос на удаление аккаунта принят в обработку',
        requestId,
      },
      'Запрос на удаление аккаунта отправлен в очередь',
    );
  }

  @Get('status/:messageId')
  @ApiOperation({
    summary: 'Проверить статус асинхронной операции',
    description:
      'Проверяет статус обработки любой асинхронной операции по messageId',
  })
  @ApiResponse({ status: HTTP_STATUS.OK, description: 'Статус операции' })
  @ApiResponse({
    status: HTTP_STATUS.NOT_FOUND,
    description: 'Операция не найдена',
  })
  async checkOperationStatus(
    @Param('messageId') messageId: string,
  ): Promise<ResponseDto<RegistrationStatusDto>> {
    const status = await this.queueService.getMessageStatus(messageId);
    return ResponseDto.success(status, 'Статус операции получен');
  }
}
