import { Multer } from 'multer';
import { ConfigService } from '@nestjs/config';
export declare class AgenticAiController {
    private configService;
    private openai;
    inConversation: boolean;
    private threadId;
    private currentForm;
    form1: any;
    form2: any;
    constructor(configService: ConfigService);
    private resetThreadIfFormChanged;
    handleText(message: string, formChoice: string): Promise<{
        agentMessage: any;
        extractedFields: any;
    }>;
    handleVoice(file: Multer.File, formChoice: string): Promise<{
        transcription: string;
        extractedFields: any;
        agentMessage: any;
    }>;
    private transcribeAudio;
    private runAssistant;
}
