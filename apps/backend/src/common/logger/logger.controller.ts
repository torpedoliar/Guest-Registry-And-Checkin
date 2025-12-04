import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('admin/logs')
@UseGuards(JwtAuthGuard)
export class LoggerController {
  constructor(private readonly loggerService: LoggerService) {}

  @Get('files')
  getLogFiles() {
    return this.loggerService.getLogFiles();
  }

  @Get('content')
  getLogContent(
    @Query('file') file: string,
    @Query('lines') lines?: string,
    @Query('level') level?: string,
    @Query('search') search?: string,
  ) {
    return this.loggerService.getLogContent(file, {
      lines: lines ? parseInt(lines, 10) : 100,
      level,
      search,
    });
  }

  @Get('stats')
  getLogStats() {
    return this.loggerService.getLogStats();
  }
}
