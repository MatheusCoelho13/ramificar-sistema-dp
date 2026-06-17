import { type ReactNode, type HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingMap = { none: '', sm: 'p-3', md: 'p-4', lg: 'p-6' };

export function Card({ children, className = '', padding = 'md', ...rest }: CardProps) {
  return (
    <div
      className={[
        'bg-white rounded-[var(--radius,8px)] shadow-sm border border-slate-100',
        paddingMap[padding],
        className,
      ].join(' ')}
      {...rest}
    >
      {children}
    </div>
  );
}
