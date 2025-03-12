import { Injectable, Inject } from '@nestjs/common';
import { AppointmentRepository } from './repositories/appointment.repository';

@Injectable()
export class RepositoryFactory {
  constructor(
    @Inject('AppointmentRepository')
    private readonly appointmentRepo: AppointmentRepository,
  ) {}

  getAppointmentRepository(): AppointmentRepository {
    return this.appointmentRepo;
  }
}
