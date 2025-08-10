export const stagingConfig = {
  port: 3000,
  nodeEnv: 'staging',
  database: {
    host: process.env.DB_HOST || 'staging-db.example.com',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'staging-password',
    name: process.env.DB_NAME || 'zameni_staging',
    synchronize: false, // Отключаем автоматическую синхронизацию
    logging: false, // Отключаем логирование SQL
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'staging-secret-key-change-in-production',
    expiresIn: '7d',
  },
  logging: {
    level: 'info',
    prettyPrint: false,
  },
  cors: {
    origin: [
      'https://staging.zameni.com',
      'https://staging-frontend.zameni.com',
      'http://localhost:3000', // для тестирования
    ],
    credentials: true,
  },
  swagger: {
    enabled: true,
    title: 'Zameni API - Staging',
    description: 'API для платформы поиска исполнителей (Staging)',
    version: '1.0',
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 500, // максимум 500 запросов с одного IP
  },
};
