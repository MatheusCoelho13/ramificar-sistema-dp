import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { AppLayout } from '../components/nav/AppLayout';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { UrgencyPill } from '../components/ui/UrgencyPill';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { SkeletonCard } from '../components/ui/Skeleton';
import { useAuth } from '../contexts/AuthContext';

interface Process {
  id: string;
  number: number;
  title: string;
  status: string;
  deadline: string | null;
  urgency: string;
  createdAt: string;
}

export default function FuncionarioDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [processes, setProcesses] = useState<Process[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/processes/my').then((r) => setProcesses(r.data)).finally(() => setLoading(false));
  }, []);

  const firstName = user?.name.split(' ')[0] ?? 'Usuário';

  return (
    <AppLayout theme="ramificar">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Olá, {firstName}</h1>
        <p className="text-slate-500 text-sm mt-1">Bem-vindo ao seu painel. Acompanhe suas solicitações abaixo.</p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Card
          className="flex items-center gap-3 border-2 border-dashed border-[#009739]/30 bg-green-50/50 hover:bg-green-50 transition-colors cursor-pointer"
          onClick={() => navigate('/processos/novo')}
        >
          <div className="w-10 h-10 bg-[#009739] rounded-full flex items-center justify-center flex-shrink-0">
            <span className="material-icons-outlined text-white text-[20px]">add</span>
          </div>
          <div>
            <p className="font-semibold text-[#009739]">Abrir Nova Solicitação</p>
            <p className="text-xs text-slate-500 mt-0.5">Sua demanda será roteada automaticamente</p>
          </div>
        </Card>

        <Card
          className="flex items-center gap-3 hover:bg-slate-50 transition-colors cursor-pointer"
          onClick={() => navigate('/pulso')}
        >
          <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="material-icons-outlined text-rose-500 text-[20px]">favorite</span>
          </div>
          <div>
            <p className="font-semibold text-slate-700">Pulso do Dia</p>
            <p className="text-xs text-slate-500 mt-0.5">Registre como foi o seu dia</p>
          </div>
        </Card>
      </div>

      {/* Process list */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-800">Minhas Solicitações</h2>
        <Link to="/processos/novo">
          <Button size="sm">
            <span className="material-icons-outlined text-[16px]">add</span>
            Nova Solicitação
          </Button>
        </Link>
      </div>

      {loading ? (
        <SkeletonCard count={3} />
      ) : processes.length === 0 ? (
        <EmptyState
          icon="folder_open"
          title="Nenhuma solicitação ainda"
          subtitle="Abra sua primeira solicitação e ela será encaminhada automaticamente."
          action={{ label: 'Abrir solicitação', onClick: () => navigate('/processos/novo') }}
        />
      ) : (
        <Card padding="none">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Nº</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Título</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Prazo</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Urgência</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {processes.map((p) => (
                <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 text-sm font-mono text-slate-600">#{p.number}</td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-800 max-w-xs">
                    <span className="truncate block">{p.title}</span>
                  </td>
                  <td className="px-4 py-3"><Badge status={p.status} /></td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {p.deadline ? new Date(p.deadline).toLocaleDateString('pt-BR') : '—'}
                  </td>
                  <td className="px-4 py-3"><UrgencyPill urgency={p.urgency} /></td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/processos/${p.id}`}
                      className="text-sm font-medium text-[#009739] hover:underline"
                    >
                      Ver →
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
