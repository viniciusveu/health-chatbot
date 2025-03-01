import { PatientData } from "../interfaces";

export interface ConfirmAppointmentDto {
    patientId: string;
    data: PatientData;
}