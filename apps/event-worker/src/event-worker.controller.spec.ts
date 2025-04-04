import { Test, TestingModule } from '@nestjs/testing';
import { EventWorkerController } from './event-worker.controller';
import { EventWorkerService } from './event-worker.service';
import { EventDataDto } from '@app/shared/dtos';
import { ContextOptions } from '@app/shared/enums';
import { JwtAuthGuard } from '@app/auth';

describe('EventWorkerController', () => {
  let controller: EventWorkerController;
  let service: EventWorkerService;

  const mockService = {
    emitEvent: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventWorkerController],
      providers: [{ provide: EventWorkerService, useValue: mockService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<EventWorkerController>(EventWorkerController);
    service = module.get<EventWorkerService>(EventWorkerService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call emitEvent with correct data', () => {
    const dto: EventDataDto = {
      event: ContextOptions.APPOINTMENT_CREATED,
      appointmentId: '123',
    };

    controller.emitEvent(dto);

    expect(service.emitEvent).toHaveBeenCalledWith(dto);
    expect(service.emitEvent).toHaveBeenCalledTimes(1);
  });
});
