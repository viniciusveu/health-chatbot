import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { AppointmentRepositoryInterface } from './appointment.repository.interface';
import { AppointmentStatus } from '@app/shared/enums/appointment-status.enum';

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

  async changeStatusById(
    appointmentId: number,
    status: AppointmentStatus,
  ): Promise<any> {
    return this.prisma.appointment.update({
      where: { id: appointmentId },
      data: { status },
    });
  }
}
