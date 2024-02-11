import axios from 'axios';
import { createWriteStream } from 'fs';
import * as path from 'path';
import { resolve } from 'path';
import { Injectable } from '@nestjs/common';

const dirname = path.resolve(__dirname, '..', '..');
@Injectable()
export class OggConverterService {
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
