import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SetScaleDto } from './dto/set-scale.dto';

const CODENAMES = [
  'Alfa', 'Beta', 'Gama', 'Delta', 'Épsilon',
  'Zeta', 'Eta', 'Teta', 'Iota', 'Kappa',
];

@Injectable()
export class ScaleService {
  constructor(private prisma: PrismaService) {}

  async getActiveDefenderForDate(date: string): Promise<{ defenderId: string; codename: string }> {
    const entry = await this.prisma.rotationScale.findUnique({ where: { date } });
    if (entry) return { defenderId: entry.defenderId, codename: entry.codename };

    // Auto-generate round-robin if not set
    const defenders = await this.prisma.user.findMany({
      where: { role: { in: ['DEFENSOR', ] }, active: true },
      orderBy: { createdAt: 'asc' },
    });
    if (!defenders.length) throw new NotFoundException('Nenhum defensor ativo cadastrado');

    // Count total scale entries to determine rotation index
    const count = await this.prisma.rotationScale.count();
    const idx = count % defenders.length;
    const defender = defenders[idx];
    const codename = CODENAMES[idx % CODENAMES.length];

    await this.prisma.rotationScale.create({
      data: { date, defenderId: defender.id, codename },
    });

    return { defenderId: defender.id, codename };
  }

  async setScale(dto: SetScaleDto) {
    return this.prisma.rotationScale.upsert({
      where: { date: dto.date },
      create: { date: dto.date, defenderId: dto.defenderId, codename: dto.codename },
      update: { defenderId: dto.defenderId, codename: dto.codename },
    });
  }

  async getScale(from: string, to: string) {
    const entries = await this.prisma.rotationScale.findMany({
      where: { date: { gte: from, lte: to } },
      include: { defender: { select: { id: true, name: true, email: true } } },
      orderBy: { date: 'asc' },
    });
    return entries;
  }

  async generateMonthScale(year: number, month: number) {
    const defenders = await this.prisma.user.findMany({
      where: { role: { in: ['DEFENSOR', ] }, active: true },
      orderBy: { createdAt: 'asc' },
    });
    if (!defenders.length) throw new NotFoundException('Nenhum defensor ativo');

    const daysInMonth = new Date(year, month, 0).getDate();
    const entries = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const idx = (day - 1) % defenders.length;
      const defender = defenders[idx];
      const codename = CODENAMES[idx % CODENAMES.length];

      await this.prisma.rotationScale.upsert({
        where: { date },
        create: { date, defenderId: defender.id, codename },
        update: { defenderId: defender.id, codename },
      });
      entries.push({ date, defender: defender.name, codename });
    }
    return entries;
  }
}
