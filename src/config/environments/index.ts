import { developmentConfig } from './development.config';
import { stagingConfig } from './staging.config';
import { productionConfig } from './production.config';
import { testConfig } from './test.config';

export type Environment = 'development' | 'staging' | 'production' | 'test';

export interface AppConfig {
  port: number;
  nodeEnv: string;
  database: {
    host: string;
    port: number;
    username: string;
    password: string;
    name: string;
    synchronize: boolean;
    logging: boolean;
    ssl?: boolean;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  logging: {
    level: string;
    prettyPrint: boolean;
  };
  cors: {
    origin: string[];
    credentials: boolean;
  };
  swagger: {
    enabled: boolean;
    title: string;
    description: string;
    version: string;
  };
  rateLimit: {
    windowMs: number;
    max: number;
  };
  security?: {
    helmet: boolean;
    compression: boolean;
    trustProxy: boolean;
  };
}

const configs: Record<Environment, AppConfig> = {
  development: developmentConfig,
  staging: stagingConfig,
  production: productionConfig,
  test: testConfig,
};

export function getConfig(environment: Environment = 'development'): AppConfig {
  const config = configs[environment];

  if (!config) {
    throw new Error(`Configuration for environment '${environment}' not found`);
  }

  return config;
}

export function getCurrentConfig(): AppConfig {
  const environment = (process.env.NODE_ENV as Environment) || 'development';
  return getConfig(environment);
}

export { developmentConfig, stagingConfig, productionConfig, testConfig };
