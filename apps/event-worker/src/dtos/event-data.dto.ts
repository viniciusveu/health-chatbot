import { ContextOptions } from "@app/shared";
import { IsEnum, IsNotEmpty, IsString } from "class-validator";

export class EventDataDto {
    @IsEnum(ContextOptions)
    event?: ContextOptions;

    @IsString()
    patientId: string;

    @IsNotEmpty()
    data: any;
}