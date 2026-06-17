import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

// Configurável: limiares mensais por quantidade de processos
const THRESHOLDS = { AMARELO: 10, LARANJA: 20, VERMELHO: 30 };

function calcAlertLevel(total: number): string {
  if (total >= THRESHOLDS.VERMELHO) return 'VERMELHO';
  if (total >= THRESHOLDS.LARANJA) return 'LARANJA';
  if (total >= THRESHOLDS.AMARELO) return 'AMARELO';
  return 'VERDE';
}

@Injectable()
export class WorkloadService {
  constructor(private prisma: PrismaService) {}

  async generateReport(year: number, month: number) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const defenders = await this.prisma.user.findMany({
      where: { role: { in: ['DEFENSOR', ] } },
    });

    const reports = [];
    for (const defender of defenders) {
      const total = await this.prisma.process.count({
        where: { assignedToId: defender.id, createdAt: { gte: start, lt: end } },
      });
      const concluded = await this.prisma.process.count({
        where: {
          assignedToId: defender.id,
          status: 'CONCLUIDO',
          createdAt: { gte: start, lt: end },
        },
      });
      const alertLevel = calcAlertLevel(total);

      const report = await this.prisma.workloadReport.upsert({
        where: { defenderId_year_month: { defenderId: defender.id, year, month } },
        create: { defenderId: defender.id, year, month, total, concluded, alertLevel },
        update: { total, concluded, alertLevel, generatedAt: new Date() },
        include: { defender: { select: { id: true, name: true } } },
      });
      reports.push(report);
    }
    return reports;
  }

  async getReports(year: number, month: number) {
    return this.prisma.workloadReport.findMany({
      where: { year, month },
      include: { defender: { select: { id: true, name: true } } },
      orderBy: { total: 'desc' },
    });
  }

  // Auto-generate on last day of month at 23:00
  @Cron('0 23 28-31 * *')
  async autoGenerateMonthlyReport() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (tomorrow.getDate() === 1) {
      await this.generateReport(now.getFullYear(), now.getMonth() + 1);
    }
  }

  // Daily inactivity check at 08:00
  @Cron('0 8 * * *')
  async checkInactiveProcesses() {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - 1);

    await this.prisma.process.updateMany({
      where: {
        status: { not: 'CONCLUIDO' },
        lastActivity: { lt: threshold },
        inactivityAlerted: false,
      },
      data: { inactivityAlerted: true },
    });
  }
}
