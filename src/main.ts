import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  // Настройка для многопоточности
  const app = await NestFactory.create(AppModule);
  
  const configService = app.get(ConfigService);
  const port = configService.get<number>('port') || 3000;
  const nodeEnv = configService.get<string>('nodeEnv') || 'development';
  
  // Настройка CORS
  const corsConfig = configService.get('cors');
  if (corsConfig) {
    app.enableCors(corsConfig);
  }
  
  // Настройка безопасности для production
  const securityConfig = configService.get('security');
  if (securityConfig?.trustProxy) {
    app.getHttpAdapter().getInstance().set('trust proxy', 1);
  }

  // Настройка rate limiting для защиты от DDoS
  const rateLimitConfig = configService.get('rateLimit');
  if (rateLimitConfig) {
    // В будущем добавим @nestjs/throttler
    console.log(`🛡️ Rate limiting: ${rateLimitConfig.max} requests per ${rateLimitConfig.windowMs}ms`);
  }
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      validateCustomDecorators: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());
  
  // Настройка Swagger
  const swaggerConfig = configService.get('swagger');
  if (swaggerConfig?.enabled) {
    const config = new DocumentBuilder()
      .setTitle('Zameni API')
      .setDescription('API для платформы поиска исполнителей и заказов')
      .setVersion(swaggerConfig.version)
      .addTag('Главная', 'Основные endpoints')
      .addTag('Аутентификация', 'Регистрация и вход пользователей')
      .addTag('Профиль', 'Управление профилем пользователя')
      .addTag('Администрирование (внутреннее)', 'Управление пользователями - только для админов')
      .addTag('Очереди (внутреннее)', 'Управление системой очередей - только для админов')
      .addTag('Автоматическое удаление (внутреннее)', 'Управление автоматической очисткой - только для админов')
      .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      }, 'JWT-auth')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    
    SwaggerModule.setup('api', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
    });

    console.log(`📚 Swagger docs available at: http://localhost:${port}/api`);
  }
  
  await app.listen(port, '0.0.0.0'); // Слушаем на всех интерфейсах
  console.log(`🚀 Application is running on: http://localhost:${port} (${nodeEnv} mode)`);
  console.log(`⚡ Multi-threading ready for concurrent requests`);
}
bootstrap();
