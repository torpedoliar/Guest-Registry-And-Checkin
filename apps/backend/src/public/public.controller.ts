import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import { GuestsService } from '../guests/guests.service';
import { Response } from 'express';
import { onEvent, emitEvent } from '../common/sse';

@Controller('public')
export class PublicController {
  constructor(private readonly guests: GuestsService) {}

  @Get('guests/search')
  search(@Query('guestId') guestId?: string, @Query('name') name?: string) {
    return this.guests.publicSearch({ guestId, name });
  }

  @Post('guests/checkin')
  async checkin(@Body('guestId') guestId: string) {
    const updated = await this.guests.checkInByGuestId(guestId);
    emitEvent({ type: 'checkin', data: updated });
    return updated;
  }

  @Get('guests/history')
  history(@Query('limit') limit?: string) {
    const lim = limit ? Number(limit) : 20;
    return this.guests.publicHistory(lim);
  }

  @Get('stream')
  async stream(@Res() res: Response) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const send = (event: string, data: any) => {
      res.write(`event: ${event}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    const off = onEvent((ev) => {
      if (ev.type === 'checkin') send('checkin', ev.data);
      if (ev.type === 'uncheckin') send('uncheckin', ev.data);
      if (ev.type === 'config') send('config', ev.data);
      if (ev.type === 'preview') send('preview', ev.data);
    });

    const heartbeat = setInterval(() => {
      res.write(`event: ping\n`);
      res.write(`data: {}\n\n`);
    }, 25000);

    reqOnClose(res, () => {
      clearInterval(heartbeat);
      off();
    });
  }
}

function reqOnClose(res: Response, cb: () => void) {
  // @ts-ignore
  const req = res.req as any;
  req.on('close', cb);
}
