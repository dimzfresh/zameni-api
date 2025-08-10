/**
 * Константы приложения
 * Все магические числа и завязки на конкретные значения должны быть здесь
 */

// HTTP статус коды
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Пагинация
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100, // Максимум 100 элементов на страницу
  MIN_LIMIT: 1,
  MAX_PAGE: 10000, // Максимум 10,000 страниц (защита от перебора)
} as const;

// JWT токены
export const JWT = {
  ACCESS_TOKEN_EXPIRES_IN: '1h', // 1 час
  REFRESH_TOKEN_EXPIRES_IN: '30d', // 30 дней
  DEFAULT_EXPIRES_IN: 3600, // 1 час в секундах
  SALT_ROUNDS: 12, // Количество раундов для bcrypt
} as const;

// Валидация
export const VALIDATION = {
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
  },
  PASSWORD: {
    MIN_LENGTH: 6,
  },
  PHONE: {
    MIN_LENGTH: 7,
    MAX_LENGTH: 15,
  },
  EMAIL: {
    MAX_LENGTH: 255,
  },
} as const;

// База данных
export const DATABASE = {
  CONNECTION_POOL: {
    DEFAULT_LIMIT: 20,
    ACQUIRE_TIMEOUT: 60000, // 60 секунд
    QUERY_TIMEOUT: 60000, // 60 секунд
    IDLE_TIMEOUT: 30000, // 30 секунд
  },
  DECIMAL: {
    PRECISION: 10,
    SCALE: 2,
  },
} as const;

// Rate Limiting
export const RATE_LIMIT = {
  WINDOW_MS: 15 * 60 * 1000, // 15 минут
  DEVELOPMENT: {
    MAX_REQUESTS: 1000,
  },
  PRODUCTION: {
    MAX_REQUESTS: 100,
  },
} as const;

// Производительность
export const PERFORMANCE = {
  MAX_CONCURRENT_REQUESTS: 1000,
  REQUEST_TIMEOUT: 30000, // 30 секунд
  KEEP_ALIVE_TIMEOUT: 65000, // 65 секунд
  MAX_RESPONSE_TIMES_HISTORY: 1000,
  MEMORY_THRESHOLDS: {
    WARNING: 80, // 80%
    CRITICAL: 90, // 90%
  },
  ERROR_RATE_THRESHOLD: 10, // 10%
  UPTIME_MINIMUM: 60000, // 1 минута
  QUEUE_PENDING_THRESHOLD: 1000,
} as const;

// Cron задачи
export const CRON = {
  CLEANUP_INACTIVE_USERS: '0 2 * * *', // Каждый день в 2:00
  NOTIFY_INACTIVE_USERS: '0 10 * * *', // Каждый день в 10:00
} as const;

// Пользователи
export const USER = {
  INACTIVE_PERIODS: {
    UNVERIFIED: 6 * 30 * 24 * 60 * 60 * 1000, // 6 месяцев в миллисекундах
    VERIFIED: 12 * 30 * 24 * 60 * 60 * 1000, // 12 месяцев в миллисекундах
  },
} as const;

// Генерация ID
export const ID_GENERATION = {
  REQUEST_ID_PREFIX: 'req',
  MESSAGE_ID_PREFIX: 'msg',
  RANDOM_SUFFIX_LENGTH: 9,
  BASE_36: 36,
} as const;

// Порты по умолчанию
export const PORTS = {
  DEFAULT: 3000,
  POSTGRES: 5432,
} as const;

// CORS origins для разработки
export const CORS_ORIGINS = {
  DEVELOPMENT: [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://localhost:8080'
  ],
} as const;

// Таймауты
export const TIMEOUTS = {
  QUEUE_PROCESSING: 30000, // 30 секунд
  QUEUE_RETRY_DELAY: 5000, // 5 секунд
  QUEUE_MAX_RETRIES: 3,
} as const;

// Приоритеты очереди
export const QUEUE_PRIORITY = {
  HIGH: 'high',
  NORMAL: 'normal',
  LOW: 'low',
} as const;

// Топики очереди
export const QUEUE_TOPICS = {
  USER_REGISTRATION: 'user.registration',
  USER_LOGIN: 'user.login',
  USER_REFRESH: 'user.refresh',
  USER_LOGOUT: 'user.logout',
  USER_DELETE: 'user.delete',
  USER_CLEANUP: 'user.cleanup',
  NOTIFICATION_SEND: 'notification.send',
} as const;
