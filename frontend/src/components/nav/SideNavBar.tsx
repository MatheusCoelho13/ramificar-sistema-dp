import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Avatar } from '../ui/Avatar';

interface NavItem {
  to: string;
  label: string;
  icon: string;
}

const funcionarioItems: NavItem[] = [
  { to: '/dashboard', label: 'Painel', icon: 'home' },
  { to: '/processos/novo', label: 'Nova Solicitação', icon: 'add_circle' },
];

const defensorItems: NavItem[] = [
  { to: '/defensor', label: 'Painel', icon: 'dashboard' },
  { to: '/defensor/kanban', label: 'Kanban', icon: 'view_kanban' },
  { to: '/defensor/relatorio', label: 'Relatório de Carga', icon: 'bar_chart' },
  { to: '/defensor/pulso', label: 'Pulso do Dia', icon: 'favorite' },
];

const roleLabels: Record<string, string> = {
  FUNCIONARIO: 'Funcionário',
  DEFENSOR: 'Defensor',
};

export function SideNavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const items: NavItem[] =
    user.role === 'FUNCIONARIO' ? funcionarioItems : defensorItems;

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <aside
      className="fixed left-0 top-0 h-full w-60 bg-slate-900 flex flex-col z-30"
      role="navigation"
      aria-label="Menu principal"
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-slate-700">
        {user.role === 'FUNCIONARIO' ? (
          <span className="font-bold text-lg text-white" style={{ fontFamily: "'Sora', sans-serif" }}>
            Ramificar
          </span>
        ) : (
          <span className="font-semibold text-base text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
            Sistema  Ramificar
          </span>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/defensor' || item.to === '/dashboard'}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 px-3 py-2.5 rounded-[8px] mb-1 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-[var(--primary,#009739)] text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white',
              ].join(' ')
            }
            style={({ isActive }) =>
              isActive ? { '--primary': user.role === 'FUNCIONARIO' ? '#009739' : '#0b5345' } as React.CSSProperties : {}
            }
          >
            <span className="material-icons-outlined text-[20px]" aria-hidden>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-slate-700">
        <div className="flex items-center gap-3 px-2 py-2 mb-1">
          <Avatar name={user.name} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate">{user.name}</p>
            <p className="text-xs text-slate-400">{roleLabels[user.role] ?? user.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-[8px] text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <span className="material-icons-outlined text-[18px]" aria-hidden>logout</span>
          Sair
        </button>
      </div>
    </aside>
  );
}
