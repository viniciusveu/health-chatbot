export enum InternalContextOptions {
  /**
   * @abstract Send a message to the Message API [chatbot -> message-worker]
   */
  SEND_MESSAGE = 'send-message',

  /**
   * @abstract A message was received from the Message API [message-worker -> chatbot]
   */
  MESSAGE_RECEIVED = 'message-received',
}
