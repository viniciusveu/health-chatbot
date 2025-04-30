import { Feedback } from "@prisma/client";

export interface FeedbackRepositoryInterface {
  create(data: Feedback): Promise<number>;
}
