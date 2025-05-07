"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgenticAiController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const openai_1 = require("openai");
const fs = require("fs");
const path = require("path");
const config_1 = require("@nestjs/config");
let AgenticAiController = class AgenticAiController {
    constructor(configService) {
        this.configService = configService;
        this.inConversation = false;
        this.threadId = null;
        this.currentForm = null;
        this.form1 = {
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
        this.form2 = {
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
        const apiKey = this.configService.get('OPENAI_API_KEY');
        console.log('API Key from config (first few chars):', (apiKey === null || apiKey === void 0 ? void 0 : apiKey.substring(0, 8)) + '...');
        this.openai = new openai_1.OpenAI({ apiKey });
    }
    resetThreadIfFormChanged(selected) {
        if (this.currentForm !== selected) {
            this.inConversation = false;
            this.threadId = null;
            this.currentForm = selected;
            console.log('Form changed — thread reset.');
        }
    }
    async handleText(message, formChoice) {
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
    async handleVoice(file, formChoice) {
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
        }
        catch (error) {
            console.error('Error processing audio:', error);
            if (fs.existsSync(tempFilePath)) {
                fs.unlinkSync(tempFilePath);
            }
            throw error;
        }
    }
    async transcribeAudio(filePath) {
        try {
            console.log('Sending file to OpenAI for transcription:', filePath);
            const transcription = await this.openai.audio.transcriptions.create({
                file: fs.createReadStream(filePath),
                model: 'whisper-1',
                response_format: 'json',
            });
            return transcription.text;
        }
        catch (error) {
            console.error('Error in transcription:', error);
            throw error;
        }
    }
    async runAssistant(prompt) {
        let threadId = this.threadId;
        console.log("this is the prompt");
        console.log(prompt);
        try {
            const assistantId = this.configService.get('OPENAI_ASSISTANT_ID');
            if (!assistantId)
                throw new Error('Missing Assistant ID in config');
            if (!this.inConversation) {
                const thread = await this.openai.beta.threads.create();
                threadId = thread.id;
                this.threadId = thread.id;
                this.inConversation = true;
                console.log('Thread created:', thread.id);
            }
            if (!threadId)
                throw new Error('Thread ID missing unexpectedly.');
            await this.openai.beta.threads.messages.create(threadId, {
                role: 'user',
                content: prompt,
            });
            const run = await this.openai.beta.threads.runs.create(threadId, {
                assistant_id: assistantId,
            });
            let runStatus;
            do {
                await new Promise((resolve) => setTimeout(resolve, 1000));
                runStatus = await this.openai.beta.threads.runs.retrieve(threadId, run.id);
            } while (runStatus.status !== 'completed');
            const messages = await this.openai.beta.threads.messages.list(threadId);
            const last = messages.data[0];
            const textBlock = last.content.find((block) => block.type === 'text');
            if (!textBlock)
                throw new Error('No text response from assistant.');
            const content = textBlock.text.value;
            console.log(content);
            let parsed;
            try {
                parsed = JSON.parse(content);
            }
            catch (_a) {
                throw new Error('Assistant response is not valid JSON.');
            }
            const { Response, 'Current Form': currentForm } = parsed;
            const { Finish, 'Finished': finish } = parsed;
            console.log("finished???");
            console.log(finish);
            const allFieldsFilled = Object.values(currentForm).every((value) => value !== '' && value !== 'Not provided');
            if (finish === "true") {
                await this.openai.beta.threads.del(threadId);
                this.inConversation = false;
                this.threadId = null;
                this.currentForm = null;
                console.log('thread killed');
            }
            return parsed;
        }
        finally {
            console.log('finish job');
        }
    }
};
__decorate([
    (0, common_1.Post)('text'),
    __param(0, (0, common_1.Body)('message')),
    __param(1, (0, common_1.Query)('form')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AgenticAiController.prototype, "handleText", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Query)('form')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_a = typeof multer_1.Multer !== "undefined" && multer_1.Multer.File) === "function" ? _a : Object, String]),
    __metadata("design:returntype", Promise)
], AgenticAiController.prototype, "handleVoice", null);
AgenticAiController = __decorate([
    (0, common_1.Controller)('api/agentic-ai'),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AgenticAiController);
exports.AgenticAiController = AgenticAiController;
//# sourceMappingURL=agentic-ai.controller.js.map