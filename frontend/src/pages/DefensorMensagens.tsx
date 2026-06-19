import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { AppLayout } from '../components/nav/AppLayout';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { UrgencyPill } from '../components/ui/UrgencyPill';
import { Avatar } from '../components/ui/Avatar';
import { EmptyState } from '../components/ui/EmptyState';
import { SkeletonCard } from '../components/ui/Skeleton';

interface Process {
  id: string;
  number: number;
  title: string;
  status: string;
  urgency: string;
  deadline: string | null;
  openedBy: { name: string; email: string };
}

interface ProcessRowProps {
  p: Process;
  onClick: () => void;
}

function ProcessRow({ p, onClick }: ProcessRowProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0"
    >
      <Avatar name={p.openedBy.name} size="sm" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <span className="text-xs font-mono text-slate-400">#{p.number}</span>
          <Badge status={p.status} />
          <UrgencyPill urgency={p.urgency} />
        </div>
        <p className="text-sm font-medium text-slate-800 truncate">{p.title}</p>
        <p className="text-xs text-slate-400 mt-0.5">{p.openedBy.name}</p>
      </div>

      <span className="material-icons-outlined text-[18px] text-slate-300 flex-shrink-0">
        chevron_right
      </span>
    </button>
  );
}

export default function DefensorMensagens() {
  const navigate = useNavigate();
  const [processes, setProcesses] = useState<Process[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/processes/assigned').then((r) => setProcesses(r.data)).finally(() => setLoading(false));
  }, []);

  const active = processes.filter((p) => p.status !== 'CONCLUIDO');
  const concluded = processes.filter((p) => p.status === 'CONCLUIDO');

  return (
    <AppLayout theme="dp">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-800">Mensagens</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Clique em uma solicitação para abrir a conversa com o funcionário.
        </p>
      </div>

      {loading ? (
        <SkeletonCard count={4} />
      ) : processes.length === 0 ? (
        <EmptyState
          icon="chat_bubble_outline"
          title="Nenhuma conversa ainda"
          subtitle="Nenhum processo foi atribuído a você ainda."
        />
      ) : (
        <>
          {active.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
                Ativas ({active.length})
              </h2>
              <Card padding="none">
                {active.map((p) => (
                  <ProcessRow
                    key={p.id}
                    p={p}
                    onClick={() => navigate(`/defensor/processos/${p.id}`)}
                  />
                ))}
              </Card>
            </div>
          )}

          {concluded.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
                Concluídas ({concluded.length})
              </h2>
              <Card padding="none" className="opacity-60">
                {concluded.map((p) => (
                  <ProcessRow
                    key={p.id}
                    p={p}
                    onClick={() => navigate(`/defensor/processos/${p.id}`)}
                  />
                ))}
              </Card>
            </div>
          )}
        </>
      )}
    </AppLayout>
  );
}
