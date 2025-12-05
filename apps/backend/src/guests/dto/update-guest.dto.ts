import { IsBoolean, IsDateString, IsInt, IsOptional, IsString, IsEnum, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { GuestCategory } from './create-guest.dto';

export class UpdateGuestDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  queueNumber?: number;

  @IsOptional()
  @IsString()
  guestId?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  email?: string | null;

  @IsOptional()
  @IsString()
  photoUrl?: string | null;

  @IsOptional()
  @IsString()
  tableLocation?: string;

  @IsOptional()
  @IsString()
  company?: string | null;

  @IsOptional()
  @IsString()
  department?: string | null;

  @IsOptional()
  @IsString()
  division?: string;

  @IsOptional()
  @IsString()
  notes?: string | null;

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
  @IsBoolean()
  @Transform(({ value }) => (typeof value === 'string' ? value === 'true' : value))
  souvenirTaken?: boolean;
}
