import { Injectable } from '@nestjs/common';

@Injectable()
export class MessageWorkerService {
  sendMessage(data): void {
    console.log('Sending msg: ', data);
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = require('twilio')(accountSid, authToken);

    try {
      client.messages
        .create({
          from: 'whatsapp:' + process.env.TWILIO_PHONE_NUMBER,
          contentSid: process.env.TWILIO_CONTENT_SID,
          contentVariables: JSON.stringify({
            1: data.text
          }),
          to: 'whatsapp:'+data.phone //+5519998682835
        })
        .then(message => console.log('Mensagem enviada:', message.sid))
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
    }
  }
}
