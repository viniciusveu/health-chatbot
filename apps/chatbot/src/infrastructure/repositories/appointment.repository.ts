import { Injectable } from '@nestjs/common';
import { RepositoryFactory } from '@app/database/repository.factory';
import { AppointmentRepositoryInterface } from '@app/database';

@Injectable()
export class AppointmentRepository implements AppointmentRepositoryInterface {
  constructor(private readonly repositoryFactory: RepositoryFactory) {}

  async getAppointmentById(appointmentId: string) {
    const repo = this.repositoryFactory.getAppointmentRepository();
    return repo.getAppointmentById(appointmentId);
  }
}
