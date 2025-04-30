import { PrismaService } from '@app/database/prisma.service';
import { FeedbackRepositoryInterface } from './feedback.repository.interface';
import { Feedback } from '@prisma/client';

export class FeedbackRepositoryPrisma implements FeedbackRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Feedback): Promise<number> {
    const feedbackCreated = await this.prisma.feedback.create({ data });
    return feedbackCreated.id;
  }

}
