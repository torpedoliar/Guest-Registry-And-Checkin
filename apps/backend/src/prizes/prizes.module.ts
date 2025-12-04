import { Module } from '@nestjs/common';
import { PrizesController } from './prizes.controller';
import { PrizesService } from './prizes.service';
import { PrismaService } from '../prisma/prisma.service';
import { EventsModule } from '../events/events.module';

@Module({
    imports: [EventsModule],
    controllers: [PrizesController],
    providers: [PrizesService, PrismaService],
})
export class PrizesModule { }
