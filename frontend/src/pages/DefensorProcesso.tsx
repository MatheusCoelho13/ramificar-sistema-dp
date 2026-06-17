import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/client';
import { AppLayout } from '../components/nav/AppLayout';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { UrgencyPill } from '../components/ui/UrgencyPill';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { Breadcrumb } from '../components/nav/Breadcrumb';
import { Skeleton } from '../components/ui/Skeleton';
import { useToast } from '../contexts/ToastContext';

interface Message {
  id: string;
  content: string;
  createdAt: string;
  sender: { id: string; name: string; role: string };
}

interface ProcessDetail {
  id: string;
  number: number;
  title: string;
  description: string;
  status: string;
  deadline: string | null;
  urgency: string;
  openedBy: { id: string; name: string; email: string };
  messages: Message[];
}

export default function DefensorProcesso() {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();
  const [process, setProcess] = useState<ProcessDetail | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState('');
  const [savingUpdate, setSavingUpdate] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUserId = JSON.parse(localStorage.getItem('user') ?? '{}').id;

  function loadMessages() {
    if (!id) return;
    api.get(`/processes/${id}/messages/defensor`).then((r) => setMessages(r.data));
  }

  useEffect(() => {
    if (!id) return;
    api.get(`/processes/${id}/defensor`).then((r) => {
      setProcess(r.data);
      setMessages(r.data.messages ?? []);
      setDeadline(r.data.deadline ? r.data.deadline.slice(0, 10) : '');
      setStatus(r.data.status);
    }).finally(() => setLoading(false));

    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function updateProcess() {
    if (!id) return;
    setSavingUpdate(true);
    try {
      await api.patch(`/processes/${id}`, { status, deadline: deadline || undefined });
      setProcess((prev) => prev ? { ...prev, status, deadline: deadline || null } : null);
      toast('Processo atualizado com sucesso.', 'success');
    } catch {
      toast('Erro ao atualizar processo.', 'error');
    } finally {
      setSavingUpdate(false);
    }
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || !id) return;
    setSending(true);
    try {
      await api.post(`/processes/${id}/messages`, { content: newMessage });
      setNewMessage('');
      loadMessages();
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <AppLayout theme="dp">
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-80 w-full" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </AppLayout>
    );
  }

  if (!process) return null;

  return (
    <AppLayout theme="dp">
      <Breadcrumb items={[
        { label: 'Painel', to: '/defensor' },
        { label: `Processo #${process.number}` },
      ]} />

      <div className="grid grid-cols-3 gap-6">
        {/* Left: main */}
        <div className="col-span-2 space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-xs font-mono text-slate-400">#{process.number}</span>
                <Badge status={process.status} />
                <UrgencyPill urgency={process.urgency} />
              </div>
              <h1 className="text-xl font-semibold text-slate-800">{process.title}</h1>
            </div>
          </div>

          <Card>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Solicitante</p>
                <div className="flex items-center gap-2">
                  <Avatar name={process.openedBy.name} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-slate-700">{process.openedBy.name}</p>
                    <p className="text-xs text-slate-400">{process.openedBy.email}</p>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Prazo atual</p>
                <p className="text-sm font-medium text-slate-700">
                  {process.deadline ? new Date(process.deadline).toLocaleDateString('pt-BR') : 'Não definido'}
                </p>
              </div>
            </div>
            <div className="border-t border-slate-100 pt-4">
              <p className="text-xs text-slate-500 mb-1">Descrição</p>
              <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{process.description}</p>
            </div>
          </Card>

          {/* Chat */}
          <Card padding="none">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
              <span className="material-icons-outlined text-[18px] text-slate-400">forum</span>
              <h2 className="text-sm font-semibold text-slate-700">Comunicação</h2>
              <span className="ml-auto text-xs text-slate-400">{messages.length} mensagem(ns)</span>
            </div>

            <div className="h-[360px] overflow-y-auto p-4 space-y-3 bg-slate-50/30">
              {messages.length === 0 && (
                <div className="h-full flex items-center justify-center">
                  <p className="text-sm text-slate-400">Nenhuma mensagem ainda.</p>
                </div>
              )}
              {messages.map((m) => {
                const fromMe = m.sender.id === currentUserId;
                return (
                  <div key={m.id} className={`flex items-end gap-2 ${fromMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    <Avatar name={m.sender.name} size="sm" />
                    <div className={`max-w-[70%] flex flex-col ${fromMe ? 'items-end' : 'items-start'}`}>
                      <span className="text-xs text-slate-400 mb-1">{m.sender.name}</span>
                      <div className={[
                        'px-4 py-2.5 rounded-[8px] text-sm',
                        fromMe
                          ? 'bg-[#0b5345] text-white rounded-br-sm'
                          : 'bg-white border border-slate-200 text-slate-700 rounded-bl-sm shadow-sm',
                      ].join(' ')}>
                        {m.content}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1">
                        {new Date(m.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} className="flex gap-2 p-3 border-t border-slate-100 bg-white">
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Responder ao funcionário..."
                className="flex-1 px-4 py-2 text-sm border border-slate-200 rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#0b5345]"
                aria-label="Nova mensagem"
              />
              <Button type="submit" disabled={sending || !newMessage.trim()} size="sm">
                <span className="material-icons-outlined text-[16px]">send</span>
              </Button>
            </form>
          </Card>
        </div>

        {/* Right: control panel */}
        <div className="space-y-4">
          <Card>
            <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <span className="material-icons-outlined text-[18px] text-slate-400">tune</span>
              Atualizar Processo
            </h2>

            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#0b5345] bg-white"
              >
                <option value="NOVO">Novo</option>
                <option value="EM_ANDAMENTO">Em Andamento</option>
                <option value="CONCLUIDO">Concluído</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Prazo Final</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#0b5345]"
              />
            </div>

            <Button className="w-full" loading={savingUpdate} onClick={updateProcess}>
              <span className="material-icons-outlined text-[16px]">save</span>
              Salvar Alterações
            </Button>
          </Card>

          <Card className="border-l-4 border-l-slate-300">
            <h3 className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Urgência Atual</h3>
            <UrgencyPill urgency={process.urgency} />
            {process.deadline && (
              <p className="text-xs text-slate-400 mt-2">
                Prazo: {new Date(process.deadline).toLocaleDateString('pt-BR')}
              </p>
            )}
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
