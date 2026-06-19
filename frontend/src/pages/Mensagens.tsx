import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { AppLayout } from '../components/nav/AppLayout';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { SkeletonCard } from '../components/ui/Skeleton';

interface Process {
  id: string;
  number: number;
  title: string;
  status: string;
  deadline: string | null;
  createdAt: string;
}

export default function Mensagens() {
  const navigate = useNavigate();
  const [processes, setProcesses] = useState<Process[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/processes/my').then((r) => setProcesses(r.data)).finally(() => setLoading(false));
  }, []);

  return (
    <AppLayout theme="ramificar">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-800">Mensagens</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Clique em uma solicitação para abrir a conversa com o defensor responsável.
        </p>
      </div>

      {loading ? (
        <SkeletonCard count={4} />
      ) : processes.length === 0 ? (
        <EmptyState
          icon="chat_bubble_outline"
          title="Nenhuma conversa ainda"
          subtitle="Abra uma solicitação para iniciar uma conversa com o defensor."
          action={{ label: 'Nova Solicitação', onClick: () => navigate('/processos/novo') }}
        />
      ) : (
        <Card padding="none">
          {processes.map((p, i) => (
            <button
              key={p.id}
              onClick={() => navigate(`/processos/${p.id}`)}
              className={[
                'w-full text-left flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors',
                i < processes.length - 1 ? 'border-b border-slate-100' : '',
              ].join(' ')}
            >
              <div className="w-10 h-10 rounded-full bg-[#009739]/10 flex items-center justify-center flex-shrink-0">
                <span className="material-icons-outlined text-[20px] text-[#009739]">forum</span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-mono text-slate-400">#{p.number}</span>
                  <Badge status={p.status} />
                </div>
                <p className="text-sm font-medium text-slate-800 truncate">{p.title}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {p.deadline
                    ? `Prazo: ${new Date(p.deadline).toLocaleDateString('pt-BR')}`
                    : 'Sem prazo definido'}
                </p>
              </div>

              <span className="material-icons-outlined text-[18px] text-slate-300 flex-shrink-0">
                chevron_right
              </span>
            </button>
          ))}
        </Card>
      )}
    </AppLayout>
  );
}
