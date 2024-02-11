import axios from 'axios';
import { createWriteStream } from 'fs';
import * as path from 'path';
import { resolve } from 'path';
import { Injectable } from '@nestjs/common';
import { Ffmpeg, InjectFluentFfmpeg } from '@mrkwskiti/fluent-ffmpeg-nestjs';

const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;

const dirname = path.resolve(__dirname, '..', '..');

@Injectable()
export class OggConverterService {
  constructor(@InjectFluentFfmpeg() private readonly ffmpeg: Ffmpeg) {
    this.ffmpeg.setFfmpegPath(ffmpegPath);
  }

  async toMp3(input: string, output: string): Promise<string> {
    const outputPath = path.resolve(dirname, 'uploads/voices', `${output}.mp3`);
    return new Promise((resolve, reject) => {
      this.ffmpeg(input)
        .inputOption('-t 30')
        .output(outputPath)
        .on('end', () => resolve(outputPath))
        .on('error', (err) => reject(err.message))
        .run();
    });
  }

  async create(url: string, filename: string): Promise<string> {
    try {
      console.log(dirname);

      const oggPath = resolve(dirname, 'uploads/voices', `${filename}.ogg`);
      const response = await axios({
        method: 'get',
        url,
        responseType: 'stream',
      });
      return new Promise((resolve) => {
        const stream = createWriteStream(oggPath);
        response.data.pipe(stream);
        stream.on('finish', () => resolve(oggPath));
      });
    } catch (e) {
      console.error('Error while creating ogg', e);
      throw e;
    }
  }
}
