import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { ContextOptions, InternalContextOptions } from '@app/shared/enums';
import { EventDataDto, ReceivedMessageDto } from '@app/shared/dtos';
import { AppointmentCreatedUseCase } from '../../application/use-cases/appointment-created.use-case';
import { ConfirmAppointmentUseCase } from '../../application/use-cases/confirm-appointment.use-case';
import { MessageReceivedUseCase } from '../../application/use-cases/message-received.use-case';

@Controller()
export class ChatbotController {
  constructor(
    private readonly appointmentCreatedUseCase: AppointmentCreatedUseCase,
    private readonly confirmAppointmentUseCase: ConfirmAppointmentUseCase,
    private readonly messageReceivedUseCase: MessageReceivedUseCase,
  ) {}

  @EventPattern(InternalContextOptions.MESSAGE_RECEIVED)
  async messageReceived(@Payload() message: ReceivedMessageDto): Promise<void> {
    await this.messageReceivedUseCase.execute(message);
  }

  @EventPattern(ContextOptions.APPOINTMENT_CREATED)
  async appointmentCreated(@Payload() message: EventDataDto): Promise<void> {
    await this.appointmentCreatedUseCase.execute(message);
  }

  @EventPattern(ContextOptions.CONFIRM_APPOINTMENT)
  async confirmAppointment(@Payload() message: EventDataDto): Promise<void> {
    await this.confirmAppointmentUseCase.execute(message);
  }
}
