import { IsEnum, IsString } from "class-validator";
import { ContextOptions } from "../enums";

export class EventDataDto {
    @IsEnum(ContextOptions)
    event: ContextOptions;

    @IsString()
    patientId: string;

    @IsString()
    appointmentId: string;
}