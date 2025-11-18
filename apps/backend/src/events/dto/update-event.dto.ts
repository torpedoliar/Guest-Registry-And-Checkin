import { IsDateString, IsEnum, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { EventBackgroundType } from '@prisma/client';

export class UpdateEventDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string | null;

  @IsOptional()
  @IsEnum(EventBackgroundType)
  backgroundType?: EventBackgroundType;

  @IsOptional()
  @IsString()
  backgroundImageUrl?: string | null;

  @IsOptional()
  @IsString()
  backgroundVideoUrl?: string | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  overlayOpacity?: number;

  @IsOptional()
  @IsInt()
  @Min(1000)
  @Max(600000)
  checkinPopupTimeoutMs?: number;
}
