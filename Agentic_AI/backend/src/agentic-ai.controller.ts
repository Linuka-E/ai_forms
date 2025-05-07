import { Controller, Post, UploadedFile, UseInterceptors, Body, Query } from '@nestjs/common';
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

  public form1: any = {
    name: 'Simple Form',
    description: 'basic fields',
    content: [
      { label: 'Name', type: 'TextField', required: false },
      { label: 'Email', type: 'TextField', required: false },
      { label: 'Gender', type: 'SelectField', required: false, options: ['Male', 'Female', 'Other'] },
      { label: 'Birthday', type: 'DateField', required: false },
      { label: 'Age', type: 'NumberField', required: false },
      { label: 'Notes', type: 'TextField', required: true },
      { label: 'Alumni', type: 'CheckboxField', required: false },
      { label: 'Can Connect', type: 'SwitchField', required: false },
    ],
  };

  public form2: any = {
    name: 'SUT test',
    description: 'testing',
    content: [
      { label: 'First Name', type: 'TextField', required: true },
      { label: 'Company', type: 'TextField', required: false },
      { label: 'Job Title', type: 'TextField', required: false },
      { label: 'What is your association with Swinburne?', type: 'SelectField', required: true, options: ['Alumni', 'Staff', 'Student', 'Industry Partner', 'Other'] },
      { label: 'Do you identify as Aboriginal and/or Torres Strait Islander?', type: 'SelectField', required: false, options: ['No', 'Yes', 'Prefer not to say'] },
      { label: 'Have you previously attended any events or programs hosted by the Swinburne Innovation Studio?', type: 'SelectField', required: false, options: ['Yes', 'No', 'Unsure'] },
    ],
  };


  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    console.log('API Key from config (first few chars):', apiKey?.substring(0, 8) + '...');
    this.openai = new OpenAI({ apiKey });
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
  async handleText(@Body('message') message: string, @Query('form') formChoice: string) {
    this.resetThreadIfFormChanged(formChoice);
    const form = formChoice === 'form2' ? this.form2 : this.form1;
    const assistantPrompt = `{
      "Form": ${JSON.stringify(form)},
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
  async handleVoice(@UploadedFile() file: Multer.File, @Query('form') formChoice: string) {
    this.resetThreadIfFormChanged(formChoice);
    console.log('Received file:', file.originalname);

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

      const form = formChoice === 'form2' ? this.form2 : this.form1;
      const assistantPrompt = `{
        "Form": ${JSON.stringify(form)},
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


      console.log(content)
      let parsed: any;
      try {
        parsed = JSON.parse(content);
      } catch {
        throw new Error('Assistant response is not valid JSON.');
      }

      const { Response, 'Current Form': currentForm } = parsed;
      const { Finish, 'Finished': finish} = parsed; 
      console.log("finished???")
      console.log(finish)



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
