import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AppointmentRepository } from './appointment.repository';

@Injectable()
export class AppointmentRepositoryPrisma implements AppointmentRepository {
    constructor(private readonly prisma: PrismaService) { }

    async getAppointmentById(appointmentId: string) {
        return this.prisma.appointment.findUnique({
            where: { id: +appointmentId },
            include: { Patient: true },
        });
    }
}
