import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { KnexService } from './knex.service';
import { AppointmentRepositoryPrisma } from './repositories/appointment.repository.prisma';
import { AppointmentRepositoryKnex } from './repositories/appointment.repository.knex';
import { RepositoryFactory } from './repository.factory';

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
    RepositoryFactory,
  ],
  exports: ['AppointmentRepository', RepositoryFactory],
})
export class DatabaseModule {}
