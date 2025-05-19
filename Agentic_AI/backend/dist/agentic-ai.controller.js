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
        this.formData = null;
        const apiKey = this.configService.get('OPENAI_API_KEY');
        console.log('API Key from config (first few chars):', (apiKey === null || apiKey === void 0 ? void 0 : apiKey.substring(0, 8)) + '...');
        this.openai = new openai_1.OpenAI({ apiKey });
        this.loadDemographicData();
    }
    loadDemographicData() {
        try {
            const filePath = path.join(__dirname, '..', '..', 'data', 'demographic.json');
            if (fs.existsSync(filePath)) {
                const fileData = fs.readFileSync(filePath, 'utf8');
                this.formData = JSON.parse(fileData);
                console.log('Loaded demographic data successfully');
            }
            else {
                console.error('demographic.json not found at path:', filePath);
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
        }
        catch (error) {
            console.error('Error loading demographic data:', error);
        }
    }
    formatFormForOpenAI() {
        if (!this.formData)
            return null;
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
    getForms() {
        return this.formData || { error: 'Form data not available' };
    }
    resetThreadIfFormChanged(selected) {
        if (this.currentForm !== selected) {
            this.inConversation = false;
            this.threadId = null;
            this.currentForm = selected;
            console.log('Form changed — thread reset.');
        }
    }
    async handleText(message, formChoice = 'demographic') {
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
    async handleVoice(file, formChoice = 'demographic') {
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
    (0, common_1.Get)('forms'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AgenticAiController.prototype, "getForms", null);
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