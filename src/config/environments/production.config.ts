import { PORTS, DATABASE, RATE_LIMIT, PERFORMANCE } from '../../common/constants/app.constants';

export const productionConfig = {
  port: parseInt(process.env.PORT || PORTS.DEFAULT.toString(), 10),
  nodeEnv: 'production',
  database: {
    host: process.env.DB_HOST || 'production-db.example.com',
    port: parseInt(process.env.DB_PORT || PORTS.POSTGRES.toString(), 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'production-password',
    name: process.env.DB_NAME || 'zameni_production',
    synchronize: false, // Никогда не включаем в production!
    logging: false, // Отключаем логирование SQL
    ssl: true, // Включаем SSL для production
    // Настройки пула соединений для многопоточности
    extra: {
      connectionLimit: DATABASE.CONNECTION_POOL.DEFAULT_LIMIT,
      acquireTimeout: DATABASE.CONNECTION_POOL.ACQUIRE_TIMEOUT,
      timeout: DATABASE.CONNECTION_POOL.QUERY_TIMEOUT,
      idleTimeout: DATABASE.CONNECTION_POOL.IDLE_TIMEOUT,
    },
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'production-secret-key-must-be-set',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  logging: {
    level: 'warn',
    prettyPrint: false,
  },
  cors: {
    origin: [
      'https://zameni.com',
      'https://www.zameni.com',
      'https://app.zameni.com',
    ],
    credentials: true,
  },
  swagger: {
    enabled: false, // Отключаем Swagger в production
    title: 'Zameni API',
    description: 'API для платформы поиска исполнителей',
    version: '1.0',
  },
  rateLimit: {
    windowMs: RATE_LIMIT.WINDOW_MS,
    max: RATE_LIMIT.PRODUCTION.MAX_REQUESTS,
  },
  security: {
    helmet: true,
    compression: true,
    trustProxy: true,
  },
  // Настройки для многопоточности
  performance: {
    maxConcurrentRequests: PERFORMANCE.MAX_CONCURRENT_REQUESTS,
    requestTimeout: PERFORMANCE.REQUEST_TIMEOUT,
    keepAlive: true, // Keep-alive соединения
    keepAliveTimeout: PERFORMANCE.KEEP_ALIVE_TIMEOUT,
  },
};
