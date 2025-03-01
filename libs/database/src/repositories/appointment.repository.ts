export interface AppointmentRepository {
    getAppointmentById(appointmentId: string): Promise<any>;
}
