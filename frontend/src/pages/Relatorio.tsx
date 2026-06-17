import { useState } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import api from '../api/client';
import { AppLayout } from '../components/nav/AppLayout';
import { Card } from '../components/ui/Card';
import { AlertPill } from '../components/ui/AlertPill';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { useToast } from '../contexts/ToastContext';

interface Report {
  id: string;
  defender: { id: string; name: string };
  total: number;
  concluded: number;
  alertLevel: string;
  generatedAt: string;
}

const MONTH_NAMES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

const MONTH_SHORT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const PIE_COLORS = ['#009739', '#0b5345', '#22c55e', '#16a34a', '#4ade80', '#166534', '#86efac', '#14532d'];

const alertConfig: Record<string, { label: string; cls: string; dot: string }> = {
  VERDE:    { label: 'Carga normal',    cls: 'bg-green-50 text-green-700 border border-green-200',   dot: '#22c55e' },
  AMARELO:  { label: 'Atenção',         cls: 'bg-amber-50 text-amber-700 border border-amber-200',   dot: '#f59e0b' },
  LARANJA:  { label: 'Carga elevada',   cls: 'bg-orange-50 text-orange-700 border border-orange-200', dot: '#f97316' },
  VERMELHO: { label: 'Sobrecarga',      cls: 'bg-red-50 text-red-700 border border-red-200',         dot: '#ef4444' },
};

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 14px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <p style={{ fontWeight: 600, fontSize: 13, color: '#1e293b', margin: 0 }}>{d.name}</p>
      <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0' }}>{d.value} processos</p>
    </div>
  );
}

