type StatusBadgeValue = 'NOVO' | 'EM_ANDAMENTO' | 'CONCLUIDO';

const statusConfig: Record<StatusBadgeValue, { label: string; className: string }> = {
  NOVO: { label: 'Novo', className: 'bg-blue-100 text-blue-700' },
  EM_ANDAMENTO: { label: 'Em andamento', className: 'bg-amber-100 text-amber-700' },
  CONCLUIDO: { label: 'Concluído', className: 'bg-green-100 text-green-700' },
};

export function Badge({ status }: { status: string }) {
  const config = statusConfig[status as StatusBadgeValue] ?? {
    label: status,
    className: 'bg-slate-100 text-slate-600',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}
