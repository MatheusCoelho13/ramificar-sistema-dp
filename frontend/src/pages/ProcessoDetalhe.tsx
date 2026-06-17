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
import { useAuth } from '../contexts/AuthContext';

interface Message {
  id: string;
  content: string;
  createdAt: string;
  fromMe: boolean;
  senderLabel: string;
}

interface ProcessDetail {
  id: string;
  number: number;
  title: string;
  description: string;
  status: string;
  deadline: string | null;
  urgency: string;
  defensorLabel: string;
  messages: Message[];
}

export default function ProcessoDetalhe() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [process, setProcess] = useState<ProcessDetail | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  function loadMessages() {
    if (!id) return;
    api.get(`/processes/${id}/messages/funcionario`).then((r) => setMessages(r.data));
  }

  useEffect(() => {
    if (!id) return;
    api.get(`/processes/${id}/funcionario`).then((r) => {
      setProcess(r.data);
      setMessages(r.data.messages ?? []);
    }).finally(() => setLoading(false));

    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
      <AppLayout theme="ramificar">
        <div className="max-w-3xl space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AppLayout>
    );
  }

  if (!process) return null;

  const codename = process.defensorLabel ?? 'Defensor';

  return (
    <AppLayout theme="ramificar">
      <Breadcrumb items={[{ label: 'Painel', to: '/dashboard' }, { label: `Processo #${process.number}` }]} />

      <div className="max-w-3xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">#{process.number}</span>
              <Badge status={process.status} />
              <UrgencyPill urgency={process.urgency} />
            </div>
            <h1 className="text-xl font-bold text-slate-800">{process.title}</h1>
          </div>
        </div>

        {/* Info card */}
        <Card className="mb-6">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-xs text-slate-500 mb-1">Prazo final</p>
              <p className="text-sm font-medium text-slate-700">
                {process.deadline ? new Date(process.deadline).toLocaleDateString('pt-BR') : 'Não definido'}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Atendido por</p>
              <div className="flex items-center gap-2">
                <Avatar name={codename} size="sm" generic />
                <span className="text-sm font-medium text-slate-700">{codename}</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Aberto em</p>
              <p className="text-sm font-medium text-slate-700">
                {new Date(process.id.substring(0, 8)).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
          <div className="border-t border-slate-100 pt-4">
            <p className="text-xs text-slate-500 mb-1">Descrição</p>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{process.description}</p>
          </div>
        </Card>

        {/* Chat */}
        <Card padding="none">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
            <span className="material-icons-outlined text-[18px] text-slate-400">forum</span>
            <h2 className="text-sm font-semibold text-slate-700">Mensagens</h2>
            <span className="ml-auto text-xs text-slate-400">{messages.length} mensagem(ns)</span>
          </div>

          <div className="h-[400px] overflow-y-auto p-4 bg-slate-50/50 space-y-3">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <span className="material-icons-outlined text-4xl text-slate-200 mb-2">chat_bubble_outline</span>
                <p className="text-sm text-slate-400">Nenhuma mensagem ainda.</p>
                <p className="text-xs text-slate-300 mt-1">Envie uma mensagem para o defensor.</p>
              </div>
            )}

            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex items-end gap-2 ${m.fromMe ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {!m.fromMe && (
                  <Avatar name={codename} size="sm" generic />
                )}
                {m.fromMe && user && (
                  <Avatar name={user.name} size="sm" />
                )}

                <div className={`max-w-[70%] ${m.fromMe ? 'items-end' : 'items-start'} flex flex-col`}>
                  <span className={`text-xs mb-1 text-slate-400 ${m.fromMe ? 'text-right' : 'text-left'}`}>
                    {m.senderLabel}
                  </span>
                  <div
                    className={[
                      'px-4 py-2.5 rounded-[8px] text-sm',
                      m.fromMe
                        ? 'bg-[#009739] text-white rounded-br-sm'
                        : 'bg-white border border-slate-200 text-slate-700 rounded-bl-sm shadow-sm',
                    ].join(' ')}
                  >
                    {m.content}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1">
                    {new Date(m.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {process.status !== 'CONCLUIDO' && (
            <form
              onSubmit={sendMessage}
              className="flex gap-2 p-3 border-t border-slate-100 bg-white"
            >
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="flex-1 px-4 py-2 text-sm border border-slate-200 rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#009739] focus:border-transparent"
                aria-label="Nova mensagem"
              />
              <Button type="submit" disabled={sending || !newMessage.trim()} size="sm">
                <span className="material-icons-outlined text-[16px]">send</span>
              </Button>
            </form>
          )}

          {process.status === 'CONCLUIDO' && (
            <div className="px-4 py-3 bg-green-50 border-t border-green-100 text-center">
              <p className="text-sm text-green-700 font-medium">Este processo foi concluído.</p>
            </div>
          )}
        </Card>
      </div>
    </AppLayout>
  );
}
