import { useEffect, useState } from 'react';
import api from '../api/client';
import { AppLayout } from '../components/nav/AppLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useToast } from '../contexts/ToastContext';

const SCORE_ICONS = [
  'sentiment_very_dissatisfied',
  'sentiment_dissatisfied',
  'sentiment_neutral',
  'sentiment_satisfied',
  'sentiment_very_satisfied',
];

const SCORE_LABELS = ['Muito ruim', 'Ruim', 'Regular', 'Bom', 'Muito bom'];

export default function PulsoFuncionario() {
  const toast = useToast();
  const [registered, setRegistered] = useState(false);
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/pulse/today').then((r) => {
      setRegistered(r.data.registered);
    }).finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!score) return;
    setSubmitting(true);
    try {
      await api.post('/pulse', { score, comment: comment || undefined });
      setRegistered(true);
      toast('Pulso registrado! Obrigado pelo feedback.', 'success');
    } catch {
      toast('Erro ao registrar pulso.', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return null;

  return (
    <AppLayout theme="ramificar">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-800">Pulso do Dia</h1>
        <p className="text-slate-500 text-sm mt-0.5">Registre como foi o seu dia de trabalho.</p>
      </div>

      <div className="max-w-lg">
        {registered ? (
          <Card className="flex items-center gap-4">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="material-icons-outlined text-[32px] text-[#009739]">check_circle</span>
            </div>
            <div>
              <p className="font-semibold text-slate-700">Pulso já registrado hoje!</p>
              <p className="text-sm text-slate-500 mt-0.5">Obrigado pelo seu feedback. Até amanhã.</p>
            </div>
          </Card>
        ) : (
          <Card>
            <div className="flex items-center gap-2 mb-5">
              <span className="material-icons-outlined text-[22px] text-[#009739]">favorite</span>
              <h2 className="font-semibold text-slate-700">Como foi o trabalho hoje?</h2>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="flex justify-between gap-2 mb-2">
                {SCORE_ICONS.map((icon, i) => {
                  const val = i + 1;
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setScore(val)}
                      aria-label={SCORE_LABELS[i]}
                      aria-pressed={score === val}
                      className={[
                        'flex-1 flex flex-col items-center gap-1 py-3 rounded-[10px] border-2 transition-all',
                        score === val
                          ? 'bg-[#009739] border-[#009739] text-white scale-105'
                          : 'border-slate-200 hover:border-[#009739] text-slate-400 hover:text-[#009739]',
                      ].join(' ')}
                    >
                      <span className="material-icons-outlined text-[28px]">{icon}</span>
                      <span className="text-[10px] font-medium leading-tight text-center">
                        {SCORE_LABELS[i]}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-5">
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  Comentário (opcional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Descreva como foi seu dia, dificuldades, sugestões..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-[8px] resize-none focus:outline-none focus:ring-2 focus:ring-[#009739]"
                />
              </div>

              <Button
                type="submit"
                disabled={!score}
                loading={submitting}
                className="w-full mt-4"
              >
                Registrar Pulso
              </Button>
            </form>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
