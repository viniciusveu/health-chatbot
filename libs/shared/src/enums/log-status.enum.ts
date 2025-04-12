export enum LogStatus {
  // event-worker
  EVENT_RECEIVED = 'event_received',
  // chatbot
  EVENT_PROCESSED = 'event_processed',
  MESSAGE_PROCESSED = 'message_processed',
  // message-worker
  MESSAGE_SENT = 'message_sent',
  MESSAGE_RECEIVED = 'message_received',
}
