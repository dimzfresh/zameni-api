import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { ProfileModule } from './modules/profile/profile.module';
import { ServicesModule } from './common/services/services.module';
import { QueueModule } from './modules/queue/queue.module';
import { CronModule } from './modules/cron/cron.module';
import { AdminModule } from './modules/admin/admin.module';
import { MonitoringModule } from './modules/monitoring/monitoring.module';
import { User } from './entities/user.entity';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      validationOptions: {
        allowUnknown: false,
        abortEarly: true,
      },
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.name'),
        entities: [User],
        synchronize: configService.get('nodeEnv') === 'development', // Только для разработки!
        logging: configService.get('nodeEnv') === 'development',
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    ProfileModule,
    ServicesModule,
    QueueModule,
    CronModule,
    AdminModule,
    MonitoringModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
