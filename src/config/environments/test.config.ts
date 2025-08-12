import { AppConfig } from './index';

export const testConfig: AppConfig = {
  port: 3000,
  nodeEnv: 'test',
  database: {
    host: ':memory:',
    port: 0,
    username: '',
    password: '',
    name: 'test',
    synchronize: true,
    logging: false,
  },
  jwt: {
    secret: 'test-secret-key',
    expiresIn: '7d',
  },
  logging: {
    level: 'error',
    prettyPrint: false,
  },
  cors: {
    origin: ['http://localhost:3000'],
    credentials: true,
  },
  swagger: {
    enabled: false,
    title: 'Zameni API',
    description: 'API для сервиса замены',
    version: '1.0.0',
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  },
  security: {
    helmet: false,
    compression: false,
    trustProxy: false,
  },
};
