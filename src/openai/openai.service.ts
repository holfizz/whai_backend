import { Injectable } from '@nestjs/common';
import { Audio } from 'openai/resources';
import { createReadStream } from 'fs';
import OpenAI from 'openai';
import TranscriptionCreateParams = Audio.TranscriptionCreateParams;

export enum OpenAIRoles {
  ASSISTANT = 'assistant',
  USER = 'user',
  SYSTEM = 'system',
}
@Injectable()
export class OpenaiService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_KEY,
    });
  }

  async chat(messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]) {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages,
      });
      return response.choices[0].message;
    } catch (e) {
      console.log(e);
    }
  }

  async transcription(pathFile: string): Promise<string> {
    try {
      const fileStream = createReadStream(pathFile);
      const params: TranscriptionCreateParams = {
        file: fileStream,
        model: 'whisper-1',
      };
      const transcriptionResult =
        await this.openai.audio.transcriptions.create(params);
      if (transcriptionResult && transcriptionResult.text) {
        return transcriptionResult.text;
      } else {
        return 'Не распознано';
      }
    } catch (e) {
      console.error('Error while transcription', e);
      throw e;
    }
  }
}
