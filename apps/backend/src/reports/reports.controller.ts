import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('guests/pdf')
  async generateGuestReport(
    @Res() res: Response,
    @Query('eventId') eventId?: string,
    @Query('checkedInOnly') checkedInOnly?: string,
  ) {
    await this.reportsService.generateGuestReport(res, {
      eventId,
      includeCheckedInOnly: checkedInOnly === 'true',
    });
  }

  @Get('checkin/pdf')
  async generateCheckinReport(
    @Res() res: Response,
    @Query('eventId') eventId?: string,
  ) {
    await this.reportsService.generateCheckinReport(res, eventId);
  }

  @Get('attendance/summary')
  async getAttendanceSummary(@Query('eventId') eventId?: string) {
    return this.reportsService.generateAttendanceSummary(eventId);
  }
}
