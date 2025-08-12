import { Injectable, Logger } from '@nestjs/common';
import { UserService } from '../../common/services/user.service';
import { QueueService } from '../queue/queue.service';
import { PERFORMANCE } from '../../common/constants/app.constants';

export interface SystemMetrics {
  users: {
    total: number;
    active: number;
    inactive: number;
    verified: number;
    unverified: number;
  };
  queue: {
    pending: number;
    processing: number;
    topics: string[];
  };
  database: {
    status: 'healthy' | 'unhealthy';
    responseTime: number;
    connections: number;
  };
  system: {
    uptime: number;
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
    cpu: {
      load: number;
    };
  };
  performance: {
    requestsPerSecond: number;
    averageResponseTime: number;
    errorRate: number;
  };
}

@Injectable()
export class MonitoringService {
  private readonly logger = new Logger(MonitoringService.name);
  private requestCount = 0;
  private errorCount = 0;
  private responseTimes: number[] = [];
  private startTime = Date.now();

  constructor(
    private userService: UserService,
    private queueService: QueueService,
  ) {}

  /**
   * Получение всех метрик системы
   */
  async getSystemMetrics(): Promise<SystemMetrics> {
    const [
      userMetrics,
      queueMetrics,
      databaseMetrics,
      systemMetrics,
      performanceMetrics,
    ] = await Promise.all([
      this.getUserMetrics(),
      this.getQueueMetrics(),
      this.getDatabaseMetrics(),
      this.getSystemMetricsInternal(),
      this.getPerformanceMetrics(),
    ]);

    return {
      users: userMetrics,
      queue: queueMetrics,
      database: databaseMetrics,
      system: systemMetrics,
      performance: performanceMetrics,
    };
  }

  /**
   * Метрики пользователей
   */
  private async getUserMetrics() {
    try {
      const inactiveStats = await this.userService.getInactiveUsersStatistics();

      // Получаем общее количество пользователей через репозиторий
      const total = await this.userService.userRepository.count();

      return {
        total,
        active: total - inactiveStats.inactive6Months,
        inactive: inactiveStats.inactive6Months,
        verified: inactiveStats.verifiedUsers,
        unverified: inactiveStats.unverifiedUsers,
      };
    } catch (error) {
      this.logger.error('Error getting user metrics:', error);
      return {
        total: 0,
        active: 0,
        inactive: 0,
        verified: 0,
        unverified: 0,
      };
    }
  }

  /**
   * Метрики очередей
   */
  private async getQueueMetrics() {
    try {
      const stats = this.queueService.getQueueStats();
      const topics = Object.keys(stats);

      const pending = topics.reduce(
        (sum, topic) => sum + stats[topic].pending,
        0,
      );
      const processing = topics.reduce(
        (sum, topic) => sum + stats[topic].processing,
        0,
      );

      return {
        pending,
        processing,
        topics,
      };
    } catch (error) {
      this.logger.error('Error getting queue metrics:', error);
      return {
        pending: 0,
        processing: 0,
        topics: [],
      };
    }
  }

  /**
   * Метрики базы данных
   */
  private async getDatabaseMetrics() {
    const startTime = Date.now();

    try {
      // Проверяем подключение к БД
      await this.userService.userRepository.count();
      const responseTime = Date.now() - startTime;

      return {
        status: 'healthy' as const,
        responseTime,
        connections: 0, // В реальности получаем из пула соединений
      };
    } catch (error) {
      return {
        status: 'unhealthy' as const,
        responseTime: Date.now() - startTime,
        connections: 0,
      };
    }
  }

  /**
   * Системные метрики
   */
  private async getSystemMetricsInternal() {
    const uptime = Date.now() - this.startTime;
    const memUsage = process.memoryUsage();
    const totalMemory = memUsage.heapTotal;
    const usedMemory = memUsage.heapUsed;

    return {
      uptime,
      memory: {
        used: usedMemory,
        total: totalMemory,
        percentage: (usedMemory / totalMemory) * 100,
      },
      cpu: {
        load: process.cpuUsage().user / 1000000, // в секундах
      },
    };
  }

