type AlertLevel = 'VERDE' | 'AMARELO' | 'LARANJA' | 'VERMELHO';

const alertConfig: Record<AlertLevel, { className: string }> = {
  VERDE: { className: 'bg-green-100 text-green-700' },
  AMARELO: { className: 'bg-amber-100 text-amber-700' },
  LARANJA: { className: 'bg-orange-100 text-orange-700' },
  VERMELHO: { className: 'bg-red-100 text-red-700' },
};

export function AlertPill({ level }: { level: string }) {
  const config = alertConfig[level as AlertLevel] ?? alertConfig.VERDE;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${config.className}`}>
      {level}
    </span>
  );
}
