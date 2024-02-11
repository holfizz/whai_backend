import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

interface ChatGptAnswer {
  id: string;
  object: string;
  created: number;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  choices: {
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
    index: number;
  }[];
}

@Injectable()
export class ChatService {
  // private readonly logger = new Logger(ChatService.name);
  // private apiUrl: string;
  //
  // constructor(
  //   private configService: ConfigService,
  //   private httpService: HttpService,
  // ) {
  //   this.apiUrl = 'https://api.openai.com/v1/chat/completions';
  // }

  async generateResponse(prompt: string) {
    const openai = new OpenAI({
      apiKey: process.env.GPT_TOKEN,
    });

    const chatCompletion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: 'write mini poem about love' }],
      model: 'gpt-3.5-turbo',
    });
    return chatCompletion;
    // const apiKey = this.configService.get('GPT_TOKEN');
    // const headers = {
    //   'Content-Type': 'application/json',
    //   Authorization: `Bearer ${apiKey}`,
    // };
    //
    // const data = {
    //   model: 'gpt-3.5-turbo',
    //   messages: [{ role: 'user', content: prompt }],
    //   temperature: 1,
    // };
    // return this.httpService
    //   .post<ChatGptAnswer>(this.apiUrl, data, { headers })
    //   .pipe(
    //     map((data) => data.data?.choices[0].message.content.trim()),
    //     catchError((err) => {
    //       this.logger.error(err);
    //       return of(err);
    //     }),
    //   );
  }
}
