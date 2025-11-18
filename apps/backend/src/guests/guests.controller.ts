import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { photosStorage } from '../common/storage';
import { CreateGuestDto } from './dto/create-guest.dto';
import { QueryGuestsDto } from './dto/query-guests.dto';
import { UpdateGuestDto } from './dto/update-guest.dto';
import { GuestsService } from './guests.service';
import * as multer from 'multer';
import { parseString } from '@fast-csv/parse';
import type { Request } from 'express';
import { emitEvent } from '../common/sse';

@Controller()
export class GuestsController {
  constructor(private readonly guests: GuestsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('guests')
  list(@Query() query: QueryGuestsDto) {
    return this.guests.list(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('guests/stats')
  stats(@Query('eventId') eventId?: string) {
    return this.guests.stats(eventId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('guests/export')
  async exportCsv(@Res() res: Response, @Query('eventId') eventId?: string) {
    const pageSize = 1000;
    let page = 1;
    const header = [
      'guest_id',
      'name',
      'table_location',
      'company',
      'notes',
    ];

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="guests.csv"');
    res.write(header.join(',') + '\n');

    while (true) {
      const { data } = await this.guests.list({ page, pageSize, eventId });
      if (!data.length) break;
      for (const g of data) {
        const row = [
          escapeCsv(g.guestId),
          escapeCsv(g.name),
          escapeCsv(g.tableLocation),
          escapeCsv(g.company ?? ''),
          escapeCsv(g.notes ?? ''),
        ];
        res.write(row.join(',') + '\n');
      }
      page++;
    }

    res.end();
  }

  @UseGuards(JwtAuthGuard)
  @Get('guests/export/full')
  async exportFullCsv(@Res() res: Response, @Query('eventId') eventId?: string) {
    const pageSize = 1000;
    let page = 1;
    const header = [
      'id',
      'queueNumber',
      'guestId',
      'name',
      'photoUrl',
      'tableLocation',
      'company',
      'notes',
      'checkedIn',
      'checkedInAt',
      'createdAt',
      'updatedAt',
      'eventId',
    ];

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="guests_full.csv"');
    res.write(header.join(',') + '\n');

    while (true) {
      const { data } = await this.guests.list({ page, pageSize, eventId });
      if (!data.length) break;
      for (const g of data) {
        const row = [
          escapeCsv(String(g.id)),
          String(g.queueNumber ?? ''),
          escapeCsv(g.guestId),
          escapeCsv(g.name),
          escapeCsv(g.photoUrl ?? ''),
          escapeCsv(g.tableLocation),
          escapeCsv(g.company ?? ''),
          escapeCsv(g.notes ?? ''),
          g.checkedIn ? 'true' : 'false',
          g.checkedInAt ? new Date(g.checkedInAt as any).toISOString() : '',
          g.createdAt ? new Date(g.createdAt as any).toISOString() : '',
          g.updatedAt ? new Date(g.updatedAt as any).toISOString() : '',
          escapeCsv(g.eventId),
        ];
        res.write(row.join(',') + '\n');
      }
      page++;
    }

    res.end();
  }

  @UseGuards(JwtAuthGuard)
  @Get('guests/:id')
  get(@Param('id') id: string) {
    return this.guests.getById(id);
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('photo', { storage: photosStorage() }))
  @Post('guests')
  create(@Body() dto: CreateGuestDto, @UploadedFile() file?: Express.Multer.File) {
    const url = file ? `/api/uploads/photos/${file.filename}` : undefined;
    return this.guests.create(dto, url);
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('photo', { storage: photosStorage() }))
  @Put('guests/:id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateGuestDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const url = file ? `/api/uploads/photos/${file.filename}` : undefined;
    return this.guests.update(id, dto, url);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('guests/:id')
  remove(@Param('id') id: string) {
    return this.guests.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('guests/:id/checkin')
  async checkIn(@Param('id') id: string) {
    const updated = await this.guests.checkIn(id);
    emitEvent({ type: 'checkin', data: updated });
    return updated;
  }

  @UseGuards(JwtAuthGuard)
  @Post('guests/:id/uncheckin')
  async uncheckIn(@Param('id') id: string) {
    const updated = await this.guests.uncheckIn(id);
    emitEvent({ type: 'uncheckin', data: updated });
    return updated;
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.memoryStorage(),
      fileFilter: (
        _req: Request,
        file: Express.Multer.File,
        cb: (error: Error | null, acceptFile: boolean) => void,
      ) => {
        if (file.mimetype !== 'text/csv' && !file.originalname.endsWith('.csv')) {
          return cb(new Error('Only CSV files are allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  @Post('guests/import')
  async importCsv(@UploadedFile() file: Express.Multer.File) {
    const content = file.buffer.toString('utf-8');
    const rows: Record<string, string>[] = await new Promise((resolve, reject) => {
      const r: Record<string, string>[] = [];
      parseString(content, { headers: true, trim: true })
        .on('error', reject)
        .on('data', (row) => r.push(row as Record<string, string>))
        .on('end', () => resolve(r));
    });

    let created = 0;
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const guestId = row['guest_id'] ?? row['guestId'];
      const name = row['name'];
      const tableLocation = row['table_location'] ?? row['table'] ?? row['tableLocation'];
      const company = row['company'] ?? row['organization'] ?? undefined;
      const notes = row['notes'] ?? undefined;
      if (!guestId || !name || !tableLocation) continue;
      try {
        await this.guests.create({ guestId, name, tableLocation, company, notes }, undefined);
        created++;
      } catch {
        // skip duplicates or errors
      }
    }

    return { created, total: rows.length };
  }

}

function escapeCsv(value: string | null): string {
  const v = value ?? '';
  if (v.includes(',') || v.includes('"') || v.includes('\n')) {
    return '"' + v.replace(/"/g, '""') + '"';
    }
  return v;
}
