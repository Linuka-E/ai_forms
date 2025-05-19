import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AgenticAiController } from './agentic-ai.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AgenticAiController],
})
export class AppModule {}