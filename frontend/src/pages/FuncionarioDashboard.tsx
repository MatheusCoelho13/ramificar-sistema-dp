import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { AppLayout } from '../components/nav/AppLayout';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { UrgencyPill } from '../components/ui/UrgencyPill';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { SkeletonCard } from '../components/ui/Skeleton';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';

interface Process {
  id: string;
  number: number;
  title: string;
  status: string;
  deadline: string | null;
  urgency: string;
  createdAt: string;
}

const SCORE_ICONS = [
  'sentiment_very_dissatisfied',
  'sentiment_dissatisfied',
  'sentiment_neutral',
  'sentiment_satisfied',
  'sentiment_very_satisfied',
];

export default function FuncionarioDashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [processes, setProcesses] = useState<Process[]>([]);
  const [loadingProc, setLoadingProc] = useState(true);
  const [pulseRegistered, setPulseRegistered] = useState(true);
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState('');
  const [submittingPulse, setSubmittingPulse] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/processes/my'),
      api.get('/pulse/today'),
    ]).then(([procRes, pulseRes]) => {
      setProcesses(procRes.data);
      setPulseRegistered(pulseRes.data.registered);
    }).finally(() => setLoadingProc(false));
  }, []);

  async function submitPulse(e: React.FormEvent) {
    e.preventDefault();
    if (!score) return;
    setSubmittingPulse(true);
    try {
      await api.post('/pulse', { score, comment: comment || undefined });
      setPulseRegistered(true);
      toast('Pulso registrado! Obrigado pelo feedback.', 'success');
    } catch {
      toast('Erro ao registrar pulso.', 'error');
    } finally {
      setSubmittingPulse(false);
    }
  }

  const firstName = user?.name.split(' ')[0] ?? 'Usuário';

  return (
    <AppLayout theme="ramificar">
      {/* Greeting */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Olá, {firstName}</h1>
        <p className="text-slate-500 text-sm mt-1">Bem-vindo ao seu painel. Acompanhe suas solicitações abaixo.</p>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        {/* Pulse card */}
        {!pulseRegistered ? (
          <Card className="col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-icons-outlined text-[20px] text-[#009739]">favorite</span>
              <h2 className="font-semibold text-slate-700">Como foi o trabalho hoje?</h2>
            </div>
            <form onSubmit={submitPulse}>
              <div className="flex gap-2 mb-4">
                {SCORE_ICONS.map((icon, i) => {
                  const val = i + 1;
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setScore(val)}
                      aria-label={`Nível ${val}`}
                      aria-pressed={score === val}
                      className={[
                        'w-12 h-12 rounded-full flex items-center justify-center transition-all border-2',
                        score === val
                          ? 'bg-[#009739] border-[#009739] scale-110 text-white'
                          : 'border-slate-200 hover:border-[#009739] hover:scale-105 text-slate-400 hover:text-[#009739]',
                      ].join(' ')}
                    >
                      <span className="material-icons-outlined text-[28px]">{icon}</span>
                    </button>
                  );
                })}
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Comentário opcional..."
                rows={2}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-[8px] resize-none focus:outline-none focus:ring-2 focus:ring-[#009739] mb-3"
              />
              <Button type="submit" disabled={!score} loading={submittingPulse} size="sm">
                Registrar Pulso
              </Button>
            </form>
          </Card>
        ) : (
          <Card className="col-span-2 flex items-center gap-4">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
              <span className="material-icons-outlined text-[28px] text-[#009739]">check_circle</span>
            </div>
            <div>
              <p className="font-semibold text-slate-700">Pulso registrado hoje!</p>
              <p className="text-sm text-slate-500">Obrigado pelo seu feedback. Até amanhã.</p>
            </div>
          </Card>
        )}

        {/* New solicitation */}
        <Card className="flex flex-col items-center justify-center text-center gap-3 border-2 border-dashed border-[#009739]/30 bg-green-50/50 hover:bg-green-50 transition-colors cursor-pointer"
          onClick={() => navigate('/processos/novo')}
        >
          <div className="w-12 h-12 bg-[#009739] rounded-full flex items-center justify-center">
            <span className="material-icons-outlined text-white text-[24px]">add</span>
          </div>
          <div>
            <p className="font-semibold text-[#009739]">Abrir Nova Solicitação</p>
            <p className="text-xs text-slate-500 mt-0.5">Sua demanda será roteada automaticamente</p>
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

      {loadingProc ? (
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
