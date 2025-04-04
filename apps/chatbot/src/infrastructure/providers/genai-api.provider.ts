import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GenAIApi {
  constructor(private readonly configService: ConfigService) {}

  async generateContent(promptText: string): Promise<string> {
    try {
      if (this.configService.getOrThrow('NODE_ENV') === 'test') {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return `Resposta mockada para: ${promptText}`;
      }

      const url =
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' +
        this.configService.getOrThrow('GOOGLE_API_KEY');
      const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: promptText,
                },
              ],
            },
          ],
        }),
      });
      if (!response.ok) {
        console.error(response);
        throw new Error(`Response status: ${response.status}`);
      }

      const json = await response.json();

      return json.candidates[0].content.parts[0].text;
    } catch (error) {
      console.log(error);
    }
  }
}
