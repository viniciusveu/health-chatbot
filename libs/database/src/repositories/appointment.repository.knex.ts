import { Injectable } from '@nestjs/common';
import { AppointmentRepository } from './appointment.repository';

@Injectable()
export class AppointmentRepositoryKnex implements AppointmentRepository {
    constructor(private readonly knexService) { }

    async getAppointmentById(appointmentId: string) {
        return await this.knexService.db('appointments')
            .where({ id: appointmentId })
            .first();
    }
}
