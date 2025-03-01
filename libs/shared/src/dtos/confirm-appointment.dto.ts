import { PatientData } from "../interfaces/patient-data.interface";

export interface ConfirmAppointmentDto {
    patientId: string;
    data: PatientData;
}