import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { Audio } from 'openai/resources';
import { createReadStream } from 'fs';
import TranscriptionCreateParams = Audio.TranscriptionCreateParams;

@Injectable()
export class OpenaiService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_KEY,
    });
  }

  telegramChat() {}

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
