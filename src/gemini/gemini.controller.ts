import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { GeneratePlaging, SendMessageDto } from './dto/create-gemini.dto';
import { User } from 'src/decorator/user-decorator';
import { UserEntity } from 'src/user/entities/user.entity';

@Controller('gemini')
export class GeminiController {
  constructor(private readonly geminiService: GeminiService) {}

  @Post('chat/start')
  startVeterinaryChat(@User() user: UserEntity) {
    return this.geminiService.startVeterinaryChat(user._id, 'volailles');
  }

  @Post('chat/send-message/:chatId')
  sendMessage(
    @Body() sendMessageDto: SendMessageDto,
    @User() user: UserEntity,
    @Param('chatId') chatId: string,
  ) {
    return this.geminiService.sendMessage(chatId, sendMessageDto.message);
  }

  @Post('planing/generate')
  generatePlaning(
    @Body() generateplaning: GeneratePlaging,
    @User() user: UserEntity,
  ) {
    return this.geminiService.generatePlaning(generateplaning, user);
  }
}
