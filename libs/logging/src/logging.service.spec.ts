import { Test, TestingModule } from '@nestjs/testing';
import { LoggingService } from './logging.service';
import { LoggingRepository } from './logging.repository';
import { LogDto } from '@app/shared/dtos';
import { LogType, LogStatus, ContextOptions } from '@app/shared/enums';
import { RepositoryFactory } from '@app/database/repository.factory';
import { LoggingRepositoryInterface } from '@app/database';

describe('LoggingService', () => {
  let service: LoggingService;
  let repository: LoggingRepository;
  let mockLoggingRepository: Partial<LoggingRepositoryInterface>;

  beforeEach(async () => {
    mockLoggingRepository = {
      create: jest.fn(),
      update: jest.fn(),
    };

    const mockRepositoryFactory = {
      getLogginRepository: () => mockLoggingRepository,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoggingService,
        LoggingRepository,
        {
          provide: RepositoryFactory,
          useValue: mockRepositoryFactory,
        },
      ],
    }).compile();

    service = module.get<LoggingService>(LoggingService);
    repository = module.get<LoggingRepository>(LoggingRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
  });

  describe('eventReceived', () => {
    it('should create a log with INFO type and EVENT_RECEIVED status', async () => {
      const logData: Partial<LogDto> = {
        appointmentId: 1,
        contextType: ContextOptions.APPOINTMENT_CREATED,
      };
      const expectedLog = {
        type: LogType.INFO,
        status: LogStatus.EVENT_RECEIVED,
        appointment_id: 1,
        context_type: ContextOptions.APPOINTMENT_CREATED,
        received_at: expect.any(Date),
      };
      (mockLoggingRepository.create as jest.Mock).mockResolvedValue(1);

      const result = await service.eventReceived(logData);

      expect(mockLoggingRepository.create).toHaveBeenCalledWith(
        expect.objectContaining(expectedLog),
      );
      expect(result).toBe(1);
    });

    it('should create a log with ERROR type if msgError is provided', async () => {
      const logData: Partial<LogDto> = {
        appointmentId: 1,
        contextType: ContextOptions.APPOINTMENT_CREATED,
        msgError: 'error',
      };
      const expectedLog = {
        type: LogType.ERROR,
        status: LogStatus.EVENT_RECEIVED,
        appointment_id: 1,
        context_type: ContextOptions.APPOINTMENT_CREATED,
        received_at: expect.any(Date),
        msg_error: 'error',
      };
      (mockLoggingRepository.create as jest.Mock).mockResolvedValue(1);

      await service.eventReceived(logData);

      expect(mockLoggingRepository.create).toHaveBeenCalledWith(
        expect.objectContaining(expectedLog),
      );
    });

    it('should throw an error if repository throws an error', async () => {
      const logData: Partial<LogDto> = {
        appointmentId: 1,
        contextType: ContextOptions.APPOINTMENT_CREATED,
      };
      (mockLoggingRepository.create as jest.Mock).mockRejectedValue(
        new Error('Repository error'),
      );

      await expect(service.eventReceived(logData)).rejects.toThrow(Error);
    });
  });

  describe('eventProcessed', () => {
    it('should update a log with EVENT_PROCESSED status', async () => {
      const logData: Partial<LogDto> = {
        id: 1,
        contactInfo: 'test',
        msgContent: 'test',
      };
      const expectedLog = {
        status: LogStatus.EVENT_PROCESSED,
        msg_content: 'test',
        contact_info: 'test',
      };
      (mockLoggingRepository.update as jest.Mock).mockResolvedValue(undefined);

      await service.eventProcessed(logData);

      expect(mockLoggingRepository.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining(expectedLog),
      );
    });

    it('should update a log with ERROR type if msgError is provided', async () => {
      const logData: Partial<LogDto> = {
        id: 1,
        contactInfo: 'test',
        msgContent: 'test',
        msgError: 'error',
      };
      const expectedLog = {
        status: LogStatus.EVENT_PROCESSED,
        msg_content: 'test',
        contact_info: 'test',
        msg_error: 'error',
        type: LogType.ERROR,
      };
      (mockLoggingRepository.update as jest.Mock).mockResolvedValue(undefined);

      await service.eventProcessed(logData);

      expect(mockLoggingRepository.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining(expectedLog),
      );
    });

    it('should throw an error if repository throws an error', async () => {
      const logData: Partial<LogDto> = {
        id: 1,
        contactInfo: 'test',
        msgContent: 'test',
      };
      (mockLoggingRepository.update as jest.Mock).mockRejectedValue(
        new Error('Repository error'),
      );

      await expect(service.eventProcessed(logData)).rejects.toThrow(Error);
    });
  });

  describe('messageSent', () => {
    it('should update a log with MESSAGE_SENT status', async () => {
      const logData: Partial<LogDto> = {
        id: 1,
      };
      const expectedLog = {
        status: LogStatus.MESSAGE_SENT,
        sent_at: expect.any(Date),
      };
      (mockLoggingRepository.update as jest.Mock).mockResolvedValue(undefined);

      await service.messageSent(logData);

      expect(mockLoggingRepository.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining(expectedLog),
      );
    });

    it('should update a log with ERROR type if msgError is provided', async () => {
      const logData: Partial<LogDto> = {
        id: 1,
        msgError: 'error',
      };
      const expectedLog = {
        status: LogStatus.MESSAGE_SENT,
        sent_at: expect.any(Date),
        msg_error: 'error',
        type: LogType.ERROR,
      };
      (mockLoggingRepository.update as jest.Mock).mockResolvedValue(undefined);

      await service.messageSent(logData);

      expect(mockLoggingRepository.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining(expectedLog),
      );
    });

    it('should throw an error if repository throws an error', async () => {
      const logData: Partial<LogDto> = {
        id: 1,
      };
      (mockLoggingRepository.update as jest.Mock).mockRejectedValue(
        new Error('Repository error'),
      );

      await expect(service.messageSent(logData)).rejects.toThrow(Error);
    });
  });

  describe('messageReceived', () => {
    it('should create a log with MESSAGE_RECEIVED status', async () => {
      const msgData = {
        from: 'test',
        body: 'test',
      };
      const expectedLog = {
        type: LogType.INFO,
        status: LogStatus.MESSAGE_RECEIVED,
        contact_info: 'test',
        msg_content: 'test',
        received_at: expect.any(Date),
      };
      (mockLoggingRepository.create as jest.Mock).mockResolvedValue(1);

      const result = await service.messageReceived(msgData);

      expect(mockLoggingRepository.create).toHaveBeenCalledWith(
        expect.objectContaining(expectedLog),
      );
      expect(result).toBe(1);
    });

    it('should create a log with ERROR type if msgError is provided', async () => {
      const msgData = {
        from: 'test',
        body: 'test',
        msgError: 'error',
      };
      const expectedLog = {
        type: LogType.ERROR,
        status: LogStatus.MESSAGE_RECEIVED,
        contact_info: 'test',
        msg_content: 'test',
        received_at: expect.any(Date),
        msg_error: 'error',
      };
      (mockLoggingRepository.create as jest.Mock).mockResolvedValue(1);

      await service.messageReceived(msgData);

      expect(mockLoggingRepository.create).toHaveBeenCalledWith(
        expect.objectContaining(expectedLog),
      );
    });

    it('should throw an error if repository throws an error', async () => {
      const msgData = {
        from: 'test',
        body: 'test',
      };
      (mockLoggingRepository.create as jest.Mock).mockRejectedValue(
        new Error('Repository error'),
      );

      await expect(service.messageReceived(msgData)).rejects.toThrow(Error);
    });
  });

  describe('messageProcessed', () => {
    it('should update a log with MESSAGE_PROCESSED status', async () => {
      const logData: Partial<LogDto> = {
        id: 1,
        contextType: ContextOptions.APPOINTMENT_CREATED,
        appointmentId: 1,
      };
      const expectedLog = {
        status: LogStatus.MESSAGE_PROCESSED,
        context_type: ContextOptions.APPOINTMENT_CREATED,
        appointment_id: 1,
        sent_at: expect.any(Date),
      };
      (mockLoggingRepository.update as jest.Mock).mockResolvedValue(undefined);

      await service.messageProcessed(logData);

      expect(mockLoggingRepository.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining(expectedLog),
      );
    });

    it('should update a log with ERROR type if msgError is provided', async () => {
      const logData: Partial<LogDto> = {
        id: 1,
        contextType: ContextOptions.APPOINTMENT_CREATED,
        appointmentId: 1,
        msgError: 'error',
      };
      const expectedLog = {
        status: LogStatus.MESSAGE_PROCESSED,
        context_type: ContextOptions.APPOINTMENT_CREATED,
        appointment_id: 1,
        sent_at: expect.any(Date),
        msg_error: 'error',
        type: LogType.ERROR,
      };
      (mockLoggingRepository.update as jest.Mock).mockResolvedValue(undefined);

      await service.messageProcessed(logData);

      expect(mockLoggingRepository.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining(expectedLog),
      );
    });

    it('should throw an error if repository throws an error', async () => {
      const logData: Partial<LogDto> = {
        id: 1,
        contextType: ContextOptions.APPOINTMENT_CREATED,
        appointmentId: 1,
      };
      (mockLoggingRepository.update as jest.Mock).mockRejectedValue(
        new Error('Repository error'),
      );

      await expect(service.messageProcessed(logData)).rejects.toThrow(Error);
    });
  });
});
