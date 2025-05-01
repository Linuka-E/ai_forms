import { Controller, Post, Body } from '@nestjs/common';
import { GrokService } from './grok.service';

@Controller('grok')
export class GrokController {
  constructor(private readonly grokService: GrokService) {}

  @Post()
  async getGrokResponse(@Body('query') query: string): Promise<any> {
    return this.grokService.callGrokApi(query);
  }
}
