import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { KnexService } from './knex.service';
import { AppointmentRepositoryPrisma } from './repositories/appointment/appointment.repository.prisma';
import { AppointmentRepositoryKnex } from './repositories/appointment/appointment.repository.knex';
import { RepositoryFactory } from './repository.factory';
import { LoggingRepositoryPrisma } from './repositories/logging/logging.repository.prisma';
import { LoggingRepositoryKnex } from './repositories/logging/logging.repository.knex';

@Module({
  providers: [
    PrismaService,
    KnexService,
    {
      provide: 'AppointmentRepository',
      useFactory: (prisma: PrismaService, knex: KnexService) => {
        if (process.env.DB_TYPE === 'prisma') {
          return new AppointmentRepositoryPrisma(prisma);
        } else {
          return new AppointmentRepositoryKnex(knex);
        }
      },
      inject: [PrismaService, KnexService],
    },
    {
      provide: 'LoggingRepository',
      useFactory: (prisma: PrismaService, knex: KnexService) => {
        if (process.env.DB_TYPE === 'prisma') {
          return new LoggingRepositoryPrisma(prisma);
        } else {
          return new LoggingRepositoryKnex(knex);
        }
      },
      inject: [PrismaService, KnexService],
    },
    RepositoryFactory,
  ],
  exports: ['AppointmentRepository', 'LoggingRepository', RepositoryFactory],
})
export class DatabaseModule {}
