import { Module } from '@nestjs/common';
import { OggConverterService } from './ogg-converter.service';
import { FluentFfmpegModule } from '@mrkwskiti/fluent-ffmpeg-nestjs';

@Module({
  imports: [FluentFfmpegModule.forRoot()],
  providers: [OggConverterService],
})
export class OggConverterModule {}
