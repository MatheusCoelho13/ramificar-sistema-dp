import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Avatar } from '../ui/Avatar';

type Theme = 'ramificar' | 'dp';

interface TopNavBarProps {
  theme: Theme;
  title?: string;
}

const roleLabels: Record<string, string> = {
  FUNCIONARIO: 'Funcionário',
  DEFENSOR: 'Defensor',
};

export function TopNavBar({ theme, title }: TopNavBarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const logoText = theme === 'ramificar' ? 'Ramificar' : 'Defensoria Pública';
  const logoFont = theme === 'ramificar' ? "'Sora', sans-serif" : "'Inter', sans-serif";
  const logoBg = theme === 'ramificar' ? '#009739' : '#0b5345';

  return (
    <header className="fixed top-0 left-60 right-0 h-16 bg-white border-b border-slate-200 flex items-center px-6 z-20">
      <div className="flex-1">
        {title ? (
          <h1 className="text-base font-semibold text-slate-700">{title}</h1>
        ) : (
          <span
            className="font-bold text-base"
            style={{ fontFamily: logoFont, color: logoBg }}
          >
            {logoText}
          </span>
        )}
      </div>

      <div className="relative">
        <button
          onClick={() => setDropdownOpen((v) => !v)}
          className="flex items-center gap-2 rounded-[8px] px-2 py-1.5 hover:bg-slate-50 transition-colors"
          aria-expanded={dropdownOpen}
          aria-haspopup="menu"
        >
          {user && <Avatar name={user.name} size="sm" />}
          <span className="text-sm text-slate-600 max-w-[120px] truncate">{user?.name}</span>
          <span className="material-icons-outlined text-[16px] text-slate-400">expand_more</span>
        </button>

        {dropdownOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setDropdownOpen(false)}
              aria-hidden
            />
            <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-[8px] shadow-lg border border-slate-100 z-20 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-medium text-slate-800">{user?.name}</p>
                <p className="text-xs text-slate-500">{user ? roleLabels[user.role] : ''}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <span className="material-icons-outlined text-[16px]">logout</span>
                Sair
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
