import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async send(processId: string, dto: SendMessageDto, user: User) {
    const process = await this.prisma.process.findUnique({ where: { id: processId } });
    if (!process) throw new NotFoundException('Processo não encontrado');

    // Funcionário só pode enviar em seus próprios processos
    if (user.role === 'FUNCIONARIO' && process.openedById !== user.id) {
      throw new ForbiddenException();
    }
    // Defensor só pode enviar em processos atribuídos a ele
    if ((user.role === 'DEFENSOR') && process.assignedToId !== user.id) {
      throw new ForbiddenException();
    }

    const message = await this.prisma.message.create({
      data: { processId, senderId: user.id, content: dto.content },
      include: { sender: { select: { id: true, name: true, role: true } } },
    });

    // Atualizar lastActivity e limpar alerta
    await this.prisma.process.update({
      where: { id: processId },
      data: { lastActivity: new Date(), inactivityAlerted: false },
    });

    return message;
  }

  async getForFuncionario(processId: string, user: User) {
    const process = await this.prisma.process.findUnique({ where: { id: processId } });
    if (!process) throw new NotFoundException();
    if (process.openedById !== user.id) throw new ForbiddenException();

    const messages = await this.prisma.message.findMany({
      where: { processId },
      include: { sender: { select: { id: true, name: true, role: true } } },
      orderBy: { createdAt: 'asc' },
    });

    return messages.map((m) => ({
      id: m.id,
      content: m.content,
      createdAt: m.createdAt,
      fromMe: m.senderId === user.id,
      senderLabel: m.sender.role === 'FUNCIONARIO' ? m.sender.name : 'Defensor',
    }));
  }

  async getForDefender(processId: string, user: User) {
    const process = await this.prisma.process.findUnique({ where: { id: processId } });
    if (!process) throw new NotFoundException();
    if (process.assignedToId !== user.id) throw new ForbiddenException();

    return this.prisma.message.findMany({
      where: { processId },
      include: { sender: { select: { id: true, name: true, role: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }
}
