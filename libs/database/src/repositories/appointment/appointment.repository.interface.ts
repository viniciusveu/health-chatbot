export interface AppointmentRepositoryInterface {
  getAppointmentById(appointmentId: string): Promise<any>;
}
