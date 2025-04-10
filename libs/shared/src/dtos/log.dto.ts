import { ContextOptions, LogStatus, LogType } from '../enums';

export class LogDto {
  id?: number;
  type: LogType;
  status: LogStatus;
  contextType?: ContextOptions;
  appointmentId?: number;
  receivedAt: Date;
  sentAt?: Date;
  msgContent?: string;
  msgError?: string;
  contactInfo?: string;
}
