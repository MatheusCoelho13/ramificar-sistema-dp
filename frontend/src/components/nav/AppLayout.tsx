import { type ReactNode } from 'react';
import { SideNavBar } from './SideNavBar';
import { TopNavBar } from './TopNavBar';

type Theme = 'ramificar' | 'dp';

interface AppLayoutProps {
  children: ReactNode;
  theme: Theme;
  title?: string;
}

export function AppLayout({ children, theme, title }: AppLayoutProps) {
  const themeClass = theme === 'ramificar' ? 'theme-ramificar' : 'theme-dp';
  const surfaceBg = theme === 'ramificar' ? 'bg-[#f4fcef]' : 'bg-[#f1f5f9]';

  return (
    <div className={`${themeClass} min-h-screen ${surfaceBg}`}>
      <SideNavBar />
      <TopNavBar theme={theme} title={title} />
      <main className="ml-60 pt-16 min-h-screen">
        <div className="p-6 max-w-[1200px]">
          {children}
        </div>
      </main>
    </div>
  );
}
