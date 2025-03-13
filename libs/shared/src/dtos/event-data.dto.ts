import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ContextOptions } from '../enums';

export class EventDataDto {
  @IsEnum(ContextOptions)
  event: ContextOptions;

  @IsString()
  appointmentId: string;

  @IsString()
  @IsOptional()
  patientId: string;
}
