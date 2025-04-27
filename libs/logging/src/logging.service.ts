import { Injectable } from '@nestjs/common';
import { LoggingRepository } from './logging.repository';
import { LogDto } from '@app/shared/dtos';
import { LogType, LogStatus } from '@app/shared/enums';

@Injectable()
export class LoggingService {
  constructor(private readonly loggingRepository: LoggingRepository) {}

  async eventReceived({
    appointmentId,
    contextType,
    msgError,
  }: Partial<LogDto>): Promise<number> {
    try {
      const logToCreate: any = {
        type: LogType.INFO,
        status: LogStatus.EVENT_RECEIVED,
        appointment_id: appointmentId,
        context_type: contextType,
        received_at: new Date(),
      };

      if (msgError) {
        logToCreate.msg_error = msgError;
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
    contactInfo,
    msgContent,
    msgError,
  }: Partial<LogDto>): Promise<void> {
    try {
      const logToUpdate: any = {
        status: LogStatus.EVENT_PROCESSED,
        msg_content: msgContent,
        contact_info: contactInfo,
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

  async messageSent({ id, sid, msgError }: Partial<LogDto>): Promise<void> {
    try {
      const logToUpdate: any = {
        status: LogStatus.MESSAGE_SENT,
        sent_at: new Date(),
        sid,
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

  async messageReceived(msgData: {
    from: string;
    body: string;
    msgError?: string;
  }): Promise<number> {
    try {
      const logToCreate: any = {
        type: LogType.INFO,
        status: LogStatus.MESSAGE_RECEIVED,
        contact_info: msgData.from,
        msg_content: msgData.body,
        received_at: new Date(),
      };

      if (msgData.msgError) {
        logToCreate.msg_error = msgData.msgError;
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
        context_type: contextType,
        appointment_id: appointmentId,
        sent_at: new Date(),
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
