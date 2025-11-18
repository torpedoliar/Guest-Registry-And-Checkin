import { Module } from '@nestjs/common';
import { PublicController } from './public.controller';
import { GuestsService } from '../guests/guests.service';

@Module({
  controllers: [PublicController],
  providers: [GuestsService],
})
export class PublicModule {}
