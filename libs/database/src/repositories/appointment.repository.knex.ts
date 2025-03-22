import { Injectable } from '@nestjs/common';
import { AppointmentRepositoryInterface } from './appointment.repository';
import { KnexService } from '../knex.service';

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
}
