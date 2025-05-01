import { Injectable } from '@nestjs/common';
import { RepositoryFactory } from '@app/database/repository.factory';
import { AppointmentStatus } from '@app/shared/enums';

@Injectable()
export class AppointmentRepository {
  constructor(private readonly repositoryFactory: RepositoryFactory) { }

  async getAppointmentById(appointmentId: string) {
    const repo = this.repositoryFactory.getAppointmentRepository();
    return repo.getAppointmentById(appointmentId);
  }

  async confirmAppointmentById(appointmentId: number): Promise<any> {
    const repo = this.repositoryFactory.getAppointmentRepository();
    return repo.changeStatusById(appointmentId, AppointmentStatus.CONFIRMED);
  }

  async cancelAppointmentById(appointmentId: number): Promise<any> {
    const repo = this.repositoryFactory.getAppointmentRepository();
    return repo.changeStatusById(appointmentId, AppointmentStatus.CANCELLED);
  }
}
