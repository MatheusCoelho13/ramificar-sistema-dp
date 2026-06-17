import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const isDefensor = user?.role === 'DEFENSOR';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav style={{ background: '#1a365d', color: 'white', padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <strong style={{ fontSize: '1.1rem', marginRight: '1rem' }}>Ramificar</strong>
        {!isDefensor && (
          <>
            <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none' }}>Painel</Link>
            <Link to="/processos/novo" style={{ color: 'white', textDecoration: 'none' }}>Nova Solicitação</Link>
          </>
        )}
        {isDefensor && (
          <>
            <Link to="/defensor" style={{ color: 'white', textDecoration: 'none' }}>Painel</Link>
            <Link to="/defensor/kanban" style={{ color: 'white', textDecoration: 'none' }}>Kanban</Link>
            <Link to="/defensor/relatorio" style={{ color: 'white', textDecoration: 'none' }}>Relatório</Link>
            <Link to="/defensor/pulso" style={{ color: 'white', textDecoration: 'none' }}>Pulso</Link>
          </>
        )}
        <span style={{ marginLeft: 'auto', fontSize: '0.875rem' }}>{user?.name}</span>
        <button onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '0.25rem 0.75rem', borderRadius: 4, cursor: 'pointer' }}>
          Sair
        </button>
      </nav>
      <main style={{ flex: 1, padding: '1.5rem', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        {children}
      </main>
    </div>
  );
}
