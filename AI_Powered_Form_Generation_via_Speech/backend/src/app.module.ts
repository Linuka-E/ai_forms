import { Module } from '@nestjs/common';
import { GrokService } from './grok/grok.service';
import { GrokController } from './grok/grok.controller';
import { SpeechModule } from './speech/speech.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [SpeechModule],
  controllers: [GrokController,AppController],
  providers: [GrokService,AppService],
})
export class AppModule {}
