import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService, AuditAction } from '../common/audit/audit.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService, 
    private jwt: JwtService,
    private audit: AuditService,
  ) {}

  async validateUser(username: string, password: string) {
    const user = await this.prisma.adminUser.findUnique({ where: { username } });
    if (!user) {
      await this.audit.log({
        action: AuditAction.LOGIN_FAILED,
        metadata: { username, reason: 'User not found' },
      });
      throw new UnauthorizedException('Invalid credentials');
    }
    if (!user.isActive) {
      await this.audit.log({
        action: AuditAction.LOGIN_FAILED,
        adminUserId: user.id,
        adminUsername: username,
        metadata: { reason: 'User inactive' },
      });
      throw new UnauthorizedException('User is inactive');
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      await this.audit.log({
        action: AuditAction.LOGIN_FAILED,
        adminUserId: user.id,
        adminUsername: username,
        metadata: { reason: 'Wrong password' },
      });
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }

  async login(username: string, password: string) {
    const user = await this.validateUser(username, password);
    const payload = { 
      sub: user.id, 
      username: user.username,
      displayName: user.displayName || user.username,
    };
    const access_token = await this.jwt.signAsync(payload);
    
    await this.audit.log({
      action: AuditAction.LOGIN_SUCCESS,
      adminUserId: user.id,
      adminUsername: user.username,
    });
    
    return { access_token };
  }
}
