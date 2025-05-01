import { Injectable, Inject } from '@nestjs/common';
import { AppointmentRepositoryInterface } from './repositories/appointment/appointment.repository.interface';
import { LoggingRepositoryInterface } from './repositories/logging/logging.repository.interface';
import { FeedbackRepositoryInterface } from './repositories/feedback/feedback.repository.interface';

@Injectable()
export class RepositoryFactory {
  constructor(
    @Inject('AppointmentRepository')
    private readonly appointmentRepo: AppointmentRepositoryInterface,
    @Inject('LoggingRepository')
    private readonly loggingRepo: LoggingRepositoryInterface,
    @Inject('FeedbackRepository')
    private readonly feedbackRepo: FeedbackRepositoryInterface,
  ) {}

  getAppointmentRepository(): AppointmentRepositoryInterface {
    return this.appointmentRepo;
  }

  getLoggingRepository(): LoggingRepositoryInterface {
    return this.loggingRepo;
  }

  getFeedbackRepository(): FeedbackRepositoryInterface {
    return this.feedbackRepo;
  }
}
