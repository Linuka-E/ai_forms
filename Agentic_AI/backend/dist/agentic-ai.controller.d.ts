import { Multer } from 'multer';
import { ConfigService } from '@nestjs/config';
export declare class AgenticAiController {
    private configService;
    private openai;
    inConversation: boolean;
    private threadId;
    private currentForm;
    private formData;
    constructor(configService: ConfigService);
    private loadDemographicData;
    private formatFormForOpenAI;
    getForms(): any;
    private resetThreadIfFormChanged;
    handleText(message: string, formChoice?: string): Promise<{
        error: string;
        agentMessage?: undefined;
        extractedFields?: undefined;
    } | {
        agentMessage: any;
        extractedFields: any;
        error?: undefined;
    }>;
    handleVoice(file: Multer.File, formChoice?: string): Promise<{
        error: string;
        transcription?: undefined;
        extractedFields?: undefined;
        agentMessage?: undefined;
    } | {
        transcription: string;
        extractedFields: any;
        agentMessage: any;
        error?: undefined;
    }>;
    private transcribeAudio;
    private runAssistant;
}
