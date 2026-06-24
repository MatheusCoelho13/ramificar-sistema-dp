import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { Role, User } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { MessagesService } from './messages.service';
import { SendMessageDto } from './dto/send-message.dto';

@Controller('processes/:processId/messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Post()
  send(
    @Param('processId') processId: string,
    @Body() dto: SendMessageDto,
    @CurrentUser() user: User,
  ) {
    return this.messagesService.send(processId, dto, user);
  }

  @Get('funcionario')
  @UseGuards(RolesGuard)
  @Roles(Role.FUNCIONARIO)
  getForFuncionario(@Param('processId') processId: string, @CurrentUser() user: User) {
    return this.messagesService.getForFuncionario(processId, user);
  }

  @Get('defensor')
  @UseGuards(RolesGuard)
  @Roles(Role.DEFENSOR,)
  getForDefender(@Param('processId') processId: string, @CurrentUser() user: User) {
    return this.messagesService.getForDefender(processId, user);
  }
}
