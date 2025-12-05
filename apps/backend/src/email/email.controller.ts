import { Body, Controller, Get, Post, Query, UseGuards, Request } from '@nestjs/common';
import { EmailService } from './email.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('email')
@UseGuards(JwtAuthGuard)
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  // Get email settings
  @Get('settings')
  getSettings() {
    return this.emailService.getSettings();
  }

  // Save email settings
  @Post('settings')
  saveSettings(@Body() dto: {
    smtpHost: string;
    smtpPort: number;
    smtpSecure: boolean;
    smtpUser: string;
    smtpPass: string;
    senderName: string;
    senderEmail: string;
    emailSubject?: string;
    emailTemplate?: string;
  }) {
    return this.emailService.saveSettings(dto);
  }

  // Test email connection
  @Post('test-connection')
  testConnection() {
    return this.emailService.testConnection();
  }

  // Send email to single guest
  @Post('send')
  sendEmail(
    @Body() dto: { guestId: string; customMessage?: string },
    @Request() req: any,
  ) {
    const adminId = req.user?.sub;
    const adminName = req.user?.displayName || req.user?.username || 'Admin';
    return this.emailService.sendEmail(dto, adminId, adminName);
  }

  // Send bulk emails
  @Post('send-bulk')
  sendBulkEmails(
    @Body() dto: { guestIds: string[]; customMessage?: string },
    @Request() req: any,
  ) {
    const adminId = req.user?.sub;
    const adminName = req.user?.displayName || req.user?.username || 'Admin';
    return this.emailService.sendBulkEmails(dto, adminId, adminName);
  }

  // Get email logs
  @Get('logs')
  getEmailLogs(
    @Query('eventId') eventId?: string,
    @Query('guestId') guestId?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.emailService.getEmailLogs({
      eventId,
      guestId,
      page: page ? parseInt(page, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize, 10) : 50,
    });
  }

  // Get email statistics
  @Get('stats')
  getEmailStats(@Query('eventId') eventId?: string) {
    return this.emailService.getEmailStats(eventId);
  }

  // Preview email (generate HTML without sending)
  @Post('preview')
  async previewEmail(@Body() dto: { guestId: string; customMessage?: string }) {
    // This would return the HTML content for preview
    // For now, we'll just return success - the frontend can show a preview
    return { success: true, message: 'Use the guest details to preview' };
  }
}
