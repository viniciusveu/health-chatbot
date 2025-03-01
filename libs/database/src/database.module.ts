import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { KnexService } from './knex.service';
import { AppointmentRepositoryPrisma } from './repositories/appointment.repository.prisma';
import { AppointmentRepositoryKnex } from './repositories/appointment.repository.knex';
import { RepositoryFactory } from './repository.factory';

const databaseProvider = process.env.DB_TYPE === 'prisma'
  ? AppointmentRepositoryPrisma
  : AppointmentRepositoryKnex;

@Module({
  providers: [
    PrismaService,
    KnexService,
    { provide: 'AppointmentRepository', useClass: databaseProvider },
    RepositoryFactory,
  ],
  exports: ['AppointmentRepository', RepositoryFactory],
})
export class DatabaseModule {}
