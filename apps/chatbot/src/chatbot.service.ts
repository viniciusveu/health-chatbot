import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class ChatbotService {
  constructor(@Inject('MESSAGE_WORKER') private readonly rabbitClient: ClientProxy) {}

  async confirmAppointment(data: any): Promise<void> {
    console.log('Data: ', data);
    try {
      const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + process.env.GOOGLE_API_KEY;
      const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify({
          "contents": [{
            "parts": [{ "text": "Give me a short message in portuguese like you are a real person saying that the appointment has been confirmed for " + data.name + " on " + data.date + " at " + data.time + ". It will be sent by Whatsapp and you can personalize the message with the age and gender of the patient: age (" + data.age + "), gender (" + data.gender + ")" }]
          }]
        })
      })
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }

      const json = await response.json();
      console.log(JSON.stringify(json.candidates[0].content.parts[0]));

      Object.assign(data, json.candidates[0].content.parts[0]);

      this.rabbitClient.emit('send-message', data);
    } catch (error) {
      console.log(error);
    }
    
    return data;
  }
} 