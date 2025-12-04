import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { PrizesService } from './prizes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { emitEvent } from '../common/sse';

@Controller('prizes')
export class PrizesController {
    constructor(private readonly prizes: PrizesService) { }

    @UseGuards(JwtAuthGuard)
    @Get()
    list() {
        return this.prizes.list();
    }

    @UseGuards(JwtAuthGuard)
    @Get('stats')
    async getStats() {
        return this.prizes.getStats();
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    create(@Body() body: { 
        name: string; 
        quantity: number; 
        description?: string;
        category?: string;
        allowMultipleWins?: boolean;
    }) {
        return this.prizes.create(body);
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id')
    update(@Param('id') id: string, @Body() body: { 
        name?: string; 
        quantity?: number; 
        description?: string;
        category?: string;
        allowMultipleWins?: boolean;
    }) {
        return this.prizes.update(id, body);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.prizes.delete(id);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/draw')
    async draw(@Param('id') id: string) {
        const winner = await this.prizes.drawWinner(id);
        emitEvent({ type: 'prize_draw', data: { prizeId: id, winner } });
        return winner;
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/reset')
    async reset(@Param('id') id: string) {
        const res = await this.prizes.resetWinners(id);
        emitEvent({ type: 'prize_reset', data: { prizeId: id } });
        return res;
    }
}
