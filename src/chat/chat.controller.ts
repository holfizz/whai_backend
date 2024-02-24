import { Auth } from '@/auth/decorators/auth.decorator';
import { CurrentUser } from '@/auth/decorators/user.decorator';
import { Body, Controller, Delete, Param, Patch, Post } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @Auth('user')
  createChat(
    @CurrentUser('id') userId: number,
    @Body() createChatDto: CreateChatDto,
  ) {
    return this.chatService.createChat(userId, createChatDto);
  }

  @Patch(':id')
  @Auth('user')
  updateChat(
    @CurrentUser('id') userId: number,
    @Param('id') id: string,
    @Body() updateChatDto: UpdateChatDto,
  ) {
    return this.chatService.updateChat(userId, +id, updateChatDto);
  }

  @Delete(':id')
  @Auth('user')
  deleteChat(@CurrentUser('id') userId: number, @Param('id') id: string) {
    return this.chatService.deleteChat(userId, +id);
  }
}