export default function Relatorio() {
  const toast = useToast();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  async function loadReports() {
    setLoading(true);
    try {
      const r = await api.get(`/workload?year=${year}&month=${month}`);
      setReports(r.data);
      setGenerated(false);
    } finally {
      setLoading(false);
    }
  }

  function exportCSV() {
    const header = ['Defensor', 'Total', 'Concluídos', 'Em Aberto', 'Taxa (%)', 'Participação (%)', 'Status'];
    const rows = reports.map((r) => {
      const taxa = r.total ? Math.round((r.concluded / r.total) * 100) : 0;
      const participacao = totalProcesses ? Math.round((r.total / totalProcesses) * 100) : 0;
      return [r.defender.name, r.total, r.concluded, r.total - r.concluded, taxa, participacao, alertConfig[r.alertLevel]?.label ?? r.alertLevel];
    });
    const csv = [header, ...rows].map((row) => row.join(';')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-carga-${MONTH_NAMES[month - 1].toLowerCase()}-${year}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function generateReport() {
    setLoading(true);
    try {
      const r = await api.post('/workload/generate', { year, month });
      setReports(r.data);
      setGenerated(true);
      toast('Relatório gerado e consolidado!', 'success');
    } catch {
      toast('Erro ao gerar relatório.', 'error');
    } finally {
      setLoading(false);
    }
  }

  const totalProcesses = reports.reduce((s, r) => s + r.total, 0);
  const totalConcluded = reports.reduce((s, r) => s + r.concluded, 0);
  const avgLoad = reports.length ? Math.round(totalProcesses / reports.length) : 0;
  const taxaGlobal = totalProcesses ? Math.round((totalConcluded / totalProcesses) * 100) : 0;

  const pieData = reports
    .filter((r) => r.total > 0)
    .map((r) => ({ name: r.defender.name.split(' ')[0], fullName: r.defender.name, value: r.total, concluded: r.concluded }));

  const reportedAt = reports[0]?.generatedAt
    ? new Date(reports[0].generatedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    : null;

  return (
    <AppLayout theme="dp">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-800">Relatório de Carga</h1>
        <p className="text-sm text-slate-500 mt-0.5">Distribuição mensal de processos por defensor.</p>
      </div>

      {/* Controls */}
      <Card className="mb-6">
        <div className="flex items-end gap-4 flex-wrap">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Ano</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-24 px-3 py-2 text-sm border border-slate-200 rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#0b5345]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Mês</label>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="px-3 py-2 text-sm border border-slate-200 rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#0b5345] bg-white"
            >
              {MONTH_SHORT.map((m, i) => (
                <option key={i} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>
          <Button variant="secondary" onClick={loadReports} loading={loading}>
            <span className="material-icons-outlined text-[16px]">search</span>
            Consultar
          </Button>
          <Button onClick={generateReport} loading={loading}>
            <span className="material-icons-outlined text-[16px]">refresh</span>
            Gerar Relatório
          </Button>
          {reports.length > 0 && (
            <Button variant="secondary" onClick={exportCSV}>
              <span className="material-icons-outlined text-[16px]">download</span>
              Exportar CSV
            </Button>
          )}
        </div>
      </Card>

      {reports.length > 0 && (
        <>
          {/* Report title banner */}
          <div className="bg-[#0b5345] rounded-[10px] px-6 py-5 mb-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-green-300 uppercase tracking-widest mb-1">Defensoria Pública</p>
              <h2 className="text-lg font-bold text-white">
                Relatório de Carga — {MONTH_NAMES[month - 1]} de {year}
              </h2>
              {reportedAt && (
                <p className="text-xs text-green-300 mt-1">{generated ? 'Gerado em' : 'Consolidado em'} {reportedAt}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-white">{reports.length}</p>
              <p className="text-xs text-green-300">defensores</p>
            </div>
          </div>

          {/* KPI row */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total de Processos', value: totalProcesses, icon: 'folder_open', color: '#0b5345', bg: 'bg-emerald-50 border-l-4 border-l-[#0b5345]' },
              { label: 'Concluídos', value: totalConcluded, icon: 'task_alt', color: '#16a34a', bg: 'bg-green-50 border-l-4 border-l-green-500' },
              { label: 'Taxa de Conclusão', value: `${taxaGlobal}%`, icon: 'percent', color: '#0369a1', bg: 'bg-sky-50 border-l-4 border-l-sky-500' },
              { label: 'Média por Defensor', value: avgLoad, icon: 'balance', color: '#7c3aed', bg: 'bg-violet-50 border-l-4 border-l-violet-500' },
            ].map((k) => (
              <div key={k.label} className={`rounded-[10px] px-5 py-4 ${k.bg}`}>
                <span className="material-icons-outlined text-[20px] mb-2 block" style={{ color: k.color }}>{k.icon}</span>
                <p className="text-2xl font-black mb-0.5" style={{ color: k.color }}>{k.value}</p>
                <p className="text-xs text-slate-500 font-medium">{k.label}</p>
              </div>
            ))}
          </div>

          {/* Pie chart + ranking */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <Card>
              <h2 className="text-sm font-semibold text-slate-700 mb-4">
                <span className="material-icons-outlined text-[16px] align-middle mr-1 text-[#0b5345]">donut_large</span>
                Distribuição por Defensor
              </h2>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((_, idx) => (
                      <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => <span style={{ fontSize: 12, color: '#475569' }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            {/* Ranking */}
            <Card>
              <h2 className="text-sm font-semibold text-slate-700 mb-4">
                <span className="material-icons-outlined text-[16px] align-middle mr-1 text-[#0b5345]">leaderboard</span>
                Ranking de Carga
              </h2>
              <div className="flex flex-col gap-3">
                {[...reports]
                  .sort((a, b) => b.total - a.total)
                  .map((r, idx) => {
                    const pct = totalProcesses ? Math.round((r.total / totalProcesses) * 100) : 0;
                    const cfg = alertConfig[r.alertLevel] ?? alertConfig.VERDE;
                    return (
                      <div key={r.id}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-400 w-4">#{idx + 1}</span>
                            <span className="text-sm font-medium text-slate-700">{r.defender.name.split(' ')[0]}</span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.cls}`}>{cfg.label}</span>
                          </div>
                          <span className="text-sm font-bold text-slate-600">{r.total}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full transition-all"
                            style={{ width: `${pct}%`, background: PIE_COLORS[idx % PIE_COLORS.length] }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </Card>
          </div>

          {/* Table */}
          <Card padding="none" className="mb-6">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <span className="material-icons-outlined text-[18px] text-[#0b5345]">table_chart</span>
              <h2 className="text-sm font-semibold text-slate-700">Detalhamento por Defensor</h2>
            </div>
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Defensor</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Concluídos</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Em Aberto</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Taxa</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Participação</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => {
                  const taxa = r.total ? Math.round((r.concluded / r.total) * 100) : 0;
                  const participacao = totalProcesses ? Math.round((r.total / totalProcesses) * 100) : 0;
                  const emAberto = r.total - r.concluded;
                  return (
                    <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#0b5345] flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-white">{r.defender.name[0]}</span>
                          </div>
                          <span className="text-sm font-medium text-slate-700">{r.defender.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-sm font-bold text-slate-700 text-center">{r.total}</td>
                      <td className="px-4 py-3.5 text-sm text-green-700 text-center font-medium">{r.concluded}</td>
                      <td className="px-4 py-3.5 text-sm text-slate-500 text-center">{emAberto}</td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${taxa >= 70 ? 'bg-green-100 text-green-700' : taxa >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                          {taxa}%
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <div className="w-16 bg-slate-100 rounded-full h-1.5">
                            <div className="h-1.5 rounded-full bg-[#009739]" style={{ width: `${participacao}%` }} />
                          </div>
                          <span className="text-xs text-slate-500">{participacao}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-center"><AlertPill level={r.alertLevel} /></td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 border-t-2 border-slate-200">
                  <td className="px-5 py-3 text-xs font-bold text-slate-500 uppercase">Total Geral</td>
                  <td className="px-4 py-3 text-sm font-black text-slate-700 text-center">{totalProcesses}</td>
                  <td className="px-4 py-3 text-sm font-black text-green-700 text-center">{totalConcluded}</td>
                  <td className="px-4 py-3 text-sm font-bold text-slate-500 text-center">{totalProcesses - totalConcluded}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-xs font-bold text-slate-700">{taxaGlobal}%</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-xs font-bold text-slate-700">100%</span>
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </Card>

          {/* Legend */}
          <Card>
            <h3 className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-widest">Limiares de Carga (processos/mês)</h3>
            <div className="flex gap-3 flex-wrap">
              {[
                { label: 'Verde — 0 a 9 processos: carga normal',      cls: 'bg-green-50 text-green-700 border border-green-200' },
                { label: 'Amarelo — 10 a 19: atenção',                 cls: 'bg-amber-50 text-amber-700 border border-amber-200' },
                { label: 'Laranja — 20 a 29: carga elevada',           cls: 'bg-orange-50 text-orange-700 border border-orange-200' },
                { label: 'Vermelho — 30+: sobrecarga crítica',         cls: 'bg-red-50 text-red-700 border border-red-200' },
              ].map((l) => (
                <span key={l.label} className={`text-xs font-medium px-3 py-1.5 rounded-full ${l.cls}`}>{l.label}</span>
              ))}
            </div>
          </Card>
        </>
      )}

      {!loading && reports.length === 0 && (
        <EmptyState
          icon="donut_large"
          title="Nenhum dado para este período"
          subtitle={`Clique em "Gerar Relatório" para consolidar ${MONTH_SHORT[month - 1]}/${year}.`}
          action={{ label: 'Gerar Relatório', onClick: generateReport }}
        />
      )}
    </AppLayout>
  );
}
