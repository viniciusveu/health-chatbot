import { AppointmentStatus } from "@app/shared/enums";

export interface AppointmentRepositoryInterface {
  getAppointmentById(appointmentId: string): Promise<any>;
  changeStatusById(appointmentId: number, status: AppointmentStatus): Promise<any>;
}
