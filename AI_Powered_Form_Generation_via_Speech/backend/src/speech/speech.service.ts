import { Injectable } from '@nestjs/common';
import { SpeechClient } from '@google-cloud/speech';

@Injectable()
export class SpeechService {
  private client: SpeechClient;

  constructor() {
    this.client = new SpeechClient();
  }

  /**
   * Transcribes audio from a Buffer using Google Cloud Speech-to-Text API.
   * @param audioBuffer - The audio data as a Buffer.
   * @returns The transcribed text.
   */
  async transcribeAudio(audioBuffer: Buffer): Promise<string> {
    const audio = {
      content: audioBuffer.toString('base64'),
    };

    const config = {
      encoding: 'WEBM_OPUS' as const,
      sampleRateHertz: 48000,
      languageCode: 'en-US',
    };

    const request = {
      audio,
      config,
    };

    try {
      const [response] = await this.client.recognize(request);
      const transcription = response.results
        ?.map((result) => result.alternatives?.[0]?.transcript)
        .join('\n') || '';
      return transcription;
    } catch (error) {
      throw new Error(`Transcription failed: ${error.message}`);
    }
  }
}