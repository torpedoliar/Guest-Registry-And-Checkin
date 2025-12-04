import { IsBoolean, IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, IsEnum, IsArray, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export enum GuestCategory {
  REGULAR = 'REGULAR',
  VIP = 'VIP',
  VVIP = 'VVIP',
  MEDIA = 'MEDIA',
  SPONSOR = 'SPONSOR',
  SPEAKER = 'SPEAKER',
  ORGANIZER = 'ORGANIZER',
}

export class CreateGuestDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  queueNumber?: number;

  @IsString()
  @IsNotEmpty()
  guestId!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  photoUrl?: string | null;

  @IsString()
  @IsNotEmpty()
  tableLocation!: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  division?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsEnum(GuestCategory)
  category?: GuestCategory;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => (typeof value === 'string' ? value === 'true' : value))
  checkedIn?: boolean;

  @IsOptional()
  @IsDateString()
  checkedInAt?: string | null;

  @IsOptional()
  @IsString()
  eventId?: string;
}

export class BulkDeleteGuestsDto {
  @IsArray()
  @IsString({ each: true })
  ids!: string[];
}

export class BulkUpdateGuestsDto {
  @IsArray()
  @IsString({ each: true })
  ids!: string[];

  @IsOptional()
  @IsEnum(GuestCategory)
  category?: GuestCategory;

  @IsOptional()
  @IsString()
  tableLocation?: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  division?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => (typeof value === 'string' ? value === 'true' : value))
  checkedIn?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => (typeof value === 'string' ? value === 'true' : value))
  souvenirTaken?: boolean;
}
