import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { ContextOptions } from '../enums';

export class EventDataDto {
  @IsInt()
  @IsOptional()
  eventId?: number;

  @IsEnum(ContextOptions)
  event: ContextOptions;

  @IsString()
  appointmentId: string;

  @IsString()
  @IsOptional()
  patientId?: string;
}
