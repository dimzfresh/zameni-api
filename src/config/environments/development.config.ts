import { PORTS, CORS_ORIGINS, RATE_LIMIT } from '../../common/constants/app.constants';

export const developmentConfig = {
  port: PORTS.DEFAULT,
  nodeEnv: 'development',
  database: {
    host: 'localhost',
    port: PORTS.POSTGRES,
    username: 'postgres',
    password: 'password',
    name: 'zameni_development',
    synchronize: true, // Автоматическая синхронизация схемы
    logging: true, // Логирование SQL запросов
  },
  jwt: {
    secret: 'dev-secret-key-change-in-production',
    expiresIn: '7d',
  },
  logging: {
    level: 'debug',
    prettyPrint: true,
  },
  cors: {
    origin: [...CORS_ORIGINS.DEVELOPMENT],
    credentials: true,
  },
  swagger: {
    enabled: true,
    title: 'Zameni API - Development',
    description: 'API для платформы поиска исполнителей (Development)',
    version: '1.0',
  },
  rateLimit: {
    windowMs: RATE_LIMIT.WINDOW_MS,
    max: RATE_LIMIT.DEVELOPMENT.MAX_REQUESTS,
  },
};
