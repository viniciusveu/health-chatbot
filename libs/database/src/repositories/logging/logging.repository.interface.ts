import { LogDto } from '@app/shared/dtos';

export interface LoggingRepositoryInterface {
  create(data: Partial<LogDto>): Promise<number>;
  update(id: number, data: Partial<LogDto>): Promise<void>;
  findByContactInfo(contactInfo: string): Promise<LogDto[]>;
}
