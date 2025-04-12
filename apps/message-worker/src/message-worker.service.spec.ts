import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
// DO NOT import { Twilio } from 'twilio'; // Let the mock handle the definition.

import { MessageWorkerService } from './message-worker.service';
import { LoggingService } from '@app/logging';
import { QueueClient } from '@app/queue';
import { MessageDataDto } from '@app/shared/dtos';
import { InternalContextOptions } from '@app/shared/enums';

// --- DEFINE CORE MOCK FUNCTIONALITY FIRST ---
const mockTwilioMessagesCreate = jest.fn();

// --- NOW MOCK THE MODULE ---
jest.mock('twilio', () => {
  return {
    __esModule: true, // Indicate it's an ES module
    // Define the 'Twilio' export as a mock constructor
    Twilio: jest.fn().mockImplementation(() => {
      // The constructor returns an object that mimics the Twilio client instance
      return {
        messages: {
          // Assign the externally defined mock function to the 'create' method
          create: mockTwilioMessagesCreate,
        },
      };
    }),
  };
});

// --- Mock other dependencies/globals ---
jest.spyOn(Logger, 'log').mockImplementation(() => {});
jest.spyOn(Logger, 'warn').mockImplementation(() => {});
jest.spyOn(console, 'log').mockImplementation(() => {});
jest.spyOn(console, 'error').mockImplementation(() => {});

