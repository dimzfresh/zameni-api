import { getCurrentConfig } from './environments';

export default () => {
  const config = getCurrentConfig();
  
  return {
    port: config.port,
    nodeEnv: config.nodeEnv,
    database: {
      url: process.env.DATABASE_URL || '',
      host: config.database.host,
      port: config.database.port,
      username: config.database.username,
      password: config.database.password,
      name: config.database.name,
      synchronize: config.database.synchronize,
      logging: config.database.logging,
      ssl: config.database.ssl,
    },
    jwt: {
      secret: config.jwt.secret,
      expiresIn: config.jwt.expiresIn,
    },
    logging: {
      level: config.logging.level,
      prettyPrint: config.logging.prettyPrint,
    },
    cors: config.cors,
    swagger: config.swagger,
    rateLimit: config.rateLimit,
    security: config.security,
  };
};
