import { Injectable } from '@nestjs/common';
import { AppointmentRepositoryInterface } from './appointment.repository.interface';
import { KnexService } from '../../knex.service';
import { AppointmentStatus } from '@app/shared/enums';

@Injectable()
export class AppointmentRepositoryKnex
  implements AppointmentRepositoryInterface
{
  constructor(private readonly knexService: KnexService) {}

  async getAppointmentById(appointmentId: string) {
    return await this.knexService
      .db('appointments')
      .where({ id: appointmentId })
      .first();
  }

  async changeStatusById(
    appointmentId: number,
    status: AppointmentStatus,
  ): Promise<any> {
    return await this.knexService
      .db('appointments')
      .where({ id: appointmentId })
      .update({ status });
  }
}
