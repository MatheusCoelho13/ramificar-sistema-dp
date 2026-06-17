import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate(user.role === 'FUNCIONARIO' ? '/dashboard' : '/defensor', { replace: true });
    }
  }, [user, navigate]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch {
      setError('E-mail ou senha inválidos. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="theme-ramificar min-h-screen flex" style={{ fontFamily: "'Sora', sans-serif" }}>
      {/* Left branding panel */}
      <div className="hidden lg:flex w-[45%] bg-[#009739] flex-col justify-between p-10 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-[-60px] right-[-60px] w-64 h-64 rounded-full bg-white/5" aria-hidden />
        <div className="absolute bottom-[-80px] left-[-40px] w-80 h-80 rounded-full bg-white/5" aria-hidden />
        <div className="absolute top-1/2 right-[-100px] w-96 h-96 rounded-full bg-white/5" aria-hidden />

        <div>
          <span className="font-bold text-2xl text-white">Ramificar</span>
        </div>

        <div className="relative z-10">
          <div className="w-16 h-16 bg-white/20 rounded-[8px] flex items-center justify-center mb-8">
            <span className="material-icons-outlined text-[36px] text-white">balance</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
            Distribuição justa de demandas para a Defensoria Pública
          </h2>
          <p className="text-green-100 text-base leading-relaxed">
            Roteamento automático e anônimo que garante equidade na distribuição de processos entre defensores.
          </p>
        </div>

        <div className="flex gap-6 text-green-100 text-sm">
          <span className="flex items-center gap-1.5">
            <span className="material-icons-outlined text-[16px]">shield</span>
            Anonimato garantido
          </span>
          <span className="flex items-center gap-1.5">
            <span className="material-icons-outlined text-[16px]">sync</span>
            Round-robin automático
          </span>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-md">
          <div className="mb-2">
            <Link to="/" className="text-sm text-slate-400 hover:text-slate-600 flex items-center gap-1">
              <span className="material-icons-outlined text-[16px]">arrow_back</span>
              Voltar
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-800 mb-1">Bem-vindo de volta</h1>
            <p className="text-slate-500 text-sm">Entre com suas credenciais para acessar o sistema.</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                E-mail institucional
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="seu@dp.gov.br"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-[8px] text-sm focus:outline-none focus:ring-2 focus:ring-[#009739] focus:border-transparent transition"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-[8px] text-sm focus:outline-none focus:ring-2 focus:ring-[#009739] focus:border-transparent transition"
              />
            </div>

            {error && (
              <div className="mb-4 flex items-start gap-2 bg-red-50 border border-red-200 rounded-[8px] px-4 py-3">
                <span className="material-icons-outlined text-[18px] text-red-500 mt-0.5" aria-hidden>error_outline</span>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              loading={loading}
              className="w-full py-3 text-base"
            >
              Entrar
            </Button>
          </form>

          <p className="text-xs text-slate-400 text-center mt-8">
            Acesso restrito a servidores da Defensoria Pública.
            <br />Dificuldades? Contate o administrador do sistema.
          </p>
        </div>
      </div>
    </div>
  );
}
