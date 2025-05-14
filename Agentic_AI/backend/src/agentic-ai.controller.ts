import { Controller, Post, UploadedFile, UseInterceptors, Body, Query, Get } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Multer } from 'multer';
import { OpenAI } from 'openai';
type Run = OpenAI.Beta.Threads.Run;
import * as fs from 'fs';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';


@Controller('api/agentic-ai')
export class AgenticAiController {
  private openai: OpenAI;
  public inConversation: boolean = false;
  private threadId: string | null = null;
  private currentForm: string | null = null;
  private formData: any = null;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    console.log('API Key from config (first few chars):', apiKey?.substring(0, 8) + '...');
    this.openai = new OpenAI({ apiKey });
    
    // Load demographic form data
    this.loadDemographicData();
  }

  private loadDemographicData() {
    try {
      // Path to your demographic.json file
      const filePath = path.join(__dirname, '..', '..', 'data', 'demographic.json');
      
      if (fs.existsSync(filePath)) {
        const fileData = fs.readFileSync(filePath, 'utf8');
        this.formData = JSON.parse(fileData);
        console.log('Loaded demographic data successfully');
      } else {
        console.error('demographic.json not found at path:', filePath);
        // Set a fallback form if file is not found
        this.formData = {
          name: 'Demographic',
          description: '',
          content: [
            {
              id: '0b5fd95e-ef75-4902-a602-d10b85af679d',
              type: 'TextField',
              extraAttributes: {
                label: 'Name',
                helperText: '',
                placeHolder: '',
                required: false
              }
            },
            {
              id: 'cb377a9c-0e37-481e-a2e0-9594d3c26fbe',
              type: 'TextField',
              extraAttributes: {
                label: 'Email',
                helperText: '',
                placeHolder: '',
                required: false
              }
            },
            {
              id: '7d3ed087-22cf-47e3-9470-2d8f42487241',
              type: 'SelectField',
              extraAttributes: {
                label: 'Gender',
                helperText: '',
                placeHolder: '',
                required: false,
                options: [
                  'Male',
                  'Female',
                  'Other'
                ]
              }
            },
            {
              id: '0d70dd0a-76eb-4ee4-8a75-a9d472d244d2',
              type: 'DateField',
              extraAttributes: {
                label: 'Birthday',
                helperText: '',
                placeHolder: '',
                required: false
              }
            },
            {
              id: '95562b58-8e44-408d-ab29-04221f80d0cd',
              type: 'NumberField',
              extraAttributes: {
                label: 'Age',
                helperText: '',
                placeHolder: '',
                required: false
              }
            },
            {
              id: '67f49033-a7bd-4553-adeb-0e771c2b15ca',
              type: 'TextField',
              extraAttributes: {
                label: 'Notes',
                helperText: '',
                placeHolder: '',
                required: false
              }
            },
            {
              id: '5bda180e-e1f9-4b5e-9898-02e47b779184',
              type: 'CheckboxField',
              extraAttributes: {
                label: 'Alumni?',
                helperText: '',
                placeHolder: '',
                required: false
              }
            },
            {
              id: 'a09a11ea-c5a6-4e64-a21d-862e810e0caa',
              type: 'SwitchField',
              extraAttributes: {
                label: 'Can Connect?',
                helperText: '',
                placeHolder: '',
                required: false
              }
            }
          ]
        };
      }
    } catch (error) {
      console.error('Error loading demographic data:', error);
    }
  }

  // Helper to format form data for OpenAI
  private formatFormForOpenAI() {
    if (!this.formData) return null;
    
    // Convert the MongoDB document format to the format expected by the Assistant
    const formattedForm = {
      name: this.formData.name,
      description: this.formData.description,
      content: this.formData.content.map(field => {
        return {
          label: field.extraAttributes.label,
          type: field.type,
          required: field.extraAttributes.required,
          options: field.extraAttributes.options || undefined,
        };
      })
    };
    
    return formattedForm;
  }

  // Add endpoint to fetch form data
  @Get('forms')
  getForms() {
    return this.formData || { error: 'Form data not available' };
  }

  private resetThreadIfFormChanged(selected: string) {
    if (this.currentForm !== selected) {
      this.inConversation = false;
      this.threadId = null;
      this.currentForm = selected;
      console.log('Form changed — thread reset.');
    }
  }

  @Post('text')
  async handleText(@Body('message') message: string, @Query('form') formChoice: string = 'demographic') {
    this.resetThreadIfFormChanged(formChoice);
    const formattedForm = this.formatFormForOpenAI();
    
    if (!formattedForm) {
      return {
        error: 'Form data not available'
      };
    }
    
    const assistantPrompt = `{
      "Form": ${JSON.stringify(formattedForm)},
      "Transcript": "${message.replace(/"/g, '\"')}"
    }`;
    
    const response = await this.runAssistant(assistantPrompt);
    return {
      agentMessage: response['Response'],
      extractedFields: response['Current Form']
    };
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async handleVoice(@UploadedFile() file: Multer.File, @Query('form') formChoice: string = 'demographic') {
    this.resetThreadIfFormChanged(formChoice);
    console.log('Received file:', file.originalname);

    const formattedForm = this.formatFormForOpenAI();
    if (!formattedForm) {
      return {
        error: 'Form data not available'
      };
    }

    const tempDir = path.join(__dirname, '..', 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempFilePath = path.join(tempDir, file.originalname);
    fs.writeFileSync(tempFilePath, file.buffer);

    try {
      const transcription = await this.transcribeAudio(tempFilePath);
      console.log('Transcription:', transcription);
      fs.unlinkSync(tempFilePath);

      const assistantPrompt = `{
        "Form": ${JSON.stringify(formattedForm)},
        "Transcript": "${transcription.replace(/"/g, '\"')}"
      }`;

      const response = await this.runAssistant(assistantPrompt);
      return {
        transcription,
        extractedFields: response['Current Form'],
        agentMessage: response['Response'],
      };
    } catch (error) {
      console.error('Error processing audio:', error);
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      throw error;
    }
  }

  private async transcribeAudio(filePath: string): Promise<string> {
    try {
      console.log('Sending file to OpenAI for transcription:', filePath);
      const transcription = await this.openai.audio.transcriptions.create({
        file: fs.createReadStream(filePath) as any,
        model: 'whisper-1',
        response_format: 'json',
      });
      return transcription.text;
    } catch (error) {
      console.error('Error in transcription:', error);
      throw error;
    }
  }

  private async runAssistant(prompt: string): Promise<any> {
    let threadId = this.threadId;
    console.log("this is the prompt");
    console.log(prompt);

    try {
      const assistantId = this.configService.get<string>('OPENAI_ASSISTANT_ID');
      if (!assistantId) throw new Error('Missing Assistant ID in config');

      if (!this.inConversation) {
        const thread = await this.openai.beta.threads.create();
        threadId = thread.id;
        this.threadId = thread.id;
        this.inConversation = true;
        console.log('Thread created:', thread.id);
      }

      if (!threadId) throw new Error('Thread ID missing unexpectedly.');

      await this.openai.beta.threads.messages.create(threadId, {
        role: 'user',
        content: prompt,
      });

      const run = await this.openai.beta.threads.runs.create(threadId, {
        assistant_id: assistantId,
      });

      let runStatus: Run;
      do {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        runStatus = await this.openai.beta.threads.runs.retrieve(threadId, run.id);
      } while (runStatus.status !== 'completed');

      const messages = await this.openai.beta.threads.messages.list(threadId);
      const last = messages.data[0];

      const textBlock = last.content.find(
        (block) => block.type === 'text'
      ) as { type: 'text'; text: { value: string } } | undefined;

      if (!textBlock) throw new Error('No text response from assistant.');

      const content = textBlock.text.value;

      console.log(content);
      let parsed: any;
      try {
        parsed = JSON.parse(content);
      } catch {
        throw new Error('Assistant response is not valid JSON.');
      }

      const { Response, 'Current Form': currentForm } = parsed;
      const { Finish, 'Finished': finish} = parsed; 
      console.log("finished???");
      console.log(finish);

      const allFieldsFilled = Object.values(currentForm).every(
        (value) => value !== '' && value !== 'Not provided'
      );

      if (finish === "true") {
        await this.openai.beta.threads.del(threadId);
        this.inConversation = false;
        this.threadId = null;
        this.currentForm = null;
        console.log('thread killed');
      }

      return parsed;
    } finally {
      console.log('finish job');
    }
  }
}