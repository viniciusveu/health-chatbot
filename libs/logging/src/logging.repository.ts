import { LoggingRepositoryInterface } from '@app/database';
import { Injectable } from '@nestjs/common';
import { RepositoryFactory } from '@app/database/repository.factory';
import { LogDto } from '@app/shared/dtos';

@Injectable()
export class LoggingRepository implements LoggingRepositoryInterface {
  constructor(private readonly repositoryFactory: RepositoryFactory) {}

  async update(id: number, data: Partial<LogDto>): Promise<void> {
    const repo = this.repositoryFactory.getLogginRepository();
    await repo.update(id, data);
  }
  create(data: Partial<LogDto>): Promise<number> {
    const repo = this.repositoryFactory.getLogginRepository();
    return repo.create(data);
  }
}