  /**
   * Метрики производительности
   */
  private async getPerformanceMetrics() {
    const uptime = (Date.now() - this.startTime) / 1000; // в секундах
    const requestsPerSecond = this.requestCount / uptime;

    const averageResponseTime =
      this.responseTimes.length > 0
        ? this.responseTimes.reduce((a, b) => a + b, 0) /
          this.responseTimes.length
        : 0;

    const errorRate =
      this.requestCount > 0 ? (this.errorCount / this.requestCount) * 100 : 0;

    return {
      requestsPerSecond,
      averageResponseTime,
      errorRate,
    };
  }

  /**
   * Регистрация запроса
   */
  recordRequest(duration: number, isError: boolean = false) {
    this.requestCount++;
    if (isError) {
      this.errorCount++;
    }

    this.responseTimes.push(duration);

    // Ограничиваем массив последними 1000 запросами
    if (this.responseTimes.length > PERFORMANCE.MAX_RESPONSE_TIMES_HISTORY) {
      this.responseTimes = this.responseTimes.slice(
        -PERFORMANCE.MAX_RESPONSE_TIMES_HISTORY,
      );
    }
  }

  /**
   * Проверка здоровья системы
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    checks: Record<
      string,
      { status: 'healthy' | 'unhealthy'; message?: string }
    >;
  }> {
    const checks: Record<
      string,
      { status: 'healthy' | 'unhealthy'; message?: string }
    > = {};

    // Проверка базы данных
    try {
      await this.userService.userRepository.count();
      checks.database = { status: 'healthy' };
    } catch (error) {
      checks.database = { status: 'unhealthy', message: error.message };
    }

    // Проверка очередей
    try {
      this.queueService.getQueueStats();
      checks.queue = { status: 'healthy' };
    } catch (error) {
      checks.queue = { status: 'unhealthy', message: error.message };
    }

    // Проверка памяти
    const memUsage = process.memoryUsage();
    const memoryPercentage = (memUsage.heapUsed / memUsage.heapTotal) * 100;

    if (memoryPercentage > 90) {
      checks.memory = {
        status: 'unhealthy',
        message: `Memory usage: ${memoryPercentage.toFixed(2)}%`,
      };
    } else {
      checks.memory = { status: 'healthy' };
    }

    // Проверка uptime
    const uptime = Date.now() - this.startTime;
    if (uptime < 60000) {
      // Меньше минуты
      checks.uptime = { status: 'unhealthy', message: 'Service just started' };
    } else {
      checks.uptime = { status: 'healthy' };
    }

    const isHealthy = Object.values(checks).every(
      (check) => check.status === 'healthy',
    );

    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      checks,
    };
  }

  /**
   * Получение алертов
   */
  async getAlerts(): Promise<
    Array<{
      severity: 'low' | 'medium' | 'high' | 'critical';
      message: string;
      timestamp: Date;
    }>
  > {
    const alerts: Array<{
      severity: 'low' | 'medium' | 'high' | 'critical';
      message: string;
      timestamp: Date;
    }> = [];

    const metrics = await this.getSystemMetrics();

    // Проверка error rate
    if (metrics.performance.errorRate > 10) {
      alerts.push({
        severity: 'critical',
        message: `High error rate: ${metrics.performance.errorRate.toFixed(2)}%`,
        timestamp: new Date(),
      });
    } else if (metrics.performance.errorRate > 5) {
      alerts.push({
        severity: 'high',
        message: `Elevated error rate: ${metrics.performance.errorRate.toFixed(2)}%`,
        timestamp: new Date(),
      });
    }

    // Проверка памяти
    if (metrics.system.memory.percentage > 90) {
      alerts.push({
        severity: 'critical',
        message: `High memory usage: ${metrics.system.memory.percentage.toFixed(2)}%`,
        timestamp: new Date(),
      });
    } else if (metrics.system.memory.percentage > 80) {
      alerts.push({
        severity: 'high',
        message: `Elevated memory usage: ${metrics.system.memory.percentage.toFixed(2)}%`,
        timestamp: new Date(),
      });
    }

    // Проверка очередей
    if (metrics.queue.pending > 1000) {
      alerts.push({
        severity: 'high',
        message: `High queue backlog: ${metrics.queue.pending} pending messages`,
        timestamp: new Date(),
      });
    }

    // Проверка базы данных
    if (metrics.database.status === 'unhealthy') {
      alerts.push({
        severity: 'critical',
        message: 'Database connection issues',
        timestamp: new Date(),
      });
    }

    return alerts;
  }
}
