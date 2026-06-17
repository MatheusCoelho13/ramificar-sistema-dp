import { ConflictException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PulseDto } from './dto/pulse.dto';

// Regra dos 5: mínimo de respostas no mesmo nível para exibir comentários
const MIN_RESPONSES_FOR_COMMENT = 5;

@Injectable()
export class PulseService {
  constructor(private prisma: PrismaService) {}

  private todayStr() {
    return new Date().toISOString().slice(0, 10);
  }

  async register(dto: PulseDto, user: User) {
    const today = this.todayStr();
    const existing = await this.prisma.pulseEntry.findUnique({
      where: { userId_date: { userId: user.id, date: today } },
    });
    if (existing) throw new ConflictException('Pulso já registrado hoje');

    await this.prisma.pulseEntry.create({
      data: { userId: user.id, date: today, score: dto.score, comment: dto.comment },
    });
    return { message: 'Pulso registrado com sucesso' };
  }

  async hasRegisteredToday(user: User) {
    const today = this.todayStr();
    const entry = await this.prisma.pulseEntry.findUnique({
      where: { userId_date: { userId: user.id, date: today } },
    });
    return { registered: !!entry };
  }

  async getDashboard(date?: string) {
    const target = date ?? this.todayStr();
    const entries = await this.prisma.pulseEntry.findMany({ where: { date: target } });

    if (!entries.length) {
      return { date: target, total: 0, average: null, distribution: {}, comments: [], trend: [] };
    }

    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    entries.forEach((e) => distribution[e.score]++);

    const average = entries.reduce((s, e) => s + e.score, 0) / entries.length;

    // Regra dos 5: só exibe comentários se ≥5 respostas no mesmo nível
    const comments: Array<{ score: number; comment: string }> = [];
    for (let score = 1; score <= 5; score++) {
      if (distribution[score] >= MIN_RESPONSES_FOR_COMMENT) {
        entries
          .filter((e) => e.score === score && e.comment)
          .forEach((e) => comments.push({ score: e.score, comment: e.comment! }));
      }
    }

    // Tendência dos últimos 7 dias
    const trend = await this.getWeeklyTrend();

    return {
      date: target,
      total: entries.length,
      average: Math.round(average * 100) / 100,
      distribution: Object.fromEntries(
        Object.entries(distribution).map(([k, v]) => [
          k,
          { count: v, pct: Math.round((v / entries.length) * 100) },
        ]),
      ),
      comments,
      trend,
    };
  }

  private async getWeeklyTrend() {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().slice(0, 10));
    }

    return Promise.all(
      days.map(async (day) => {
        const entries = await this.prisma.pulseEntry.findMany({ where: { date: day } });
        const avg = entries.length
          ? entries.reduce((s, e) => s + e.score, 0) / entries.length
          : null;
        return { date: day, average: avg ? Math.round(avg * 100) / 100 : null, total: entries.length };
      }),
    );
  }
}
