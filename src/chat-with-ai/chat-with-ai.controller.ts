import { Auth } from '@/auth/decorators/auth.decorator';
import { CurrentUser } from '@/auth/decorators/user.decorator';
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import ChatGptService from './chat-with-ai.service';
import { chatWithAiRequestDto, createChatWithAI } from './dto/chat-with-ai.dto';

@Controller('chat-with-ai')
export class ChatGptController {
  constructor(private readonly chatGptService: ChatGptService) {}

  @Post('')
  @Auth('user')
  createChat(@CurrentUser('id') id: number, @Body() dto: createChatWithAI) {
    return this.chatGptService.createChatWithAI(id, dto);
  }

  @Post('message')
  @Auth('user')
  createMessage(
    @CurrentUser('id') id: number,
    @Body() dto: chatWithAiRequestDto,
  ) {
    return this.chatGptService.createMessageWithAI(id, dto);
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
