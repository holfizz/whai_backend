import { Body, Controller, Delete, Post } from '@nestjs/common';
import { ChatGptService } from './chat-gpt.service';
import { ChatGptRequestDto } from './dto/chat-gpt.dto';
import { UserDto } from './dto/user.dto';

@Controller('chat')
export class ChatGptController {
  constructor(private readonly chatGptService: ChatGptService) {}

  @Post('/create')
  createChat(@Body() dto: UserDto) {
    return this.chatGptService.createChat(+dto.userId);
  }

  @Post('/get')
  getUserChats(@Body() dto: UserDto) {
    return this.chatGptService.getUserChats(+dto.userId);
  }

  @Post()
  conversation(@Body() createChatGptDto: ChatGptRequestDto) {
    return this.chatGptService.getAiModelAnswer(createChatGptDto);
  }
  @Delete()
  deleteContext() {
    return this.chatGptService.deleteContext();
  }
}
