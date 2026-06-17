import { useEffect, useState } from 'react';
import api from '../api/client';
import { AppLayout } from '../components/nav/AppLayout';
import { Card } from '../components/ui/Card';

interface TrendEntry { date: string; average: number | null; total: number; }
interface Dashboard {
  date: string;
  total: number;
  average: number | null;
  distribution: Record<string, { count: number; pct: number }>;
  comments: Array<{ score: number; comment: string }>;
  trend: TrendEntry[];
}

const SCORE_ICON: Record<number, string> = {
  1: 'sentiment_very_dissatisfied',
  2: 'sentiment_dissatisfied',
  3: 'sentiment_neutral',
  4: 'sentiment_satisfied',
  5: 'sentiment_very_satisfied',
};
const SCORE_LABEL: Record<number, string> = { 1: 'Péssimo', 2: 'Ruim', 3: 'Regular', 4: 'Bom', 5: 'Ótimo' };

const scoreBarColor = (score: number) => {
  if (score <= 2) return 'bg-red-400';
  if (score === 3) return 'bg-amber-400';
  return 'bg-green-500';
};

const sentimentColor = (avg: number | null) => {
  if (!avg) return 'text-slate-400';
  if (avg < 2.5) return 'text-red-500';
  if (avg < 3.5) return 'text-amber-500';
  return 'text-green-600';
};

export default function PulsoDashboard() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/pulse/dashboard?date=${date}`)
      .then((r) => setData(r.data))
      .finally(() => setLoading(false));
  }, [date]);

  void Math.max(...(data?.trend.map((t) => t.average ?? 0) ?? [0]), 0.1);

  const avgSentimentIcon = data?.average
    ? data.average < 2.5 ? 'sentiment_very_dissatisfied' : data.average < 3.5 ? 'sentiment_neutral' : 'sentiment_very_satisfied'
    : null;

  return (
    <AppLayout theme="dp">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Pulso do Dia</h1>
          <p className="text-sm text-slate-500 mt-0.5">Bem-estar agregado da equipe.</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-500">Data:</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#0b5345]"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-slate-400 text-sm">Carregando...</p>
      ) : !data || data.total === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <span className="material-icons-outlined text-[64px] text-slate-300 mb-4">bar_chart</span>
          <p className="text-lg font-medium text-slate-600">Nenhuma resposta registrada neste dia.</p>
          <p className="text-sm text-slate-400 mt-1">Aguarde os funcionários registrarem o pulso.</p>
        </div>
      ) : (
        <>
          {/* Top KPIs */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card className="text-center border-l-4 border-l-[#0b5345]">
              <p className="text-5xl font-bold mb-1" style={{ color: sentimentColor(data.average) ? undefined : '#0b5345' }}>
                {data.average?.toFixed(1) ?? '—'}
              </p>
              {avgSentimentIcon && (
                <span className={`material-icons-outlined text-[32px] mb-2 block ${sentimentColor(data?.average ?? null)}`}>
                  {avgSentimentIcon}
                </span>
              )}
              <p className="text-xs text-slate-500">Índice geral do dia</p>
            </Card>
            <Card className="text-center">
              <p className="text-5xl font-bold text-slate-700 mb-2">{data.total}</p>
              <p className="text-xs text-slate-500">Respostas registradas</p>
            </Card>
            <Card className="text-center">
              <div className="mb-2">
                <span className={`material-icons-outlined text-[36px] ${data.average && data.average >= 4 ? 'text-green-500' : data.average && data.average >= 3 ? 'text-amber-400' : 'text-red-500'}`}>
                  fiber_manual_record
                </span>
              </div>
              <p className="text-sm font-medium text-slate-600">
                {data.average && data.average >= 4 ? 'Equipe bem' : data.average && data.average >= 3 ? 'Atenção' : 'Intervenção recomendada'}
              </p>
              <p className="text-xs text-slate-400">Status da equipe</p>
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Distribution */}
            <Card>
              <h2 className="text-sm font-semibold text-slate-700 mb-4">Distribuição de Respostas</h2>
              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map((score) => {
                  const d = data.distribution[score] ?? { count: 0, pct: 0 };
                  return (
                    <div key={score} className="flex items-center gap-3">
                      <span className="material-icons-outlined text-[20px] w-7 text-center text-slate-500">{SCORE_ICON[score]}</span>
                      <span className="text-xs text-slate-500 w-14">{SCORE_LABEL[score]}</span>
                      <div className="flex-1 bg-slate-100 rounded-full h-4 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${scoreBarColor(score)}`}
                          style={{ width: `${d.pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-500 w-16 text-right">{d.count} ({d.pct}%)</span>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Trend */}
            <Card>
              <h2 className="text-sm font-semibold text-slate-700 mb-4">Tendência da Semana</h2>
              <div className="flex items-end gap-1.5 h-32 mb-2">
                {data.trend.map((t) => {
                  const heightPct = t.average ? (t.average / 5) * 100 : 2;
                  const isToday = t.date === date;
                  return (
                    <div key={t.date} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[10px] text-slate-400">{t.average?.toFixed(1) ?? ''}</span>
                      <div className="w-full flex flex-col justify-end" style={{ height: '96px' }}>
                        <div
                          className={`w-full rounded-t-[4px] transition-all ${isToday ? 'bg-[#0b5345]' : 'bg-slate-300'}`}
                          style={{ height: `${heightPct}%`, minHeight: t.average ? '4px' : '2px' }}
                        />
                      </div>
                      <span className={`text-[10px] ${isToday ? 'font-bold text-[#0b5345]' : 'text-slate-400'}`}>
                        {new Date(t.date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short' })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Comments */}
          <Card>
            <h2 className="text-sm font-semibold text-slate-700 mb-1">Comentários Abertos</h2>
            <p className="text-xs text-slate-400 mb-4 flex items-center gap-1">
              <span className="material-icons-outlined text-[14px]">shield</span>
              Visíveis apenas quando há ≥ 5 respostas no mesmo nível de satisfação.
            </p>

            {data.comments.length === 0 ? (
              <div className="bg-slate-50 rounded-[8px] px-4 py-6 text-center">
                <p className="text-sm text-slate-500 font-medium">Comentários não disponíveis.</p>
                <p className="text-xs text-slate-400 mt-1">
                  Comentários ficam disponíveis quando houver pelo menos 5 respostas no mesmo nível, para preservar o anonimato.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {data.comments.map((c, i) => (
                  <div key={i} className="bg-slate-50 rounded-[8px] px-4 py-3 flex items-start gap-3">
                    <span className="material-icons-outlined text-[20px] text-slate-400">{SCORE_ICON[c.score]}</span>
                    <div>
                      <span className="text-xs text-slate-400 block mb-0.5">Nível {c.score} — {SCORE_LABEL[c.score]}</span>
                      <p className="text-sm text-slate-700">{c.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </AppLayout>
  );
}
