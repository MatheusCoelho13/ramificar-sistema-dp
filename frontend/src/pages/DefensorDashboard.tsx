import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { AppLayout } from '../components/nav/AppLayout';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { UrgencyPill } from '../components/ui/UrgencyPill';
import { EmptyState } from '../components/ui/EmptyState';
import { SkeletonCard } from '../components/ui/Skeleton';

interface AlertProcess {
  id: string;
  number: number;
  title: string;
  lastActivity: string;
  status: string;
}

interface Process {
  id: string;
  number: number;
  title: string;
  status: string;
  deadline: string | null;
  urgency: string;
  openedBy: { name: string };
}

interface KpiCard {
  label: string;
  value: number;
  icon: string;
  color: string;
  borderColor: string;
}

export default function DefensorDashboard() {
  const [alerts, setAlerts] = useState<AlertProcess[]>([]);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/processes/alerts'),
      api.get('/processes/assigned'),
    ]).then(([alertsRes, procRes]) => {
      setAlerts(alertsRes.data);
      setProcesses(procRes.data);
    }).finally(() => setLoading(false));
  }, []);

  const total = processes.length;
  const novos = processes.filter((p) => p.status === 'NOVO').length;
  const emAndamento = processes.filter((p) => p.status === 'EM_ANDAMENTO').length;
  const concluidos = processes.filter((p) => p.status === 'CONCLUIDO').length;

  const kpis: KpiCard[] = [
    { label: 'Total', value: total, icon: 'folder', color: 'text-slate-600', borderColor: 'border-slate-400' },
    { label: 'Novos', value: novos, icon: 'fiber_new', color: 'text-blue-600', borderColor: 'border-blue-400' },
    { label: 'Em Andamento', value: emAndamento, icon: 'hourglass_empty', color: 'text-amber-600', borderColor: 'border-amber-400' },
    { label: 'Concluídos', value: concluidos, icon: 'task_alt', color: 'text-green-600', borderColor: 'border-green-400' },
  ];

  const activeProcesses = processes.filter((p) => p.status !== 'CONCLUIDO');

  return (
    <AppLayout theme="dp">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-800">Painel do Defensor</h1>
        <p className="text-slate-500 text-sm mt-0.5">Visão consolidada dos seus processos.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {kpis.map((k) => (
          <Card key={k.label} className={`border-l-4 ${k.borderColor}`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`material-icons-outlined text-[22px] ${k.color}`}>{k.icon}</span>
            </div>
            <p className={`text-3xl font-bold ${k.color} mb-1`}>{k.value}</p>
            <p className="text-xs text-slate-500">{k.label}</p>
          </Card>
        ))}
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Card className="mb-6 border border-amber-200 bg-amber-50">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-icons-outlined text-[20px] text-amber-600">warning</span>
            <h2 className="text-sm font-semibold text-amber-800">
              {alerts.length} processo{alerts.length > 1 ? 's' : ''} sem interação há mais de 1 dia
            </h2>
          </div>
          <div className="space-y-2">
            {alerts.map((a) => (
              <div key={a.id} className="flex items-center justify-between bg-white rounded-[8px] px-3 py-2 border border-amber-100">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-slate-400">#{a.number}</span>
                  <span className="text-sm font-medium text-slate-700">{a.title}</span>
                  <Badge status={a.status} />
                </div>
                <Link
                  to={`/defensor/processos/${a.id}`}
                  className="text-xs text-amber-700 font-medium hover:underline"
                >
                  Atender →
                </Link>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { to: '/defensor/kanban', icon: 'view_kanban', label: 'Abrir Kanban', sub: 'Gerencie processos por coluna' },
          { to: '/defensor/relatorio', icon: 'bar_chart', label: 'Relatório de Carga', sub: 'Distribuição mensal por defensor' },
          { to: '/defensor/pulso', icon: 'favorite', label: 'Pulso do Dia', sub: 'Bem-estar da equipe hoje' },
        ].map((a) => (
          <Link key={a.to} to={a.to}>
            <Card className="flex items-center gap-3 hover:bg-[#e6f0ee] transition-colors cursor-pointer">
              <div className="w-10 h-10 bg-[var(--primary-light,#e6f0ee)] rounded-[8px] flex items-center justify-center">
                <span className="material-icons-outlined text-[20px] text-[#0b5345]">{a.icon}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">{a.label}</p>
                <p className="text-xs text-slate-400">{a.sub}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Active processes */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-slate-700">Processos Ativos</h2>
        <Link to="/defensor/kanban" className="text-sm text-[#0b5345] font-medium hover:underline">
          Ver no Kanban →
        </Link>
      </div>

      {loading ? (
        <SkeletonCard count={3} />
      ) : activeProcesses.length === 0 ? (
        <EmptyState icon="task_alt" title="Nenhum processo ativo" subtitle="Todos os processos foram concluídos." />
      ) : (
        <Card padding="none">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Nº</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Título</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Solicitante</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Prazo</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Urgência</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {activeProcesses.map((p) => (
                <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-xs font-mono text-slate-500">#{p.number}</td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-800 max-w-xs truncate">{p.title}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{p.openedBy?.name ?? '—'}</td>
                  <td className="px-4 py-3"><Badge status={p.status} /></td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {p.deadline ? new Date(p.deadline).toLocaleDateString('pt-BR') : '—'}
                  </td>
                  <td className="px-4 py-3"><UrgencyPill urgency={p.urgency} /></td>
                  <td className="px-4 py-3 text-right">
                    <Link to={`/defensor/processos/${p.id}`} className="text-sm text-[#0b5345] font-medium hover:underline">
                      Abrir →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </AppLayout>
  );
}
