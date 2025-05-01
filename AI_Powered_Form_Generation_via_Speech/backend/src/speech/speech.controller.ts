import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SpeechService } from './speech.service';

@Controller('speech')
export class SpeechController {
  constructor(private readonly speechService: SpeechService) {}

  @Post('transcribe')
  @UseInterceptors(FileInterceptor('audio'))
  async transcribe(@UploadedFile() file: Express.Multer.File): Promise<{ transcription: string }> {
    const transcription = await this.speechService.transcribeAudio(file.buffer);
    return { transcription };
  }
}