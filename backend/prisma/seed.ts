import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import * as bcrypt from 'bcryptjs';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const hash = (pw: string) => bcrypt.hash(pw, 10);

// ─── helpers ──────────────────────────────────────────────────────────────────

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function dateStr(d: Date) {
  return d.toISOString().slice(0, 10);
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── static data ──────────────────────────────────────────────────────────────

const PROCESS_TITLES = [
  'Ação de Alimentos',
  'Habeas Corpus',
  'Defesa em Ação Penal',
  'Revisão de Benefício Previdenciário',
  'Ação de Guarda e Responsabilidade',
  'Interdição Civil',
  'Ação de Despejo',
  'Regularização de Imóvel',
  'Ação de Indenização por Dano Moral',
  'Execução de Alimentos',
  'Acordo Extrajudicial Familiar',
  'Pedido de Alvará Judicial',
  'Ação de Reconhecimento de União Estável',
  'Impugnação de Paternidade',
  'Tutela Provisória de Urgência',
  'Ação de Usucapião',
  'Defesa em Ação de Execução Fiscal',
  'Reclamação Trabalhista',
  'Ação de Reintegração de Posse',
  'Revisão de Contrato Bancário',
  'Ação de Divórcio',
  'Pedido de Pensão por Morte',
  'Ação de Cobrança',
  'Violência Doméstica – Medida Protetiva',
  'Ação de Regulamentação de Visitas',
  'Defesa em Processo Administrativo Disciplinar',
  'Ação Civil Pública Ambiental',
  'Pedido de Benefício LOAS',
  'Mandado de Segurança',
  'Ação de Contestação de Multa',
];

const DESCRIPTIONS = [
  'Assistido necessita de representação urgente em juízo.',
  'Documentação entregue. Aguardando análise inicial.',
  'Caso requer perícia técnica complementar.',
  'Necessário contato com parte contrária para conciliação.',
  'Prazo processual próximo — ação imediata necessária.',
  'Assistido em situação de vulnerabilidade social.',
  'Processo suspenso aguardando decisão de instância superior.',
  'Todas as peças documentais já foram reunidas.',
  'Assistido compareceu pessoalmente para atualização do caso.',
  'Demanda encaminhada de outra defensoria pública.',
];

const MESSAGES_POOL = [
  'Recebi a documentação. Vou analisar e dar um retorno em breve.',
  'Precisamos de mais documentos para prosseguir com a ação.',
  'Agendei audiência para o próximo mês. Confirme sua presença.',
  'A ação foi protocolada. Aguardando despacho judicial.',
  'O processo está em análise. Assim que houver novidade, informarei.',
  'Documentação incompleta. Por favor, traga os documentos originais.',
  'Conciliação marcada. Compareça com identidade e documentos do caso.',
  'Recurso interposto. Aguardando julgamento.',
  'Sentença favorável. Vou explicar os próximos passos.',
  'Precisamos remarcar a audiência. Você tem disponibilidade?',
  'Certidão de nascimento dos filhos é necessária para prosseguir.',
  'A outra parte foi citada. Aguardando resposta.',
  'Processo encaminhado para execução de sentença.',
  'Obtive liminar favorável. O caso está em bom caminho.',
];

const FUNC_REPLIES = [
  'Obrigado pela atenção! Vou providenciar os documentos.',
  'Entendido. Estarei lá no horário combinado.',
  'Muito obrigado pelo retorno.',
  'Ok, já estou separando os documentos.',
  'Ótima notícia! Fico aguardando os próximos passos.',
  'Certo, vou buscar essa documentação essa semana.',
  'Aguardo ansiosamente a decisão.',
];

// ─── main ─────────────────────────────────────────────────────────────────────

async function main() {
  // ── users ────────────────────────────────────────────────────────────────

  const def1 = await prisma.user.upsert({
    where: { email: 'defensor1@dp.gov.br' },
    update: {},
    create: { name: 'Defensor Silva', email: 'defensor1@dp.gov.br', password: await hash('defensor123'), role: 'DEFENSOR' },
  });

  const def2 = await prisma.user.upsert({
    where: { email: 'defensor2@dp.gov.br' },
    update: {},
    create: { name: 'Defensora Souza', email: 'defensor2@dp.gov.br', password: await hash('defensor123'), role: 'DEFENSOR' },
  });

  const def3 = await prisma.user.upsert({
    where: { email: 'defensor3@dp.gov.br' },
    update: {},
    create: { name: 'Defensor Oliveira', email: 'defensor3@dp.gov.br', password: await hash('defensor123'), role: 'DEFENSOR' },
  });

  const func1 = await prisma.user.upsert({
    where: { email: 'func1@dp.gov.br' },
    update: {},
    create: { name: 'Ana Funcionária', email: 'func1@dp.gov.br', password: await hash('func123'), role: 'FUNCIONARIO' },
  });

  const func2 = await prisma.user.upsert({
    where: { email: 'func2@dp.gov.br' },
    update: {},
    create: { name: 'Bruno Estagiário', email: 'func2@dp.gov.br', password: await hash('func123'), role: 'FUNCIONARIO' },
  });

  const funcs = [func1.id, func2.id];

  // ── rotation scale: -60 to +14 days ─────────────────────────────────────

  const defenders = [def1.id, def2.id, def3.id];
  const codenames = ['Alfa', 'Beta', 'Gama'];
  const today = new Date();

  for (let i = -60; i <= 14; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const ds = dateStr(d);
    const idx = ((today.getDay() + i) % defenders.length + defenders.length) % defenders.length;
    await prisma.rotationScale.upsert({
      where: { date: ds },
      update: {},
      create: { date: ds, defenderId: defenders[idx], codename: codenames[idx] },
    });
  }

  // ── processes ────────────────────────────────────────────────────────────
  // Plan (processes/month per defender):
  //   April 2026: Silva=25, Souza=12, Oliveira=8
  //   May 2026:   Silva=15, Souza=30, Oliveira=18
  //   June 2026:  Silva=8,  Souza=10, Oliveira=5
  //
  // concluded rate ~50–70% for old months, ~20–30% for June

  interface MonthPlan {
    year: number;
    month: number; // 1-based
    dayRange: [number, number]; // day 1..N
    plans: Array<{ defenderId: string; count: number; concludedRate: number }>;
  }

  const monthPlans: MonthPlan[] = [
    {
      year: 2026, month: 4, dayRange: [1, 30],
      plans: [
        { defenderId: def1.id, count: 25, concludedRate: 0.64 },
        { defenderId: def2.id, count: 12, concludedRate: 0.58 },
        { defenderId: def3.id, count: 8,  concludedRate: 0.75 },
      ],
    },
    {
      year: 2026, month: 5, dayRange: [1, 31],
      plans: [
        { defenderId: def1.id, count: 15, concludedRate: 0.60 },
        { defenderId: def2.id, count: 30, concludedRate: 0.53 },
        { defenderId: def3.id, count: 18, concludedRate: 0.56 },
      ],
    },
    {
      year: 2026, month: 6, dayRange: [1, 17],
      plans: [
        { defenderId: def1.id, count: 8,  concludedRate: 0.25 },
        { defenderId: def2.id, count: 10, concludedRate: 0.20 },
        { defenderId: def3.id, count: 5,  concludedRate: 0.20 },
      ],
    },
  ];

  let processCounter = 0;
  const createdProcessIds: string[] = [];

  for (const mp of monthPlans) {
    for (const plan of mp.plans) {
      const concludedCount = Math.round(plan.count * plan.concludedRate);
      const inProgressCount = Math.round((plan.count - concludedCount) * 0.6);

      for (let i = 0; i < plan.count; i++) {
        processCounter++;
        const day = randomInt(mp.dayRange[0], mp.dayRange[1]);
        const createdAt = new Date(mp.year, mp.month - 1, day, randomInt(8, 17), randomInt(0, 59));
        const openedById = pick(funcs);

        let status: 'NOVO' | 'EM_ANDAMENTO' | 'CONCLUIDO';
        if (i < concludedCount) status = 'CONCLUIDO';
        else if (i < concludedCount + inProgressCount) status = 'EM_ANDAMENTO';
        else status = 'NOVO';

        // deadline: 30–90 days from createdAt for active, null for some
        const hasDeadline = Math.random() > 0.3;
        const deadlineDays = randomInt(30, 90);
        const deadline = hasDeadline
          ? new Date(createdAt.getTime() + deadlineDays * 86400000)
          : null;

        const lastActivity = status === 'CONCLUIDO'
          ? new Date(createdAt.getTime() + randomInt(5, 25) * 86400000)
          : createdAt;

        // inactivityAlerted for old EM_ANDAMENTO processes
        const inactivityAlerted = status === 'EM_ANDAMENTO' && mp.month < 6 && Math.random() > 0.5;

        const proc = await prisma.process.create({
          data: {
            number: processCounter,
            title: pick(PROCESS_TITLES),
            description: pick(DESCRIPTIONS),
            status,
            deadline,
            lastActivity,
            inactivityAlerted,
            createdAt,
            updatedAt: lastActivity,
            openedById,
            assignedToId: plan.defenderId,
          },
        });

        createdProcessIds.push(proc.id);

        // Add 1–3 messages to ~60% of processes
        if (Math.random() > 0.4) {
          const msgCount = randomInt(1, 3);
          let msgTime = new Date(createdAt.getTime() + randomInt(1, 3) * 86400000);

          for (let m = 0; m < msgCount; m++) {
            // Defender message
            await prisma.message.create({
              data: {
                content: pick(MESSAGES_POOL),
                processId: proc.id,
                senderId: plan.defenderId,
                createdAt: msgTime,
              },
            });
            msgTime = new Date(msgTime.getTime() + randomInt(1, 5) * 86400000);

            // Funcionário reply ~70% chance
            if (Math.random() > 0.3) {
              await prisma.message.create({
                data: {
                  content: pick(FUNC_REPLIES),
                  processId: proc.id,
                  senderId: openedById,
                  createdAt: new Date(msgTime.getTime() + randomInt(1, 8) * 3600000),
                },
              });
              msgTime = new Date(msgTime.getTime() + randomInt(1, 3) * 86400000);
            }
          }
        }
      }
    }
  }

  // ── process counter ──────────────────────────────────────────────────────

  await prisma.processCounter.upsert({
    where: { id: 1 },
    update: { value: processCounter },
    create: { id: 1, value: processCounter },
  });

  // ── workload reports (pre-generated for Apr, May, Jun) ───────────────────

  interface ReportSpec {
    year: number;
    month: number;
    defenderId: string;
    total: number;
    concluded: number;
  }

  const reportSpecs: ReportSpec[] = [
    // April
    { year: 2026, month: 4, defenderId: def1.id, total: 25, concluded: 16 },
    { year: 2026, month: 4, defenderId: def2.id, total: 12, concluded: 7  },
    { year: 2026, month: 4, defenderId: def3.id, total: 8,  concluded: 6  },
    // May
    { year: 2026, month: 5, defenderId: def1.id, total: 15, concluded: 9  },
    { year: 2026, month: 5, defenderId: def2.id, total: 30, concluded: 16 },
    { year: 2026, month: 5, defenderId: def3.id, total: 18, concluded: 10 },
    // June (partial)
    { year: 2026, month: 6, defenderId: def1.id, total: 8,  concluded: 2  },
    { year: 2026, month: 6, defenderId: def2.id, total: 10, concluded: 2  },
    { year: 2026, month: 6, defenderId: def3.id, total: 5,  concluded: 1  },
  ];

  function calcAlertLevel(total: number): string {
    if (total >= 30) return 'VERMELHO';
    if (total >= 20) return 'LARANJA';
    if (total >= 10) return 'AMARELO';
    return 'VERDE';
  }

  for (const r of reportSpecs) {
    await prisma.workloadReport.upsert({
      where: { defenderId_year_month: { defenderId: r.defenderId, year: r.year, month: r.month } },
      update: { total: r.total, concluded: r.concluded, alertLevel: calcAlertLevel(r.total) },
      create: {
        defenderId: r.defenderId,
        year: r.year,
        month: r.month,
        total: r.total,
        concluded: r.concluded,
        alertLevel: calcAlertLevel(r.total),
        generatedAt: new Date(r.year, r.month - 1, 28, 23, 0, 0),
      },
    });
  }

  // ── pulse entries: last 30 days ──────────────────────────────────────────
  // Realistic pattern: starts lower (stress), improves over time

  const pulseUsers = [func1.id, func2.id];

  for (let dayOffset = 30; dayOffset >= 0; dayOffset--) {
    const d = daysAgo(dayOffset);
    const ds = dateStr(d);
    const dow = d.getDay();

    // Skip weekends ~80%
    if ((dow === 0 || dow === 6) && Math.random() > 0.2) continue;

    for (const userId of pulseUsers) {
      // Skip some days (~15% absence)
      if (Math.random() < 0.15) continue;

      // Score trend: early days lower (3–4), recent days better (3–5)
      const trendBonus = dayOffset > 20 ? 0 : dayOffset > 10 ? 0.3 : 0.6;
      const baseScore = 3 + trendBonus + (Math.random() * 1.5 - 0.5);
      const score = Math.min(5, Math.max(1, Math.round(baseScore)));

      // Comment only for extreme scores
      let comment: string | undefined;
      if (score <= 2) {
        comment = pick([
          'Dia muito pesado, muitos processos urgentes.',
          'Estressante, prazo apertado em vários casos.',
          'Volume de trabalho acima do normal.',
        ]);
      } else if (score === 5) {
        comment = pick([
          'Ótimo dia, conseguimos resolver vários casos.',
          'Equipe muito engajada hoje!',
          undefined,
        ] as (string | undefined)[]) ?? undefined;
      }

      await prisma.pulseEntry.upsert({
        where: { userId_date: { userId, date: ds } },
        update: { score, comment: comment ?? null },
        create: { userId, date: ds, score, comment: comment ?? null },
      });
    }
  }

  // ── summary ──────────────────────────────────────────────────────────────

  const totalProcesses = await prisma.process.count();
  const totalMessages = await prisma.message.count();
  const totalPulse = await prisma.pulseEntry.count();

  console.log('\nSeed concluído!');
  console.log(`  ${totalProcesses} processos criados`);
  console.log(`  ${totalMessages} mensagens criadas`);
  console.log(`  ${totalPulse} entradas de pulso criadas`);
  console.log('\nCredenciais:');
  console.log('  defensor1@dp.gov.br / defensor123 (DEFENSOR — Silva)');
  console.log('  defensor2@dp.gov.br / defensor123 (DEFENSOR — Souza)');
  console.log('  defensor3@dp.gov.br / defensor123 (DEFENSOR — Oliveira)');
  console.log('  func1@dp.gov.br     / func123     (FUNCIONARIO)');
  console.log('  func2@dp.gov.br     / func123     (FUNCIONARIO)');
  console.log('\nDados para gráficos:');
  console.log('  WorkloadReport: Abr/Mai/Jun 2026 (consulte em Relatório de Carga)');
  console.log('  PulseEntry: últimos 30 dias (consulte em Pulso do Dia)');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
