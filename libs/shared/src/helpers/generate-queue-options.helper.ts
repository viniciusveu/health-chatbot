export function generateQueueOptions(
  queueName: string,
  ttl: number = 120_000,
): Record<string, any> {
  return {
    urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
    queue: queueName,
    queueOptions: {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': '',
        'x-dead-letter-routing-key': `${queueName}.dlq`,
        'x-message-ttl': ttl,
      },
    },
  };
}
