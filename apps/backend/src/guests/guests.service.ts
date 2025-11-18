import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGuestDto } from './dto/create-guest.dto';
import { UpdateGuestDto } from './dto/update-guest.dto';
import { QueryGuestsDto } from './dto/query-guests.dto';
import type { Prisma } from '@prisma/client';

@Injectable()
export class GuestsService {
  constructor(private prisma: PrismaService) {}

  async getActiveEventId(): Promise<string> {
    const active = await this.prisma.event.findFirst({ where: { isActive: true } });
    if (!active) throw new NotFoundException('No active event');
    return active.id;
  }

  private buildWhere(query: QueryGuestsDto): Prisma.GuestWhereInput {
    const where: Prisma.GuestWhereInput = {};
    if (query.eventId) where.eventId = query.eventId;
    if (query.q) {
      where.OR = [
        { name: { contains: query.q, mode: 'insensitive' } },
        { guestId: { contains: query.q, mode: 'insensitive' } },
        { tableLocation: { contains: query.q, mode: 'insensitive' } },
      ];
    }
    if (query.name) where.name = { contains: query.name, mode: 'insensitive' };
    if (query.guestId) where.guestId = { contains: query.guestId, mode: 'insensitive' };
    if (query.table) where.tableLocation = { contains: query.table, mode: 'insensitive' };
    if (typeof query.checkedIn !== 'undefined') {
      if (query.checkedIn === 'true') where.checkedIn = true;
      if (query.checkedIn === 'false') where.checkedIn = false;
    }
    return where;
  }

  async list(query: QueryGuestsDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const where = this.buildWhere(query);

    const [total, data] = await this.prisma.$transaction([
      this.prisma.guest.count({ where }),
      this.prisma.guest.findMany({
        where,
        orderBy: [{ queueNumber: 'asc' }, { createdAt: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return { total, data };
  }

  async create(input: CreateGuestDto, photoUrl?: string) {
    const eventId = input.eventId ?? (await this.getActiveEventId());
    // assign next queue number if not provided
    const queueNumber = input.queueNumber ?? (await this.nextQueueNumber(eventId));

    return this.prisma.guest.create({
      data: {
        eventId,
        queueNumber,
        guestId: input.guestId,
        name: input.name,
        photoUrl: photoUrl ?? input.photoUrl ?? undefined,
        tableLocation: input.tableLocation,
        company: input.company,
        notes: input.notes,
        checkedIn: input.checkedIn ?? false,
        checkedInAt: input.checkedInAt ? new Date(input.checkedInAt) : undefined,
      },
    });
  }

  async nextQueueNumber(eventId: string): Promise<number> {
    const max = await this.prisma.guest.aggregate({
      where: { eventId },
      _max: { queueNumber: true },
    });
    const current = max._max.queueNumber ?? 0;
    return current + 1;
  }

  async getById(id: string) {
    const guest = await this.prisma.guest.findUnique({ where: { id } });
    if (!guest) throw new NotFoundException('Guest not found');
    return guest;
  }

  async update(id: string, input: UpdateGuestDto, photoUrl?: string) {
    await this.getById(id);
    const data: Prisma.GuestUpdateInput = { ...input };
    if (typeof photoUrl !== 'undefined') data.photoUrl = photoUrl;
    if (typeof input.checkedInAt === 'string') data.checkedInAt = new Date(input.checkedInAt);
    return this.prisma.guest.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.getById(id);
    await this.prisma.guest.delete({ where: { id } });
    return { success: true };
  }

  async checkIn(id: string) {
    await this.getById(id);
    const now = new Date();
    // Atomic: only update if not yet checked-in
    const res = await this.prisma.guest.updateMany({
      where: { id, checkedIn: false },
      data: { checkedIn: true, checkedInAt: now },
    });
    // Return the current row (updated or already checked-in)
    return this.prisma.guest.findUnique({ where: { id } });
  }

  async uncheckIn(id: string) {
    await this.getById(id);
    return this.prisma.guest.update({
      where: { id },
      data: { checkedIn: false, checkedInAt: null },
    });
  }

  async stats(eventId?: string) {
    const eId = eventId ?? (await this.getActiveEventId());
    const [total, checkedIn] = await this.prisma.$transaction([
      this.prisma.guest.count({ where: { eventId: eId } }),
      this.prisma.guest.count({ where: { eventId: eId, checkedIn: true } }),
    ]);
    return { total, checkedIn, notCheckedIn: total - checkedIn };
  }

  async publicSearch(params: { guestId?: string; name?: string }) {
    const eventId = await this.getActiveEventId();
    const qId = params.guestId?.trim();
    const qName = params.name?.trim();

    // Prioritaskan kecocokan ID yang persis (case-sensitive); jika ditemukan, kembalikan langsung
    if (qId) {
      const exact = await this.prisma.guest.findFirst({ where: { eventId, guestId: qId } });
      if (exact) return [exact];
    }

    // Fallback: gunakan OR agar bisa cocok oleh ID ATAU nama (contains, case-insensitive)
    const or: Prisma.GuestWhereInput[] = [];
    if (qId) or.push({ guestId: { contains: qId, mode: 'insensitive' } });
    if (qName) or.push({ name: { contains: qName, mode: 'insensitive' } });
    const where: Prisma.GuestWhereInput = { eventId, ...(or.length ? { OR: or } : {}) };
    return this.prisma.guest.findMany({ where, orderBy: [{ queueNumber: 'asc' }] });
  }

  async checkInByGuestId(guestId: string) {
    const eventId = await this.getActiveEventId();
    const guest = await this.prisma.guest.findFirst({ where: { eventId, guestId } });
    if (!guest) throw new NotFoundException('Guest not found');
    const now = new Date();
    // Atomic upsert-like behavior: only mark if not checked-in yet
    await this.prisma.guest.updateMany({
      where: { id: guest.id, checkedIn: false },
      data: { checkedIn: true, checkedInAt: now },
    });
    return this.prisma.guest.findUnique({ where: { id: guest.id } });
  }

  async publicHistory(limit = 20) {
    const eventId = await this.getActiveEventId();
    return this.prisma.guest.findMany({
      where: { eventId, checkedIn: true },
      orderBy: [{ checkedInAt: 'desc' }],
      take: limit,
    });
  }
}
