import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async getActive() {
    return this.prisma.event.findFirst({ where: { isActive: true } });
  }

  async setActiveConfig(input: {
    name?: string;
    date?: Date | string;
    location?: string;
    logoUrl?: string | null;
    backgroundType?: 'NONE' | 'IMAGE' | 'VIDEO';
    backgroundImageUrl?: string | null;
    backgroundVideoUrl?: string | null;
    overlayOpacity?: number;
    checkinPopupTimeoutMs?: number;
  }) {
    const active = await this.getActive();
    if (!active) throw new BadRequestException('No active event');
    const data: any = { ...input };
    if (typeof data.date === 'string') {
      const ds = data.date.trim();
      if (!ds) {
        delete data.date;
      } else if (/^\d{4}-\d{2}-\d{2}$/.test(ds)) {
        const iso = ds + 'T00:00:00.000Z';
        const d = new Date(iso);
        if (isNaN(d.getTime())) throw new BadRequestException('Invalid date format');
        data.date = d;
      } else {
        const d = new Date(ds);
        if (isNaN(d.getTime())) throw new BadRequestException('Invalid date format');
        data.date = d;
      }
    }
    return this.prisma.event.update({ where: { id: active.id }, data });
  }

  async purgeActiveGuests(resetBranding?: boolean) {
    const active = await this.getActive();
    if (!active) throw new BadRequestException('No active event');
    await this.prisma.guest.deleteMany({ where: { eventId: active.id } });
    if (resetBranding) {
      await this.prisma.event.update({
        where: { id: active.id },
        data: {
          logoUrl: null,
          backgroundType: 'NONE',
          backgroundImageUrl: null,
          backgroundVideoUrl: null,
        },
      });
    }
    return { success: true };
  }
}
