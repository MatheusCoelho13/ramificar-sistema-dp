import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ScaleService } from '../scale/scale.service';
import { CreateProcessDto } from './dto/create-process.dto';
import { UpdateProcessDto } from './dto/update-process.dto';
import { User } from '@prisma/client';

// Urgency thresholds in days
const URGENCY_YELLOW_DAYS = 5;
const URGENCY_RED_DAYS = 2;

export function calcUrgency(deadline: Date | null): 'VERDE' | 'AMARELO' | 'VERMELHO' | 'SEM_PRAZO' {
  if (!deadline) return 'SEM_PRAZO';
  const diff = (deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  if (diff < URGENCY_RED_DAYS) return 'VERMELHO';
  if (diff < URGENCY_YELLOW_DAYS) return 'AMARELO';
  return 'VERDE';
}

function stripDefenderIdentity(process: any) {
  const { assignedTo: _a, assignedToId: _b, ...safe } = process;
  return { ...safe, defensor: process.assignedTo ? { codename: process._codename ?? 'Defensor' } : null };
}

@Injectable()
export class ProcessesService {
  constructor(
    private prisma: PrismaService,
    private scaleService: ScaleService,
  ) {}

  private todayStr() {
    return new Date().toISOString().slice(0, 10);
  }

  async nextProcessNumber(): Promise<number> {
    const counter = await this.prisma.processCounter.upsert({
      where: { id: 1 },
      create: { id: 1, value: 1 },
      update: { value: { increment: 1 } },
    });
    return counter.value;
  }

  async create(dto: CreateProcessDto, user: User) {
    const today = this.todayStr();
    const { defenderId, codename } = await this.scaleService.getActiveDefenderForDate(today);
    const number = await this.nextProcessNumber();

    const process = await this.prisma.process.create({
      data: {
        number,
        title: dto.title,
        description: dto.description,
        openedById: user.id,
        assignedToId: defenderId,
        ...(dto.deadline && { deadline: new Date(dto.deadline) }),
      },
    });

    return {
      ...process,
      defensor: { codename },
      assignedToId: undefined,
    };
  }

  // Funcionário só vê seus próprios processos, sem identidade do defensor
  async findMyProcesses(user: User) {
    const processes = await this.prisma.process.findMany({
      where: { openedById: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return processes.map((p) => {
      const { assignedToId: _a, ...safe } = p;
      return { ...safe, urgency: calcUrgency(p.deadline) };
    });
  }

  // Defensor vê processos atribuídos a ele
  async findDefenderProcesses(user: User) {
    const processes = await this.prisma.process.findMany({
      where: { assignedToId: user.id },
      include: { openedBy: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return processes.map((p) => ({ ...p, urgency: calcUrgency(p.deadline) }));
  }

  async findOneForFuncionario(id: string, user: User) {
    const p = await this.prisma.process.findUnique({
      where: { id },
      include: {
        messages: {
          include: { sender: { select: { id: true, name: true, role: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!p) throw new NotFoundException();
    if (p.openedById !== user.id) throw new ForbiddenException();

    const scale = await this.prisma.rotationScale.findFirst({
      where: { defenderId: p.assignedToId },
      orderBy: { date: 'desc' },
    });

    const messages = p.messages.map((m) => ({
      id: m.id,
      content: m.content,
      createdAt: m.createdAt,
      fromMe: m.senderId === user.id,
      senderLabel: m.sender.role === 'FUNCIONARIO' ? m.sender.name : 'Defensor',
    }));

    const { assignedToId: _a, messages: _m, ...safeP } = p;
    return {
      ...safeP,
      urgency: calcUrgency(p.deadline),
      defensorLabel: scale?.codename ?? 'Defensor',
      messages,
    };
  }

  async findOneForDefender(id: string, user: User) {
    const p = await this.prisma.process.findUnique({
      where: { id },
      include: {
        openedBy: { select: { id: true, name: true, email: true } },
        messages: {
          include: { sender: { select: { id: true, name: true, role: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!p) throw new NotFoundException();
    if (p.assignedToId !== user.id) throw new ForbiddenException();

    return { ...p, urgency: calcUrgency(p.deadline) };
  }

  async update(id: string, dto: UpdateProcessDto, user: User) {
    const p = await this.prisma.process.findUnique({ where: { id } });
    if (!p) throw new NotFoundException();
    if (p.assignedToId !== user.id) throw new ForbiddenException();

    return this.prisma.process.update({
      where: { id },
      data: {
        ...(dto.status && { status: dto.status }),
        ...(dto.deadline && { deadline: new Date(dto.deadline) }),
        lastActivity: new Date(),
        inactivityAlerted: false,
      },
    });
  }

  async getAlertedProcesses(user: User) {
    return this.prisma.process.findMany({
      where: {
        assignedToId: user.id,
        inactivityAlerted: true,
        status: { not: 'CONCLUIDO' },
      },
      orderBy: { lastActivity: 'asc' },
    });
  }
}
