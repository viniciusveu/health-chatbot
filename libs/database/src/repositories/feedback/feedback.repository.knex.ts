import { Injectable } from '@nestjs/common';
import { FeedbackRepositoryInterface } from './feedback.repository.interface';
import { KnexService } from '@app/database/knex.service';

@Injectable()
export class FeedbackRepositoryKnex implements FeedbackRepositoryInterface {
  constructor(private readonly knexService: KnexService) {}

  async create(data: any): Promise<number> {
    const feedbackCreated = await this.knexService.db('feedback').insert(data);
    return feedbackCreated.id;
  }
}
