import { Injectable, Inject } from '@nestjs/common';
import { AppointmentRepositoryInterface } from './repositories/appointment/appointment.repository.interface';
import { LoggingRepositoryInterface } from './repositories/logging/logging.repository.interface';

@Injectable()
export class RepositoryFactory {
  constructor(
    @Inject('AppointmentRepository')
    private readonly appointmentRepo: AppointmentRepositoryInterface,
    @Inject('LoggingRepository')
    private readonly loggingRepo: LoggingRepositoryInterface,
  ) {}

  getAppointmentRepository(): AppointmentRepositoryInterface {
    return this.appointmentRepo;
  }

  getLogginRepository(): LoggingRepositoryInterface {
    return this.loggingRepo;
  }
}
