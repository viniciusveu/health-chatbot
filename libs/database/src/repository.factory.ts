import { Injectable, Inject } from '@nestjs/common';
import { AppointmentRepositoryInterface } from './repositories/appointment.repository';

@Injectable()
export class RepositoryFactory {
  constructor(
    @Inject('AppointmentRepository')
    private readonly appointmentRepo: AppointmentRepositoryInterface,
  ) {}

  getAppointmentRepository(): AppointmentRepositoryInterface {
    return this.appointmentRepo;
  }
}
