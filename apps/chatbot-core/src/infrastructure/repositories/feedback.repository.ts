import { Injectable } from '@nestjs/common';
import { RepositoryFactory } from '@app/database/repository.factory';
import { AppointmentRepositoryInterface } from '@app/database';
import { FeedbackRepositoryInterface } from '@app/database/repositories/feedback/feedback.repository.interface';
import { Feedback } from '@prisma/client';

@Injectable()
export class FeedbackRepository implements FeedbackRepositoryInterface {
    constructor(private readonly repositoryFactory: RepositoryFactory) { }

    create(data: Feedback): Promise<number> {
        const repo = this.repositoryFactory.getFeedbackRepository();
        return repo.create(data);
    }
}
