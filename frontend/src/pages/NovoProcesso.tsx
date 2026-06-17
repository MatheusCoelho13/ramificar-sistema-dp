import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { AppLayout } from '../components/nav/AppLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Breadcrumb } from '../components/nav/Breadcrumb';
import { useToast } from '../contexts/ToastContext';

export default function NovoProcesso() {
  const navigate = useNavigate();
  const toast = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/processes', {
        title,
        description,
        ...(deadline && { deadline }),
      });
      toast('Solicitação aberta com sucesso!', 'success');
      navigate(`/processos/${data.id}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      toast(msg ?? 'Erro ao abrir solicitação.', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout theme="ramificar">
      <Breadcrumb items={[{ label: 'Painel', to: '/dashboard' }, { label: 'Nova Solicitação' }]} />

      <div className="max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Nova Solicitação</h1>
          <p className="text-slate-500 text-sm mt-1">
            Sua solicitação será encaminhada automaticamente ao defensor responsável. Você não escolhe o destinatário.
          </p>
        </div>

        <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-[8px] px-4 py-3 mb-6">
          <span className="material-icons-outlined text-[18px] text-blue-500 mt-0.5">info</span>
          <p className="text-sm text-blue-700">
            O sistema garante anonimato bidirecional — o defensor não saberá que é você, e você não saberá quem está atendendo.
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1.5">
                Título da solicitação <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                minLength={3}
                placeholder="Descreva brevemente o assunto..."
                className="w-full px-4 py-2.5 border border-slate-300 rounded-[8px] text-sm focus:outline-none focus:ring-2 focus:ring-[#009739] focus:border-transparent"
              />
            </div>

            <div className="mb-5">
              <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1.5">
                Descrição detalhada <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                minLength={10}
                rows={6}
                placeholder="Forneça todos os detalhes relevantes sobre a sua solicitação..."
                className="w-full px-4 py-2.5 border border-slate-300 rounded-[8px] text-sm focus:outline-none focus:ring-2 focus:ring-[#009739] focus:border-transparent resize-none"
              />
              <p className="text-xs text-slate-400 mt-1">{description.length} caracteres (mínimo: 10)</p>
            </div>

            <div className="mb-6">
              <label htmlFor="deadline" className="block text-sm font-medium text-slate-700 mb-1.5">
                Prazo <span className="text-slate-400 font-normal">(opcional)</span>
              </label>
              <input
                id="deadline"
                type="date"
                value={deadline}
                min={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-[8px] text-sm focus:outline-none focus:ring-2 focus:ring-[#009739] focus:border-transparent"
              />
              <p className="text-xs text-slate-400 mt-1">A urgência é calculada automaticamente com base no prazo.</p>
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="secondary" onClick={() => navigate('/dashboard')}>
                Cancelar
              </Button>
              <Button type="submit" loading={loading}>
                <span className="material-icons-outlined text-[16px]">send</span>
                Enviar Solicitação
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AppLayout>
  );
}
