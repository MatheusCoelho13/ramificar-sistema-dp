import { Button } from './Button';

interface EmptyStateProps {
  icon?: string;
  title: string;
  subtitle?: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon = 'inbox', title, subtitle, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="material-icons-outlined text-5xl text-slate-300 mb-4" aria-hidden>
        {icon}
      </span>
      <h3 className="text-base font-semibold text-slate-600 mb-1">{title}</h3>
      {subtitle && <p className="text-sm text-slate-400 max-w-xs">{subtitle}</p>}
      {action && (
        <div className="mt-4">
          <Button onClick={action.onClick}>{action.label}</Button>
        </div>
      )}
    </div>
  );
}
