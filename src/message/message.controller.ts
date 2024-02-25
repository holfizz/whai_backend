import { Auth } from '@/auth/decorators/auth.decorator';
import { CurrentUser } from '@/auth/decorators/user.decorator';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { MessageService } from './message.service';

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  @Auth('user')
  create(
    @CurrentUser('id') userId: number,
    @Body() createMessageDto: CreateMessageDto,
  ) {
    return this.messageService.createMessage(userId, createMessageDto);
  }

  @Get()
  @Auth('user')
  getAllMessages(@CurrentUser('id') userId: number, @Body() UpdateMessageDto) {
    return this.messageService.getAllMessages(userId, UpdateMessageDto.chatId);
  }

  @Patch(':id')
  @Auth('user')
  update(
    @CurrentUser('id') userId: number,
    @Param('id') id: string,
    @Body() updateMessageDto: UpdateMessageDto,
  ) {
    return this.messageService.updateMessage(userId, +id, updateMessageDto);
  }

  @Delete(':id')
  @Auth('user')
  remove(@CurrentUser('id') userId: number, @Param('id') id: string) {
    return this.messageService.deleteMessage(userId, +id);
  }
}
