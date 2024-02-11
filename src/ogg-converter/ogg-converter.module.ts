import { Module } from '@nestjs/common';
import { OggConverterService } from './ogg-converter.service';

@Module({
  providers: [OggConverterService],
})
export class OggConverterModule {}
