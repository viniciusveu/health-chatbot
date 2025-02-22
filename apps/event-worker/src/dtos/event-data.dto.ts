import { IsEnum, IsNotEmpty, IsString } from "class-validator";

// todo remove this enum and use the one from the shared lib
export enum EventType {
    APPOINTMENT_CREATED = 'appointment-created',             // Notify the patient about the appointment
    CONFIRM_APPOINTMENT = 'confirm-appointment',
    AMBULANCE_DEPARTURE = 'ambulance-departure',
    FINALIZED_APPOINTMENT = 'finalized-appointment',
    COLLECT_FEEDBACK = 'collect-feedback',
    NEXT_APPOINTMENTS = 'next-appointments',
    CANCEL_APPOINTMENT = 'cancel-appointment',
    RESCHEDULE_APPOINTMENT = 'reschedule-appointment',
    EXAMS_DONE = 'exams-done',
    MEDICINE_REMINDER = 'prescription-done',
    FAQ = 'faq',
}

export class EventDataDto {
    @IsEnum(EventType)
    event?: EventType;

    @IsString()
    patientId: string;

    @IsNotEmpty()
    data: any;
}