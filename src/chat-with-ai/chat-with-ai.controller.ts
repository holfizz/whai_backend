import { Auth } from '@/auth/decorators/auth.decorator';
import { CurrentUser } from '@/auth/decorators/user.decorator';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import ChatWithAIService from './chat-with-ai.service';
import { chatWithAiRequestDto, createChatWithAI } from './dto/chat-with-ai.dto';

@Controller('chat-with-ai')
export class ChatWithAIController {
  constructor(private readonly chatGptService: ChatWithAIService) {}

  @Post('')
  @Auth('user')
  createChat(@CurrentUser('id') id: number, @Body() dto: createChatWithAI) {
    return this.chatGptService.createChatWithAI(id, dto);
  }

  @Post('message')
  @Auth('user')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'file', maxCount: 1 }]))
  createMessage(
    @CurrentUser('id') id: number,
    @Body() dto: chatWithAiRequestDto,
    @UploadedFiles() document,
  ) {
    let file = undefined;
    if (document && document.file && document.file.length > 0) {
      file = document.file[0];
    }

    return this.chatGptService.createMessageWithAI(id, dto, file);
  }

  @Get(':id')
  @Auth('user')
  getUserChats(@Param('id') id: string) {
    return this.chatGptService.getAllMessageInChatWithAI(+id);
  }
  // @Get('/:id')
  // getAllMessages(@Param('id') id: string) {
  //   return this.chatGptService.getAllMessages(+id);
  // }
  // @Get('/123')
  // getAllMessage() {
  //   return this.chatGptService.getAllMessage();
  // }

  // @Post()
  // @Auth('user')
  // conversation(
  //   @CurrentUser('id') id: number,
  //   @Body() createChatGptDto: ChatGptRequestDto,
  // ) {
  //   return this.chatGptService.getAiModelAnswer(createChatGptDto);
  // }

  // @Delete()
  // deleteContext() {
  //   return this.chatGptService.deleteContext();
  // }
}
