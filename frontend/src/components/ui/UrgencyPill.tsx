type UrgencyValue = 'VERDE' | 'AMARELO' | 'VERMELHO' | 'SEM_PRAZO';

const urgencyConfig: Record<UrgencyValue, { label: string; className: string }> = {
  VERDE: { label: 'No prazo', className: 'bg-green-100 text-green-700' },
  AMARELO: { label: 'Atenção', className: 'bg-amber-100 text-amber-700' },
  VERMELHO: { label: 'Urgente', className: 'bg-red-100 text-red-700' },
  SEM_PRAZO: { label: 'Sem prazo', className: 'bg-slate-100 text-slate-500' },
};

export function UrgencyPill({ urgency }: { urgency: string }) {
  const config = urgencyConfig[urgency as UrgencyValue] ?? urgencyConfig.SEM_PRAZO;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}
