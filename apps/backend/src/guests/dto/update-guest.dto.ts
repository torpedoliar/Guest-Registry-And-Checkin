import { IsBoolean, IsDateString, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';

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
  photoUrl?: string | null;

  @IsOptional()
  @IsString()
  tableLocation?: string;

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
}
