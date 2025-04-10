import { LoggingRepositoryInterface } from './logging.repository.interface';
import { PrismaService } from '@app/database/prisma.service';

export class LoggingRepositoryPrisma implements LoggingRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any): Promise<number> {
    const logCreated = await this.prisma.messageLog.create({ data });
    return logCreated.id;
  }

  async update(id: number, data: any): Promise<void> {
    await this.prisma.messageLog.update({ data, where: { id } });
  }
}
