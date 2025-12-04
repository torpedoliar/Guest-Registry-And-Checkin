import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.adminUser.findMany({
      select: {
        id: true,
        username: true,
        displayName: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findById(id: string) {
    const user = await this.prisma.adminUser.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        displayName: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(data: { username: string; password: string; displayName?: string }) {
    const existing = await this.prisma.adminUser.findUnique({
      where: { username: data.username },
    });
    if (existing) throw new ConflictException('Username already exists');

    const passwordHash = await bcrypt.hash(data.password, 10);
    return this.prisma.adminUser.create({
      data: {
        username: data.username,
        passwordHash,
        displayName: data.displayName || data.username,
        isActive: true,
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  async update(id: string, data: { displayName?: string; password?: string; isActive?: boolean }) {
    const user = await this.prisma.adminUser.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    const updateData: any = {};
    if (data.displayName !== undefined) updateData.displayName = data.displayName;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.password) {
      updateData.passwordHash = await bcrypt.hash(data.password, 10);
    }

    return this.prisma.adminUser.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        displayName: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async delete(id: string) {
    const user = await this.prisma.adminUser.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    // Don't allow deleting the last active admin
    const activeCount = await this.prisma.adminUser.count({ where: { isActive: true } });
    if (activeCount <= 1 && user.isActive) {
      throw new ConflictException('Cannot delete the last active admin user');
    }

    await this.prisma.adminUser.delete({ where: { id } });
    return { success: true };
  }

  async changePassword(id: string, oldPassword: string, newPassword: string) {
    const user = await this.prisma.adminUser.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    const valid = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!valid) throw new ConflictException('Old password is incorrect');

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.prisma.adminUser.update({
      where: { id },
      data: { passwordHash },
    });

    return { success: true };
  }
}
