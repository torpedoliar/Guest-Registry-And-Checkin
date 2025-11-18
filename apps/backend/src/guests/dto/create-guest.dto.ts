import { IsBoolean, IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';

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
  company?: string | null;

  @IsOptional()
  @IsString()
  notes?: string | null;

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
