import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LoggerService } from '../logger/logger.service';

export enum AuditAction {
  // Auth
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGOUT = 'LOGOUT',
  
  // Guest
  GUEST_CREATE = 'GUEST_CREATE',
  GUEST_UPDATE = 'GUEST_UPDATE',
  GUEST_DELETE = 'GUEST_DELETE',
  GUEST_BULK_DELETE = 'GUEST_BULK_DELETE',
  GUEST_IMPORT = 'GUEST_IMPORT',
  GUEST_EXPORT = 'GUEST_EXPORT',
  GUEST_CHECKIN = 'GUEST_CHECKIN',
  GUEST_UNCHECKIN = 'GUEST_UNCHECKIN',
  
  // Event
  EVENT_CREATE = 'EVENT_CREATE',
  EVENT_UPDATE = 'EVENT_UPDATE',
  EVENT_DELETE = 'EVENT_DELETE',
  EVENT_ACTIVATE = 'EVENT_ACTIVATE',
  
  // Prize
  PRIZE_CREATE = 'PRIZE_CREATE',
  PRIZE_UPDATE = 'PRIZE_UPDATE',
  PRIZE_DELETE = 'PRIZE_DELETE',
  LUCKY_DRAW = 'LUCKY_DRAW',
  PRIZE_COLLECT = 'PRIZE_COLLECT',
  
  // Souvenir
  SOUVENIR_CREATE = 'SOUVENIR_CREATE',
  SOUVENIR_UPDATE = 'SOUVENIR_UPDATE',
  SOUVENIR_DELETE = 'SOUVENIR_DELETE',
  SOUVENIR_GIVE = 'SOUVENIR_GIVE',
  
  // User
  USER_CREATE = 'USER_CREATE',
  USER_UPDATE = 'USER_UPDATE',
  USER_DELETE = 'USER_DELETE',
  
  // System
  SYSTEM_CONFIG_UPDATE = 'SYSTEM_CONFIG_UPDATE',
}

export interface AuditLogInput {
  action: AuditAction | string;
  adminUserId?: string;
  adminUsername?: string;
  targetType?: string;
  targetId?: string;
  targetName?: string;
  changes?: Record<string, { old: any; new: any }>;
  metadata?: Record<string, any>;
  ip?: string;
  userAgent?: string;
}

@Injectable()
export class AuditService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
  ) {}

  async log(input: AuditLogInput) {
    const { action, adminUserId, adminUsername, ...rest } = input;
    
    // Log to Winston
    this.logger.logAudit(action, adminUserId || 'system', {
      adminUsername,
      ...rest,
    });

    // Persist to database
    try {
      await this.prisma.auditLog.create({
        data: {
          action,
          adminUserId,
          metadata: {
            adminUsername,
            ...rest,
          },
        },
      });
    } catch (error) {
      this.logger.error(`Failed to persist audit log: ${error}`, undefined, 'AuditService');
    }
  }

  async getAuditLogs(options: {
    page?: number;
    pageSize?: number;
    action?: string;
    adminUserId?: string;
    startDate?: Date;
    endDate?: Date;
    search?: string;
  }) {
    const { page = 1, pageSize = 50, action, adminUserId, startDate, endDate, search } = options;

    const where: any = {};

    if (action) {
      where.action = action;
    }

    if (adminUserId) {
      where.adminUserId = adminUserId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [total, data] = await this.prisma.$transaction([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    // Filter by search if provided (search in metadata JSON)
    let filteredData = data;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredData = data.filter(log => {
        const metaStr = JSON.stringify(log.metadata || {}).toLowerCase();
        return log.action.toLowerCase().includes(searchLower) || metaStr.includes(searchLower);
      });
    }

    return { total, data: filteredData, page, pageSize };
  }

  async getAuditActions() {
    return Object.values(AuditAction);
  }

  async getAuditStats(days = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logs = await this.prisma.auditLog.findMany({
      where: { createdAt: { gte: startDate } },
      select: { action: true, createdAt: true },
    });

    const byAction: Record<string, number> = {};
    const byDate: Record<string, number> = {};

    for (const log of logs) {
      byAction[log.action] = (byAction[log.action] || 0) + 1;
      const date = log.createdAt.toISOString().split('T')[0];
      byDate[date] = (byDate[date] || 0) + 1;
    }

    return { total: logs.length, byAction, byDate };
  }
}
