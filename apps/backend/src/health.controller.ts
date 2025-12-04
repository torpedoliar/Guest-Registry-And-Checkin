import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  version: string;
  checks: {
    database: {
      status: string;
      responseTime: number;
      details?: any;
    };
    memory: {
      status: string;
      heapUsed: number;
      heapTotal: number;
      rss: number;
      percentUsed: number;
    };
  };
}

@Controller('health')
export class HealthController {
  private startTime = Date.now();

  constructor(private prisma: PrismaService) {}

  @Get()
  async check(): Promise<HealthStatus> {
    const dbHealth = await this.prisma.healthCheck();
    const memUsage = process.memoryUsage();
    const heapPercentUsed = Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100);

    const memoryStatus = heapPercentUsed > 90 ? 'critical' : heapPercentUsed > 70 ? 'warning' : 'healthy';
    
    let overallStatus: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
    if (dbHealth.status === 'unhealthy') {
      overallStatus = 'unhealthy';
    } else if (memoryStatus === 'critical' || memoryStatus === 'warning') {
      overallStatus = 'degraded';
    }

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: Math.round((Date.now() - this.startTime) / 1000),
      version: process.env.npm_package_version || '0.1.0',
      checks: {
        database: dbHealth,
        memory: {
          status: memoryStatus,
          heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
          heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
          rss: Math.round(memUsage.rss / 1024 / 1024),
          percentUsed: heapPercentUsed,
        },
      },
    };
  }

  @Get('live')
  liveness() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get('ready')
  async readiness() {
    const dbHealth = await this.prisma.healthCheck();
    if (dbHealth.status === 'unhealthy') {
      return { status: 'not ready', database: dbHealth };
    }
    return { status: 'ready', timestamp: new Date().toISOString() };
  }

  @Get('db')
  async dbStats() {
    const health = await this.prisma.healthCheck();
    const connectionStats = await this.prisma.getConnectionStats();
    return { ...health, connections: connectionStats };
  }
}