describe('MessageWorkerService', () => {
  let service: MessageWorkerService;
  let loggingService: LoggingService;
  let queueClient: QueueClient;
  let configService: ConfigService;
  let MockTwilio: jest.Mock; // To access the mocked constructor

  // Mock implementations for dependencies
  const mockLoggingService = {
    messageSent: jest.fn(),
    messageReceived: jest.fn(), // Define return value in tests or beforeEach
  };

  const mockQueueClient = {
    emit: jest.fn(),
  };

  // Base mock implementation for ConfigService
  const configServiceGetOrThrowImpl = (key: string): string => {
    switch (key) {
      case 'TWILIO_ACCOUNT_SID':
        return 'mockAccountSid';
      case 'TWILIO_AUTH_TOKEN':
        return 'mockAuthToken';
      case 'NODE_ENV':
        return 'development'; // Default for most tests
      // Note: TWILIO_PHONE_NUMBER is read from process.env in the service
      default:
        throw new Error(`Mock ConfigService missing key: ${key}`);
    }
  };

  const mockConfigService = {
    getOrThrow: jest.fn().mockImplementation(configServiceGetOrThrowImpl),
  };

  // Store original process.env
  const originalEnv = process.env;

  beforeEach(async () => {
    // --- Reset Mocks ---
    mockTwilioMessagesCreate.mockClear();
    // Default to resolving successfully for most tests
    mockTwilioMessagesCreate.mockResolvedValue({ sid: 'SM_mockSid_default' });

    // Clear other mocks
    jest.clearAllMocks(); // Clears spies like Logger, console
    mockLoggingService.messageSent.mockClear();
    mockLoggingService.messageReceived
      .mockClear()
      .mockResolvedValue('mockEventId123'); // Reset default resolved value
    mockQueueClient.emit.mockClear();
    // Reset ConfigService mock implementation to default
    mockConfigService.getOrThrow.mockImplementation(
      configServiceGetOrThrowImpl,
    );

    // --- Mock process.env ---
    process.env = { ...originalEnv }; // Reset to original values
    process.env.TWILIO_PHONE_NUMBER = '+15005550006'; // Set mock env var

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageWorkerService,
        { provide: LoggingService, useValue: mockLoggingService },
        { provide: QueueClient, useValue: mockQueueClient },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<MessageWorkerService>(MessageWorkerService);
    loggingService = module.get<LoggingService>(LoggingService);
    queueClient = module.get<QueueClient>(QueueClient);
    configService = module.get<ConfigService>(ConfigService);

    // Get the mocked Twilio constructor after module compilation
    MockTwilio = require('twilio').Twilio;
  });

  // --- Restore original process.env after all tests ---
  afterAll(() => {
    process.env = originalEnv;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ==========================================================================
  // Tests for sendMessage
  // ==========================================================================
  describe('sendMessage', () => {
    // const messageData: MessageDataDto = {
    //   contact: '+1234567890',
    //   message: 'Hello Test Message',
    //   eventId: 987, // Example eventId
    // };
    // const expectedTwilioPayload = {
    //   from: 'whatsapp:' + process.env.TWILIO_PHONE_NUMBER,
    //   to: 'whatsapp:' + messageData.contact,
    //   body: messageData.message,
    // };
    // it('should get config, initialize Twilio, call create, log success, and call loggingService.messageSent (non-test env)', async () => {
    //   // Arrange
    //   mockConfigService.getOrThrow.mockImplementation((key: string): string => {
    //     if (key === 'NODE_ENV') return 'production';
    //     return configServiceGetOrThrowImpl(key); // Use default for others
    //   });
    //   const mockMessageSid = 'SMxxxxSUCCESS';
    //   mockTwilioMessagesCreate.mockResolvedValueOnce({ sid: mockMessageSid });
    //   // Act
    //   await service.sendMessage(messageData);
    //   // Wait for the promise inside .then() to potentially resolve/log
    //   await new Promise(process.nextTick);
    //   // Assert
    //   expect(console.log).toHaveBeenCalledWith('Sending msg: ', messageData);
    //   expect(configService.getOrThrow).toHaveBeenCalledWith(
    //     'TWILIO_ACCOUNT_SID',
    //   );
    //   expect(configService.getOrThrow).toHaveBeenCalledWith(
    //     'TWILIO_AUTH_TOKEN',
    //   );
    //   expect(configService.getOrThrow).toHaveBeenCalledWith('NODE_ENV');
    //   expect(MockTwilio).toHaveBeenCalledTimes(1);
    //   expect(MockTwilio).toHaveBeenCalledWith(
    //     'mockAccountSid',
    //     'mockAuthToken',
    //   );
    //   expect(mockTwilioMessagesCreate).toHaveBeenCalledTimes(1);
    //   expect(mockTwilioMessagesCreate).toHaveBeenCalledWith(
    //     expectedTwilioPayload,
    //   );
    //   expect(loggingService.messageSent).toHaveBeenCalledTimes(1);
    //   expect(loggingService.messageSent).toHaveBeenCalledWith({
    //     id: messageData.eventId,
    //   }); // Called before .then() resolves
    //   expect(console.log).toHaveBeenCalledWith(
    //     'Mensagem enviada:',
    //     mockMessageSid,
    //   ); // Logged inside .then()
    //   expect(console.error).not.toHaveBeenCalled(); // No errors expected
    // });
    // it('should skip Twilio call, use setTimeout, log mock success, and call loggingService.messageSent (test env)', async () => {
    //   // Arrange
    //   mockConfigService.getOrThrow.mockImplementation((key: string): string => {
    //     if (key === 'NODE_ENV') return 'test';
    //     return configServiceGetOrThrowImpl(key); // Use default for others
    //   });
    //   jest.useFakeTimers();
    //   // Act
    //   const sendMessagePromise = service.sendMessage(messageData);
    //   // Should not complete yet because of setTimeout
    //   // Assert before timer finishes
    //   expect(console.log).toHaveBeenCalledWith('Sending msg: ', messageData);
    //   expect(configService.getOrThrow).toHaveBeenCalledWith(
    //     'TWILIO_ACCOUNT_SID',
    //   );
    //   expect(configService.getOrThrow).toHaveBeenCalledWith(
    //     'TWILIO_AUTH_TOKEN',
    //   );
    //   expect(configService.getOrThrow).toHaveBeenCalledWith('NODE_ENV');
    //   expect(MockTwilio).toHaveBeenCalledTimes(1); // Client is still created
    //   expect(mockTwilioMessagesCreate).not.toHaveBeenCalled(); // create() is skipped
    //   expect(loggingService.messageSent).not.toHaveBeenCalled();
    //   expect(console.log).not.toHaveBeenCalledWith(
    //     'Msg sent to Twilio! (mock)',
    //   );
    //   // Fast-forward timer
    //   jest.advanceTimersByTime(3000);
    //   await sendMessagePromise; // Wait for the promise to resolve after timer
    //   // Assert after timer finishes
    //   expect(mockTwilioMessagesCreate).not.toHaveBeenCalled();
    //   expect(loggingService.messageSent).toHaveBeenCalledTimes(1);
    //   expect(loggingService.messageSent).toHaveBeenCalledWith({
    //     id: messageData.eventId,
    //   });
    //   expect(console.log).toHaveBeenCalledWith('Msg sent to Twilio! (mock)');
    //   expect(console.error).not.toHaveBeenCalled();
    //   jest.useRealTimers(); // Restore real timers
    // });
    // it('should call loggingService.messageSent without error when Twilio create() promise rejects', async () => {
    //   // Arrange
    //   mockConfigService.getOrThrow.mockImplementation((key: string): string => {
    //     if (key === 'NODE_ENV') return 'production';
    //     return configServiceGetOrThrowImpl(key);
    //   });
    //   const error = new Error('Twilio API Failure');
    //   mockTwilioMessagesCreate.mockRejectedValueOnce(error);
    //   // Act
    //   await service.sendMessage(messageData);
    //   // Wait for microtasks queue to clear for the rejection to potentially be handled
    //   await new Promise(process.nextTick);
    //   // Assert
    //   expect(MockTwilio).toHaveBeenCalledTimes(1);
    //   expect(mockTwilioMessagesCreate).toHaveBeenCalledTimes(1);
    //   expect(mockTwilioMessagesCreate).toHaveBeenCalledWith(
    //     expectedTwilioPayload,
    //   );
    //   // IMPORTANT: loggingService.messageSent is called *before* the promise rejection occurs
    //   // in the service's current logic because client.messages.create().then() is not awaited.
    //   expect(loggingService.messageSent).toHaveBeenCalledTimes(1);
    //   expect(loggingService.messageSent).toHaveBeenCalledWith({
    //     id: messageData.eventId,
    //   });
    //   // msgError is NOT included here because the error happens async after this call
    //   expect(loggingService.messageSent).not.toHaveBeenCalledWith(
    //     expect.objectContaining({ msgError: expect.any(String) }),
    //   );
    //   // The console.log inside .then() should NOT be called
    //   expect(console.log).not.toHaveBeenCalledWith(
    //     'Mensagem enviada:',
    //     expect.any(String),
    //   );
    //   // The outer catch block does NOT catch the async rejection, so console.error is not called by it.
    //   expect(console.error).not.toHaveBeenCalledWith(
    //     'Erro ao enviar mensagem:',
    //     error,
    //   );
    //   // Note: Jest might report an unhandled promise rejection in the test output, which is correct for this scenario.
    // });
    // it('should call loggingService.messageSent with error and log error via console.error if config fails inside try block', async () => {
    //   // Arrange
    //   const configError = new Error('Failed to get NODE_ENV');
    //   mockConfigService.getOrThrow.mockImplementation((key: string): string => {
    //     if (key === 'TWILIO_ACCOUNT_SID') return 'mockAccountSid';
    //     if (key === 'TWILIO_AUTH_TOKEN') return 'mockAuthToken';
    //     if (key === 'NODE_ENV') throw configError; // Error inside try block
    //     return ''; // Should not be reached
    //   });
    //   // Act
    //   await service.sendMessage(messageData);
    //   // Assert
    //   expect(console.log).toHaveBeenCalledWith('Sending msg: ', messageData);
    //   expect(configService.getOrThrow).toHaveBeenCalledWith(
    //     'TWILIO_ACCOUNT_SID',
    //   );
    //   expect(configService.getOrThrow).toHaveBeenCalledWith(
    //     'TWILIO_AUTH_TOKEN',
    //   );
    //   expect(configService.getOrThrow).toHaveBeenCalledWith('NODE_ENV');
    //   expect(MockTwilio).toHaveBeenCalledTimes(1); // Twilio client created before error
    //   expect(mockTwilioMessagesCreate).not.toHaveBeenCalled(); // create() not called
    //   expect(loggingService.messageSent).toHaveBeenCalledTimes(1); // Called by catch block
    //   expect(loggingService.messageSent).toHaveBeenCalledWith({
    //     id: messageData.eventId,
    //     msgError: `${configError}`, // Error included
    //   });
    //   expect(console.error).toHaveBeenCalledTimes(1); // Logged by catch block
    //   expect(console.error).toHaveBeenCalledWith(
    //     'Erro ao enviar mensagem:',
    //     configError,
    //   );
    // });
    // it('should throw error and not call loggingService or console.error if config fails before try block', async () => {
    //   // Arrange
    //   const configError = new Error('Failed to get SID');
    //   mockConfigService.getOrThrow.mockImplementation((key: string): string => {
    //     if (key === 'TWILIO_ACCOUNT_SID') throw configError; // Error before try block
    //     return configServiceGetOrThrowImpl(key);
    //   });
    //   // Act & Assert
    //   await expect(service.sendMessage(messageData)).rejects.toThrow(
    //     configError,
    //   );
    //   // Assert Mocks
    //   expect(console.log).toHaveBeenCalledWith('Sending msg: ', messageData); // Initial log happens
    //   expect(configService.getOrThrow).toHaveBeenCalledWith(
    //     'TWILIO_ACCOUNT_SID',
    //   );
    //   expect(MockTwilio).not.toHaveBeenCalled(); // Constructor not called
    //   expect(mockTwilioMessagesCreate).not.toHaveBeenCalled();
    //   // Neither messageSent nor console.error are called because the error is thrown before the try/catch
    //   expect(loggingService.messageSent).not.toHaveBeenCalled();
    //   expect(console.error).not.toHaveBeenCalled();
    // });
  });

  // ==========================================================================
  // Tests for receiveMessage
  // ==========================================================================
  describe('receiveMessage', () => {
    // const from = 'whatsapp:+9876543210';
    // const body = 'Incoming Test Message';
    // const eventId = 'evt-test-456';
    // it('should log message, call loggingService.messageReceived, and emit to queueClient on success', async () => {
    //   // Arrange
    //   mockLoggingService.messageReceived.mockResolvedValueOnce(eventId);
    //   // Act
    //   await service.receiveMessage(from, body);
    //   // Assert
    //   expect(Logger.log).toHaveBeenCalledWith(
    //     expect.stringContaining(`From: ${from} | Message: ${body}`),
    //   );
    //   expect(loggingService.messageReceived).toHaveBeenCalledTimes(1);
    //   expect(loggingService.messageReceived).toHaveBeenCalledWith({
    //     from,
    //     body,
    //   });
    //   expect(queueClient.emit).toHaveBeenCalledTimes(1);
    //   expect(queueClient.emit).toHaveBeenCalledWith(
    //     InternalContextOptions.MESSAGE_RECEIVED,
    //     { From: from, Body: body, eventId: eventId },
    //   );
    //   expect(Logger.warn).not.toHaveBeenCalled();
    // });
    // it('should log warning and return null if From is missing', async () => {
    //   // Act
    //   const result = await service.receiveMessage(null, body);
    //   // Assert
    //   expect(result).toBeNull();
    //   expect(Logger.warn).toHaveBeenCalledWith(
    //     expect.stringContaining("Missing 'from' or 'body'"),
    //   );
    //   expect(Logger.log).toHaveBeenCalledTimes(1); // Initial log still happens
    //   expect(loggingService.messageReceived).not.toHaveBeenCalled();
    //   expect(queueClient.emit).not.toHaveBeenCalled();
    // });
    // it('should log warning and return null if Body is missing', async () => {
    //   // Act
    //   const result = await service.receiveMessage(from, null);
    //   // Assert
    //   expect(result).toBeNull();
    //   expect(Logger.warn).toHaveBeenCalledWith(
    //     expect.stringContaining("Missing 'from' or 'body'"),
    //   );
    //   expect(Logger.log).toHaveBeenCalledTimes(1); // Initial log still happens
    //   expect(loggingService.messageReceived).not.toHaveBeenCalled();
    //   expect(queueClient.emit).not.toHaveBeenCalled();
    // });
    // it('should re-throw error if loggingService.messageReceived rejects', async () => {
    //   // Arrange
    //   const logError = new Error('Failed to log received message');
    //   mockLoggingService.messageReceived.mockRejectedValueOnce(logError);
    //   // Act & Assert
    //   await expect(service.receiveMessage(from, body)).rejects.toThrow(
    //     logError,
    //   );
    //   // Assert Mocks
    //   expect(Logger.log).toHaveBeenCalledTimes(1);
    //   expect(loggingService.messageReceived).toHaveBeenCalledTimes(1);
    //   expect(loggingService.messageReceived).toHaveBeenCalledWith({
    //     from,
    //     body,
    //   });
    //   expect(queueClient.emit).not.toHaveBeenCalled(); // Should not emit if logging fails
    //   expect(Logger.warn).not.toHaveBeenCalled();
    // });
    // it('should re-throw error if queueClient.emit throws', async () => {
    //   // Arrange
    //   const emitError = new Error('Failed to emit to queue');
    //   mockLoggingService.messageReceived.mockResolvedValueOnce(eventId); // Logging succeeds
    //   mockQueueClient.emit.mockImplementationOnce(() => {
    //     // Emit fails
    //     throw emitError;
    //   });
    //   // Act & Assert
    //   await expect(service.receiveMessage(from, body)).rejects.toThrow(
    //     emitError,
    //   );
    //   // Assert Mocks
    //   expect(Logger.log).toHaveBeenCalledTimes(1);
    //   expect(loggingService.messageReceived).toHaveBeenCalledTimes(1);
    //   expect(loggingService.messageReceived).toHaveBeenCalledWith({
    //     from,
    //     body,
    //   });
    //   expect(queueClient.emit).toHaveBeenCalledTimes(1); // Emit was called before throwing
    //   expect(queueClient.emit).toHaveBeenCalledWith(
    //     InternalContextOptions.MESSAGE_RECEIVED,
    //     { From: from, Body: body, eventId: eventId },
    //   );
    //   expect(Logger.warn).not.toHaveBeenCalled();
    // });
  });
});
