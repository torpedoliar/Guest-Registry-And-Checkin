import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGuestDto, BulkDeleteGuestsDto, BulkUpdateGuestsDto } from './dto/create-guest.dto';
import { UpdateGuestDto } from './dto/update-guest.dto';
import { QueryGuestsDto } from './dto/query-guests.dto';
import { Guest, Prisma, GuestCategory } from '@prisma/client';

@Injectable()
export class GuestsService {
  constructor(private prisma: PrismaService) { }

  async getActiveEventId(): Promise<string | null> {
    const active = await this.prisma.event.findFirst({ where: { isActive: true } });
    return active ? active.id : null;
  }

  async getActiveEvent() {
    return this.prisma.event.findFirst({ where: { isActive: true } });
  }

  async getEventById(id: string) {
    return this.prisma.event.findUnique({ where: { id } });
  }

  private buildWhere(query: QueryGuestsDto): Prisma.GuestWhereInput {
    const where: Prisma.GuestWhereInput = {};
    if (query.eventId) where.eventId = query.eventId;
    if (query.q) {
      const searchConditions: Prisma.GuestWhereInput[] = [
        { name: { contains: query.q, mode: 'insensitive' } },
        { guestId: { contains: query.q, mode: 'insensitive' } },
        { tableLocation: { contains: query.q, mode: 'insensitive' } },
        { company: { contains: query.q, mode: 'insensitive' } },
        { department: { contains: query.q, mode: 'insensitive' } },
        { division: { contains: query.q, mode: 'insensitive' } },
        { notes: { contains: query.q, mode: 'insensitive' } },
      ];
      // Check if search term matches a category
      const upperQ = query.q.toUpperCase();
      if (Object.values(GuestCategory).includes(upperQ as GuestCategory)) {
        searchConditions.push({ category: upperQ as GuestCategory });
      }
      where.OR = searchConditions;
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
    
    // Auto-filter by active event if no eventId provided
    if (!query.eventId) {
      const activeEventId = await this.getActiveEventId();
      if (activeEventId) query.eventId = activeEventId;
    }
    
    const where = this.buildWhere(query);

    const [total, data] = await this.prisma.$transaction([
      this.prisma.guest.count({ where }),
      this.prisma.guest.findMany({
        where,
        orderBy: [{ queueNumber: 'asc' }, { createdAt: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { prizeWins: { include: { prize: true } } },
      }),
    ]);

    return { total, data };
  }

  async listWithFullRelations(query: QueryGuestsDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    
    // Auto-filter by active event if no eventId provided
    if (!query.eventId) {
      const activeEventId = await this.getActiveEventId();
      if (activeEventId) query.eventId = activeEventId;
    }
    
    const where = this.buildWhere(query);

    const [total, data] = await this.prisma.$transaction([
      this.prisma.guest.count({ where }),
      this.prisma.guest.findMany({
        where,
        orderBy: [{ queueNumber: 'asc' }, { createdAt: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { 
          prizeWins: { 
            include: { 
              prize: true,
              collection: true
            } 
          },
          souvenirTakes: {
            include: { souvenir: true }
          }
        },
      }),
    ]);

    return { total, data };
  }

  // Cursor-based pagination for better performance with large datasets
  async listCursor(query: QueryGuestsDto) {
    const limit = query.limit ?? 20;
    const cursor = query.cursor;
    const sortBy = query.sortBy ?? 'queueNumber';
    const sortOrder = query.sortOrder ?? 'asc';
    
    // Auto-filter by active event if no eventId provided
    if (!query.eventId) {
      const activeEventId = await this.getActiveEventId();
      if (activeEventId) query.eventId = activeEventId;
    }
    
    const where = this.buildWhere(query);

    // Build orderBy dynamically
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    // If cursor provided, add cursor condition
    const cursorCondition = cursor ? { id: cursor } : undefined;

    const data = await this.prisma.guest.findMany({
      where,
      orderBy: [orderBy, { id: 'asc' }],
      take: limit + 1, // Fetch one extra to determine if there's more
      ...(cursorCondition && {
        cursor: cursorCondition,
        skip: 1, // Skip the cursor item itself
      }),
      include: {
        prizeWins: { include: { prize: true } },
      },
    });

    const hasMore = data.length > limit;
    const items = hasMore ? data.slice(0, -1) : data;
    const nextCursor = hasMore ? items[items.length - 1]?.id : null;
    const prevCursor = cursor || null;

    // Get total count (cached or computed)
    const total = await this.prisma.guest.count({ where });

    return {
      data: items,
      pagination: {
        total,
        hasMore,
        nextCursor,
        prevCursor,
        limit,
      },
    };
  }

  async create(input: CreateGuestDto, photoUrl?: string, skipDuplicateCheck?: boolean) {
    let eventId = input.eventId;
    if (!eventId) {
      const activeId = await this.getActiveEventId();
      if (!activeId) throw new NotFoundException('No active event');
      eventId = activeId;
    }

    // Check if duplicate guest ID is allowed
    if (!skipDuplicateCheck) {
      const event = await this.prisma.event.findUnique({ where: { id: eventId } });
      if (!event?.allowDuplicateGuestId) {
        // Check for existing guest with same guestId
        const existing = await this.prisma.guest.findFirst({
          where: { eventId, guestId: input.guestId },
        });
        if (existing) {
          throw new ConflictException(`Guest ID "${input.guestId}" sudah digunakan`);
        }
      }
    }

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
        department: input.department,
        division: input.division,
        notes: input.notes,
        category: input.category as GuestCategory || 'REGULAR',
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

  async checkIn(id: string, adminId?: string, adminName?: string) {
    await this.getById(id);
    const now = new Date();
    // Atomic: only update if not yet checked-in
    const res = await this.prisma.guest.updateMany({
      where: { id, checkedIn: false },
      data: { 
        checkedIn: true, 
        checkedInAt: now,
        checkedInById: adminId || null,
        checkedInByName: adminName || null,
      },
    });

    if (res.count === 0) {
      // Check if it was already checked in
      const guest = await this.prisma.guest.findUnique({ where: { id } });
      if (guest && guest.checkedIn) {
        throw new ConflictException(guest);
      }
    }

    // Return the current row (updated)
    return this.prisma.guest.findUnique({ where: { id } });
  }

  async uncheckIn(id: string, adminId?: string, adminName?: string) {
    await this.getById(id);
    return this.prisma.guest.update({
      where: { id },
      data: { 
        checkedIn: false, 
        checkedInAt: null,
        checkedInById: null,
        checkedInByName: null,
      },
    });
  }

  async stats(eventId?: string) {
    let eId = eventId;
    if (!eId) {
      const activeId = await this.getActiveEventId();
      if (!activeId) return { total: 0, checkedIn: 0, notCheckedIn: 0 };
      eId = activeId;
    }
    const [total, checkedIn] = await this.prisma.$transaction([
      this.prisma.guest.count({ where: { eventId: eId } }),
      this.prisma.guest.count({ where: { eventId: eId, checkedIn: true } }),
    ]);
    return { total, checkedIn, notCheckedIn: total - checkedIn };
  }

  async publicSearch(params: { guestId?: string; name?: string }) {
    const eventId = await this.getActiveEventId();
    if (!eventId) return [];
    const qId = params.guestId?.trim();
    const qName = params.name?.trim();

    // Check if duplicate guest IDs are allowed
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    const allowDuplicates = event?.allowDuplicateGuestId ?? false;

    // If duplicates allowed, always return all matches for selection
    if (allowDuplicates) {
      const or: Prisma.GuestWhereInput[] = [];
      if (qId) or.push({ guestId: { equals: qId, mode: 'insensitive' } });
      if (qId) or.push({ guestId: { contains: qId, mode: 'insensitive' } });
      if (qName) or.push({ name: { contains: qName, mode: 'insensitive' } });
      const where: Prisma.GuestWhereInput = { eventId, ...(or.length ? { OR: or } : {}) };
      return this.prisma.guest.findMany({ where, orderBy: [{ queueNumber: 'asc' }] });
    }

    // Original behavior: prioritize exact ID match
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

  async checkInByGuestId(guestId: string, adminId?: string, adminName?: string) {
    const eventId = await this.getActiveEventId();
    if (!eventId) throw new NotFoundException('No active event');
    const guest = await this.prisma.guest.findFirst({ where: { eventId, guestId } });
    if (!guest) throw new NotFoundException('Guest not found');
    const now = new Date();
    // Atomic upsert-like behavior: only mark if not checked-in yet
    const res = await this.prisma.guest.updateMany({
      where: { id: guest.id, checkedIn: false },
      data: { 
        checkedIn: true, 
        checkedInAt: now,
        checkedInById: adminId || null,
        checkedInByName: adminName || null,
      },
    });

    if (res.count === 0) {
      // Check if it was already checked in
      const existing = await this.prisma.guest.findUnique({ where: { id: guest.id } });
      if (existing && existing.checkedIn) {
        throw new ConflictException(existing);
      }
    }

    return this.prisma.guest.findUnique({ where: { id: guest.id } });
  }

  async checkInByQr(qrCode: string, adminId?: string, adminName?: string) {
    try {
      const eventId = await this.getActiveEventId();
      if (!eventId) throw new NotFoundException('No active event');
      let guest: Guest | null = null;

      // Check if qrCode is a valid UUID
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(qrCode);

      if (isUuid) {
        // Try to find by internal ID first (UUID)
        guest = await this.prisma.guest.findUnique({ where: { id: qrCode } });
      }

      // If not found or event mismatch, try by guestId (string)
      if (!guest || guest.eventId !== eventId) {
        guest = await this.prisma.guest.findFirst({ where: { eventId, guestId: qrCode } });
      }

      if (!guest) throw new NotFoundException('Guest not found');

      const now = new Date();
      const res = await this.prisma.guest.updateMany({
        where: { id: guest.id, checkedIn: false },
        data: { 
          checkedIn: true, 
          checkedInAt: now,
          checkedInById: adminId || null,
          checkedInByName: adminName || null,
        },
      });

      if (res.count === 0) {
        // Check if it was already checked in
        const existing = await this.prisma.guest.findUnique({ where: { id: guest.id } });
        if (existing && existing.checkedIn) {
          throw new ConflictException(existing);
        }
      }

      return this.prisma.guest.findUnique({ where: { id: guest.id } });
    } catch (error) {
      console.error("Error in checkInByQr:", error);
      if (error instanceof NotFoundException) throw error;
      throw new NotFoundException("Gagal memproses QR Code. Pastikan QR valid.");
    }
  }

  async publicHistory(limit = 20) {
    const eventId = await this.getActiveEventId();
    if (!eventId) return [];
    return this.prisma.guest.findMany({
      where: { eventId, checkedIn: true },
      orderBy: [{ checkedInAt: 'desc' }],
      take: limit,
    });
  }
  async companyStats(eventId?: string) {
    let eId = eventId;
    if (!eId) {
      const activeId = await this.getActiveEventId();
      if (!activeId) return [];
      eId = activeId;
    }

    // Get all guests grouped by company
    const allGuests = await this.prisma.guest.groupBy({
      by: ['company'],
      where: { eventId: eId },
      _count: { _all: true },
    });

    // Get checked-in guests grouped by company
    const checkedInGuests = await this.prisma.guest.groupBy({
      by: ['company'],
      where: { eventId: eId, checkedIn: true },
      _count: { _all: true },
    });

    // Merge results
    const stats = allGuests.map((group) => {
      const company = group.company || 'Umum/Lainnya';
      const total = group._count._all;
      const checkedInGroup = checkedInGuests.find((g) => g.company === group.company);
      const checkedIn = checkedInGroup ? checkedInGroup._count._all : 0;

      return {
        company,
        total,
        checkedIn,
        notCheckedIn: total - checkedIn,
      };
    });

    // Sort by total guests descending
    return stats.sort((a, b) => b.total - a.total);
  }

  async createAndCheckIn(guestIdOrName: string, adminId?: string, adminName?: string) {
    const eventId = await this.getActiveEventId();
    if (!eventId) throw new NotFoundException('No active event');

    // Determine if input is guest ID or name
    const isLikelyId = /^[A-Z0-9\-_]+$/i.test(guestIdOrName.trim()) && guestIdOrName.length <= 50;
    
    // Create the guest with the input as both ID and name, or just name
    const guestId = isLikelyId ? guestIdOrName.trim() : `GUEST-${Date.now()}`;
    const guestName = guestIdOrName.trim();

    // Get max queue number
    const queueNumber = await this.nextQueueNumber(eventId);

    const now = new Date();

    // Create guest and check-in in one operation
    const created = await this.prisma.guest.create({
      data: {
        guestId,
        name: guestName,
        tableLocation: '-',
        queueNumber,
        eventId,
        checkedIn: true,
        checkedInAt: now,
        checkedInById: adminId || null,
        checkedInByName: adminName || null,
      }
    });

    // Return fresh data from database to ensure all fields are properly populated
    return this.prisma.guest.findUnique({ where: { id: created.id } });
  }

  async bulkDelete(dto: BulkDeleteGuestsDto) {
    const { ids } = dto;
    if (!ids.length) return { deleted: 0 };
    
    const result = await this.prisma.guest.deleteMany({
      where: { id: { in: ids } },
    });
    
    return { deleted: result.count };
  }

  async bulkUpdate(dto: BulkUpdateGuestsDto) {
    const { ids, ...updateData } = dto;
    if (!ids.length) return { updated: 0 };
    
    // Remove undefined values
    const data: Prisma.GuestUpdateManyMutationInput = {};
    if (updateData.category !== undefined) data.category = updateData.category as GuestCategory;
    if (updateData.tableLocation !== undefined) data.tableLocation = updateData.tableLocation;
    if (updateData.company !== undefined) data.company = updateData.company;
    if (updateData.department !== undefined) data.department = updateData.department;
    if (updateData.division !== undefined) data.division = updateData.division;
    if (updateData.checkedIn !== undefined) {
      data.checkedIn = updateData.checkedIn;
      if (updateData.checkedIn) {
        data.checkedInAt = new Date();
      } else {
        data.checkedInAt = null;
      }
    }
    if (updateData.souvenirTaken !== undefined) data.souvenirTaken = updateData.souvenirTaken;
    
    const result = await this.prisma.guest.updateMany({
      where: { id: { in: ids } },
      data,
    });
    
    return { updated: result.count };
  }

  async checkDuplicates(guestIds: string[], names: string[], eventId?: string) {
    let eId = eventId;
    if (!eId) {
      const activeId = await this.getActiveEventId();
      if (!activeId) return { duplicateIds: [], duplicateNames: [] };
      eId = activeId;
    }

    // Check duplicate guest IDs
    const existingByIds = await this.prisma.guest.findMany({
      where: {
        eventId: eId,
        guestId: { in: guestIds },
      },
      select: { guestId: true, name: true },
    });

    // Check duplicate names (exact match, case-insensitive)
    const lowerNames = names.map(n => n.toLowerCase());
    const existingByNames = await this.prisma.guest.findMany({
      where: {
        eventId: eId,
      },
      select: { guestId: true, name: true },
    });

    const duplicateNames = existingByNames.filter(g => 
      lowerNames.includes(g.name.toLowerCase())
    );

    return {
      duplicateIds: existingByIds,
      duplicateNames: duplicateNames.filter(n => 
        !existingByIds.some(e => e.guestId === n.guestId)
      ),
    };
  }
}
