import { Injectable } from '@nestjs/common';
import { QueueClient } from '@app/queue';
import { LoggingService } from '@app/logging';
import { ContextOptions, InternalContextOptions } from '@app/shared/enums';
import { LogDto, MessageDataDto, ReceivedMessageDto } from '@app/shared/dtos';
import { FeedbackRepository } from '../../infrastructure/repositories/feedback.repository';
import { FeedbackType } from '@app/shared/enums/feedback-type.enum';
import { Feedback } from '@prisma/client';
import { AppointmentRepository } from '../../infrastructure/repositories/appointment.repository';

@Injectable()
export class MessageReceivedUseCase {
  constructor(
    private readonly appointmentRepository: AppointmentRepository,
    private readonly feedbackRepository: FeedbackRepository,
    private readonly loggingService: LoggingService,
    private readonly queueClient: QueueClient,
  ) {}

  async execute(data: ReceivedMessageDto): Promise<void> {
    try {
      console.log('Message received', data);

      const contactNumber = data.From.slice(12);
      const lastAction =
        await this.loggingService.getLastLogByContactInfo(contactNumber);

      let contextType: ContextOptions;
      let responseMsg: string;
      switch (lastAction.contextType) {
        case ContextOptions.COLLECT_FEEDBACK:
          contextType = ContextOptions.COLLECT_FEEDBACK;
          responseMsg = await this.collectFeedbackResponse(lastAction, data);
          break;
        case ContextOptions.APPOINTMENT_CREATED:
          contextType = ContextOptions.APPOINTMENT_CREATED;
          break;
        case ContextOptions.CONFIRM_APPOINTMENT:
          contextType = ContextOptions.CONFIRM_APPOINTMENT;
          responseMsg = await this.confirmAppointmentResponse(lastAction, data);
          break;
        default:
          throw new Error('Invalid context type');
      }

      if (responseMsg) {
        await this.loggingService.messageProcessed({
          id: data.eventId,
          contextType,
          appointmentId: lastAction.appointmentId,
        });

        await this.queueClient.emit(
          InternalContextOptions.SEND_MESSAGE,
          new MessageDataDto(responseMsg, contactNumber, data.eventId),
        );
      }
    } catch (error) {
      console.log(error);
      await this.loggingService.eventProcessed({
        id: data.eventId,
        msgError: `${error}`,
      });
    }
  }

  async collectFeedbackResponse(
    lastContext: LogDto,
    data: ReceivedMessageDto,
  ): Promise<string> {
    const userRating = data.Body;

    const isValid = this.collectFeedbackResponseValidator(userRating);
    if (!isValid) {
      return 'Sua nota deve ser entre 0 e 5. Por favor, envie um valor válido.';
    }

    await this.feedbackRepository.create({
      appointmentId: lastContext.appointmentId,
      type: FeedbackType.APPOINTMENT_FEEDBACK,
      rating: parseInt(userRating),
    } as Feedback);

    return 'Obrigado pela avaliação.';
  }

  async confirmAppointmentResponse(
    lastContext: LogDto,
    data: ReceivedMessageDto,
  ): Promise<string> {
    const userResponse = data.Body.toLowerCase();

    const isValid = this.confirmAppointmentResponseValidator(userResponse);
    if (!isValid) {
      return 'Por favor, responda apenas com sim ou não. \nEm caso de dúvidas, entre em contato no 0500.';
    }

    if (this.isPositive(userResponse)) {
      await this.appointmentRepository.confirmAppointmentById(
        lastContext.appointmentId,
      );
      return 'Seu agendamento foi confirmado. Obrigado!';
    }

    await this.appointmentRepository.cancelAppointmentById(
      lastContext.appointmentId,
    );
    return 'Seu agendamento foi cancelado. Obrigado! \nCaso tenha cancelado por engano, entre em contato no 0500.';
  }

  collectFeedbackResponseValidator(input: string): boolean {
    return ['0', '1', '2', '3', '4', '5'].includes(input);
  }

  confirmAppointmentResponseValidator(input: string): boolean {
    return ['sim', 'não', 'nao', 's', 'n', 'yes', 'no'].includes(input);
  }

  isPositive(input: string): boolean {
    return ['sim', 's', 'yes'].includes(input.toLowerCase());
  }
}
