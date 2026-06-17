import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { AppLayout } from '../components/nav/AppLayout';
import { UrgencyPill } from '../components/ui/UrgencyPill';
import { Button } from '../components/ui/Button';
import { SkeletonCard } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';

interface Process {
  id: string;
  number: number;
  title: string;
  status: 'NOVO' | 'EM_ANDAMENTO' | 'CONCLUIDO';
  deadline: string | null;
  urgency: string;
  inactivityAlerted: boolean;
}

type FilterUrgency = 'ALL' | 'VERDE' | 'AMARELO' | 'VERMELHO';

const columns: { key: Process['status']; label: string; icon: string; bg: string; header: string }[] = [
  { key: 'NOVO', label: 'Novo', icon: 'fiber_new', bg: 'bg-slate-50', header: 'bg-slate-100 text-slate-600' },
  { key: 'EM_ANDAMENTO', label: 'Em Andamento', icon: 'hourglass_empty', bg: 'bg-amber-50/50', header: 'bg-amber-100 text-amber-700' },
  { key: 'CONCLUIDO', label: 'Concluído', icon: 'task_alt', bg: 'bg-green-50/50', header: 'bg-green-100 text-green-700' },
];

const nextStatus: Partial<Record<string, Process['status']>> = {
  NOVO: 'EM_ANDAMENTO',
  EM_ANDAMENTO: 'CONCLUIDO',
};

const urgencyBorder: Record<string, string> = {
  VERDE: 'border-l-green-400',
  AMARELO: 'border-l-amber-400',
  VERMELHO: 'border-l-red-400',
  SEM_PRAZO: 'border-l-slate-300',
};

export default function Kanban() {
  const navigate = useNavigate();
  const didDrag = useRef(false);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterUrgency, setFilterUrgency] = useState<FilterUrgency>('ALL');
  const [filterAlert, setFilterAlert] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<Process['status'] | null>(null);

  useEffect(() => {
    api.get('/processes/assigned')
      .then((r) => setProcesses(r.data))
      .finally(() => setLoading(false));
  }, []);

  async function moveProcess(id: string, status: Process['status']) {
    await api.patch(`/processes/${id}`, { status });
    setProcesses((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
  }

  function handleDragStart(e: React.DragEvent, id: string) {
    didDrag.current = true;
    setDraggingId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('processId', id);
  }

  function handleDragOver(e: React.DragEvent, col: Process['status']) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCol(col);
  }

  function handleDrop(e: React.DragEvent, col: Process['status']) {
    e.preventDefault();
    const id = e.dataTransfer.getData('processId');
    const proc = processes.find((p) => p.id === id);
    if (proc && proc.status !== col) moveProcess(id, col);
    setDraggingId(null);
    setDragOverCol(null);
  }

  function handleDragEnd() {
    setDraggingId(null);
    setDragOverCol(null);
    setTimeout(() => { didDrag.current = false; }, 50);
  }

  const filtered = processes.filter((p) => {
    if (filterUrgency !== 'ALL' && p.urgency !== filterUrgency) return false;
    if (filterAlert && !p.inactivityAlerted) return false;
    return true;
  });

  const alerts = processes.filter((p) => p.inactivityAlerted && p.status !== 'CONCLUIDO').length;

  return (
    <AppLayout theme="dp">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Kanban de Atividades</h1>
          <p className="text-sm text-slate-500 mt-0.5">{processes.length} processos no total</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <span className="text-xs text-slate-500 font-medium">Filtrar por urgência:</span>
        {(['ALL', 'VERDE', 'AMARELO', 'VERMELHO'] as FilterUrgency[]).map((u) => (
          <button
            key={u}
            onClick={() => setFilterUrgency(u)}
            className={[
              'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
              filterUrgency === u
                ? 'bg-[#0b5345] text-white border-[#0b5345]'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300',
            ].join(' ')}
          >
            {u === 'ALL' ? 'Todos' : u}
          </button>
        ))}
        {alerts > 0 && (
          <button
            onClick={() => setFilterAlert((v) => !v)}
            className={[
              'px-3 py-1 rounded-full text-xs font-medium border transition-colors flex items-center gap-1',
              filterAlert
                ? 'bg-amber-500 text-white border-amber-500'
                : 'bg-white text-amber-700 border-amber-200 hover:border-amber-300',
            ].join(' ')}
          >
            <span className="material-icons-outlined text-[12px]">warning</span>
            Alertas ({alerts})
          </button>
        )}
      </div>

      {loading ? (
        <SkeletonCard count={4} />
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {columns.map((col) => {
            const colItems = filtered.filter((p) => p.status === col.key);
            return (
              <div
                key={col.key}
                className={[
                  col.bg,
                  'rounded-[8px] overflow-hidden border transition-all',
                  dragOverCol === col.key ? 'border-[#0b5345] ring-2 ring-[#0b5345]/30' : 'border-slate-200',
                ].join(' ')}
                onDragOver={(e) => handleDragOver(e, col.key)}
                onDragLeave={() => setDragOverCol(null)}
                onDrop={(e) => handleDrop(e, col.key)}
              >
                {/* Column header */}
                <div className={`${col.header} px-4 py-3 flex items-center gap-2`}>
                  <span className="material-icons-outlined text-[18px]">{col.icon}</span>
                  <span className="text-sm font-semibold">{col.label}</span>
                  <span className="ml-auto bg-white/60 text-current text-xs font-bold px-2 py-0.5 rounded-full">
                    {colItems.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="p-2 space-y-2 min-h-[200px]">
                  {colItems.length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-8">Nenhum processo</p>
                  )}
                  {colItems.map((p) => (
                    <div
                      key={p.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, p.id)}
                      onDragEnd={handleDragEnd}
                      onClick={() => { if (!didDrag.current) navigate(`/defensor/processos/${p.id}`); }}
                      className={[
                        'bg-white rounded-[8px] p-3 border-l-4 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing hover:ring-1 hover:ring-[#0b5345]/20',
                        urgencyBorder[p.urgency] ?? 'border-l-slate-300',
                        draggingId === p.id ? 'opacity-40 scale-95' : '',
                      ].join(' ')}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-mono text-slate-400">#{p.number}</span>
                        {p.inactivityAlerted && (
                          <span className="material-icons-outlined text-[14px] text-amber-500" title="Inativo há mais de 1 dia">
                            warning
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-slate-700 mb-2 line-clamp-2">{p.title}</p>
                      <div className="flex items-center justify-between mb-2">
                        <UrgencyPill urgency={p.urgency} />
                        {p.deadline && (
                          <span className="text-xs text-slate-400">
                            {new Date(p.deadline).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </div>
                      {nextStatus[p.status] && (
                        <div className="flex justify-end mt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs py-0.5 px-2"
                            onClick={(e) => { e.stopPropagation(); moveProcess(p.id, nextStatus[p.status]!); }}
                          >
                            Mover → {nextStatus[p.status]?.replace('_', ' ')}
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && filtered.length === 0 && processes.length > 0 && (
        <EmptyState icon="filter_list" title="Nenhum processo com estes filtros" subtitle="Ajuste os filtros para ver mais processos." />
      )}
    </AppLayout>
  );
}
