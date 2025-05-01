import { Test, TestingModule } from '@nestjs/testing';
import { LoggingRepository } from './logging.repository';
import { RepositoryFactory } from '@app/database/repository.factory';
import { LoggingRepositoryInterface } from '@app/database';
import { LogDto } from '@app/shared/dtos';
import { ContextOptions } from '@app/shared/enums';

describe('LoggingRepository', () => {
  let repository: LoggingRepository;
  let mockLoggingRepository: Partial<LoggingRepositoryInterface>;

  beforeEach(async () => {
    mockLoggingRepository = {
      create: jest.fn(),
      update: jest.fn(),
      findByContactInfo: jest.fn(),
    };

    const mockRepositoryFactory = {
      getLoggingRepository: () => mockLoggingRepository,
      getAppointmentRepository: () => ({}),
      getFeedbackRepository: () => ({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoggingRepository,
        {
          provide: RepositoryFactory,
          useValue: mockRepositoryFactory,
        },
      ],
    }).compile();

    repository = module.get<LoggingRepository>(LoggingRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should call the repository create method', async () => {
      const data: Partial<LogDto> = {
        appointmentId: 1,
        contextType: ContextOptions.APPOINTMENT_CREATED,
      };
      (mockLoggingRepository.create as jest.Mock).mockResolvedValue(1);

      const result = await repository.create(data);

      expect(mockLoggingRepository.create).toHaveBeenCalledWith(data);
      expect(result).toBe(1);
    });
  });

  describe('update', () => {
    it('should call the repository update method', async () => {
      const id = 1;
      const data: Partial<LogDto> = {
        msgContent: 'test',
      };
      (mockLoggingRepository.update as jest.Mock).mockResolvedValue(undefined);

      await repository.update(id, data);

      expect(mockLoggingRepository.update).toHaveBeenCalledWith(id, data);
    });
  });

  describe('findByContactInfo', () => {
    it('should call the repository findByContactInfo method', async () => {
      const contactInfo = '123456789';
      (mockLoggingRepository.findByContactInfo as jest.Mock).mockResolvedValue(
        undefined,
      );

      await repository.findByContactInfo(contactInfo);

      expect(mockLoggingRepository.findByContactInfo).toHaveBeenCalledWith(
        contactInfo,
      );
    });
  });
});
