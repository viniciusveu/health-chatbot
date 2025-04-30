import { Injectable } from '@nestjs/common';
import { KnexService } from '@app/database/knex.service';
import { LoggingRepositoryInterface } from './logging.repository.interface';
import { LogDto } from '@app/shared/dtos';

@Injectable()
export class LoggingRepositoryKnex implements LoggingRepositoryInterface {
  constructor(private readonly knexService: KnexService) {}

  async create(data: Partial<LogDto>): Promise<number> {
    const logCreated = await this.knexService.db('msgLogging').insert(data);
    return logCreated.id;
  }

  async update(id: number, data: Partial<LogDto>): Promise<void> {
    await this.knexService.db('msgLogging').update(id, data);
  }

  async findByContactInfo(contactInfo: string): Promise<LogDto[]> {
    const logs = await this.knexService.db('msgLogging').where({ contactInfo, msgError: null });
    return logs;
  }
}
