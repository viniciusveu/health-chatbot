export enum LogStatus {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export class Log {
  id: number;
  msgContent: string;
  context: string;
  status: LogStatus;
  msgError: string;
  sent_at: Date;
}
