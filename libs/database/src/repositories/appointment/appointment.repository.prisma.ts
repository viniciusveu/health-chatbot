import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { AppointmentRepositoryInterface } from './appointment.repository.interface';

@Injectable()
export class AppointmentRepositoryPrisma
  implements AppointmentRepositoryInterface
{
  constructor(private readonly prisma: PrismaService) {}

  async getAppointmentById(appointmentId: string) {
    return this.prisma.appointment.findUnique({
      where: { id: +appointmentId },
      include: { Patient: true },
    });
  }
}
