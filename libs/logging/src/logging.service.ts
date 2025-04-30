import { Injectable } from '@nestjs/common';
import { LoggingRepository } from './logging.repository';
import { LogDto } from '@app/shared/dtos';
import { LogType, LogStatus } from '@app/shared/enums';

@Injectable()
export class LoggingService {
  constructor(private readonly loggingRepository: LoggingRepository) {}

  async getLastLogByContactInfo(contactNumber: string): Promise<LogDto> {
    try {
      const logs = await this.loggingRepository.findByContactInfo(contactNumber);
      return logs[logs.length - 1];
    } catch (error) {
      throw new Error(error);
    }
  }

  async eventReceived({
    appointmentId,
    contextType,
    msgError,
  }: Partial<LogDto>): Promise<number> {
    try {
      const logToCreate: any = {
        type: LogType.INFO,
        status: LogStatus.EVENT_RECEIVED,
        appointmentId,
        contextType,
        receivedAt: new Date(),
      };

      if (msgError) {
        logToCreate.msgError = msgError;
        logToCreate.type = LogType.ERROR;
      }

      const logCreatedId = await this.loggingRepository.create(logToCreate);
      return logCreatedId;
    } catch (error) {
      throw new Error(error);
    }
  }

  async eventProcessed({
    id,
    msgContent,
    msgError,
    contactInfo,
  }: Partial<LogDto>): Promise<void> {
    try {
      const logToUpdate: any = {
        status: LogStatus.EVENT_PROCESSED,
        msgContent,
        contactInfo,
      };

      if (msgError) {
        logToUpdate.msgError = msgError;
        logToUpdate.type = LogType.ERROR;
      }

      await this.loggingRepository.update(id, logToUpdate);
    } catch (error) {
      throw new Error(error);
    }
  }

  async messageSent({ id, sid, msgError }: Partial<LogDto>): Promise<void> {
    try {
      const logToUpdate: any = {
        status: LogStatus.MESSAGE_SENT,
        sentAt: new Date(),
        sid,
      };

      if (msgError) {
        logToUpdate.msgError = msgError;
        logToUpdate.type = LogType.ERROR;
      }

      await this.loggingRepository.update(id, logToUpdate);
    } catch (error) {
      throw new Error(error);
    }
  }

  async messageReceived(msgData: {
    from: string;
    body: string;
    msgError?: string;
  }): Promise<number> {
    try {
      const logToCreate: any = {
        type: LogType.INFO,
        status: LogStatus.MESSAGE_RECEIVED,
        contactInfo: msgData.from,
        msgContent: msgData.body,
        receivedAt: new Date(),
      };

      if (msgData.msgError) {
        logToCreate.msgError = msgData.msgError;
        logToCreate.type = LogType.ERROR;
      }

      const logCreatedId = await this.loggingRepository.create(logToCreate);
      return logCreatedId;
    } catch (error) {
      throw new Error(error);
    }
  }

  async messageProcessed({
    id,
    contextType,
    appointmentId,
    msgError,
  }: Partial<LogDto>): Promise<void> {
    try {
      const logToUpdate: any = {
        status: LogStatus.MESSAGE_PROCESSED,
        contextType,
        appointmentId,
      };

      if (msgError) {
        logToUpdate.msg_error = msgError;
        logToUpdate.type = LogType.ERROR;
      }

      await this.loggingRepository.update(id, logToUpdate);
    } catch (error) {
      throw new Error(error);
    }
  }
}
