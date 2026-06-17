import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import FuncionarioDashboard from './pages/FuncionarioDashboard';
import NovoProcesso from './pages/NovoProcesso';
import ProcessoDetalhe from './pages/ProcessoDetalhe';
import DefensorDashboard from './pages/DefensorDashboard';
import DefensorProcesso from './pages/DefensorProcesso';
import Kanban from './pages/Kanban';
import Relatorio from './pages/Relatorio';
import PulsoDashboard from './pages/PulsoDashboard';


function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Landing />;
  return <Navigate to={user.role === 'FUNCIONARIO' ? '/dashboard' : '/defensor'} replace />;
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<Login />} />

            <Route path="/dashboard" element={
              <ProtectedRoute roles={['FUNCIONARIO']}>
                <FuncionarioDashboard />
              </ProtectedRoute>
            } />
            <Route path="/processos/novo" element={
              <ProtectedRoute roles={['FUNCIONARIO']}>
                <NovoProcesso />
              </ProtectedRoute>
            } />
            <Route path="/processos/:id" element={
              <ProtectedRoute roles={['FUNCIONARIO']}>
                <ProcessoDetalhe />
              </ProtectedRoute>
            } />

            <Route path="/defensor" element={
              <ProtectedRoute roles={['DEFENSOR']}>
                <DefensorDashboard />
              </ProtectedRoute>
            } />
            <Route path="/defensor/processos/:id" element={
              <ProtectedRoute roles={['DEFENSOR']}>
                <DefensorProcesso />
              </ProtectedRoute>
            } />
            <Route path="/defensor/kanban" element={
              <ProtectedRoute roles={['DEFENSOR']}>
                <Kanban />
              </ProtectedRoute>
            } />
            <Route path="/defensor/relatorio" element={
                <ProtectedRoute roles={['DEFENSOR']}>
                <Relatorio />
              </ProtectedRoute>
            } />
            <Route path="/defensor/pulso" element={
              <ProtectedRoute roles={['DEFENSOR']}>
                <PulsoDashboard />
              </ProtectedRoute>
            } />

          

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
