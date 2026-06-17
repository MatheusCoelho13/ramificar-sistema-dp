import { Link } from 'react-router-dom';

function DashboardMockup() {
  return (
    <div style={{
      background: '#0a1a0e',
      borderRadius: 14,
      overflow: 'hidden',
      boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)',
      width: '100%',
      maxWidth: 500,
    }}>
      {/* titlebar */}
      <div style={{ background: '#0f2113', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 6, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }} />
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
        <span style={{ marginLeft: 8, color: '#3a6b45', fontSize: 11, fontFamily: 'monospace', letterSpacing: '0.03em' }}>ramificar · painel defensor</span>
      </div>

      {/* stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, background: 'rgba(255,255,255,0.04)', margin: '12px 12px 0' }}>
        {[
          { label: 'Pendentes', value: '3', color: '#f59e0b' },
          { label: 'Em andamento', value: '7', color: '#3b82f6' },
          { label: 'Concluídos', value: '12', color: '#22c55e' },
        ].map((s) => (
          <div key={s.label} style={{ background: '#0f1e13', padding: '12px 14px', borderRadius: 4 }}>
            <p style={{ color: s.color, fontSize: 22, fontWeight: 700, margin: 0, lineHeight: 1 }}>{s.value}</p>
            <p style={{ color: '#3a5a40', fontSize: 10, margin: '4px 0 0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* list */}
      <div style={{ padding: '10px 12px 14px' }}>
        {[
          { id: '#0042', title: 'Recurso de alvará — 3ª Vara', status: 'Urgente', dot: '#ef4444' },
          { id: '#0041', title: 'Habeas corpus preventivo', status: 'Normal', dot: '#22c55e' },
          { id: '#0040', title: 'Revisão de benefício assistencial', status: 'Normal', dot: '#22c55e' },
          { id: '#0039', title: 'Defesa em processo penal', status: 'Urgente', dot: '#ef4444' },
        ].map((row, i) => (
          <div key={row.id} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '9px 10px',
            borderRadius: 6,
            background: i === 0 ? 'rgba(239,68,68,0.06)' : 'transparent',
            borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.03)' : 'none',
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: row.dot, flexShrink: 0 }} />
            <span style={{ color: '#2d5a38', fontSize: 10, fontFamily: 'monospace', width: 38, flexShrink: 0 }}>{row.id}</span>
            <span style={{ color: '#9dc8a2', fontSize: 12, flex: 1 }}>{row.title}</span>
            <span style={{
              fontSize: 9,
              fontWeight: 700,
              color: row.dot,
              background: row.dot + '18',
              borderRadius: 20,
              padding: '2px 8px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              flexShrink: 0,
            }}>{row.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Landing() {
  return (
    <div style={{ fontFamily: "'Sora', system-ui, sans-serif", minHeight: '100vh', background: '#ffffff' }}>

      {/* ── NAV ── */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #e8f0e9' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 28px', height: 60, display: 'flex', alignItems: 'center', gap: 40 }}>
          <span style={{ fontWeight: 800, fontSize: 18, color: '#009739', letterSpacing: '-0.02em' }}>Ramificar</span>
          <nav style={{ display: 'flex', gap: 28, flex: 1 }}>
            {['Soluções', 'Sobre nós', 'Benefícios', 'Contato'].map((item) => (
              <a key={item} href="#" style={{ color: '#64748b', textDecoration: 'none', fontSize: 13, fontWeight: 500, letterSpacing: '-0.01em' }}>
                {item}
              </a>
            ))}
          </nav>
          <Link to="/login" style={{ background: '#009739', color: '#fff', padding: '7px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none', letterSpacing: '-0.01em' }}>
            Entrar
          </Link>
        </div>
      </header>

      {/* ── HERO ── */}
      <section style={{ background: '#0c2114' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '72px 28px 80px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(0,151,57,0.15)', border: '1px solid rgba(0,151,57,0.25)', color: '#5ccf7e', fontSize: 11, fontWeight: 600, padding: '4px 12px', borderRadius: 20, marginBottom: 24, letterSpacing: '0.02em' }}>
              <span className="material-icons-outlined" style={{ fontSize: 13 }}>verified</span>
              Inovação no Serviço Público
            </div>
            <h1 style={{ fontSize: 52, fontWeight: 800, color: '#ffffff', lineHeight: 1.1, letterSpacing: '-0.03em', margin: '0 0 20px' }}>
              Distribuição justa e anônima de demandas.
            </h1>
            <p style={{ color: '#7aaa88', fontSize: 15, lineHeight: 1.7, margin: '0 0 36px', maxWidth: 400 }}>
              Roteamento automático que elimina sobrecarga desigual na Defensoria Pública — cada defensor recebe demandas com equidade total.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <Link to="/login" style={{ background: '#009739', color: '#fff', padding: '11px 24px', borderRadius: 8, fontWeight: 700, textDecoration: 'none', fontSize: 14, letterSpacing: '-0.01em' }}>
                Entrar no sistema
              </Link>
              <a href="#como-funciona" style={{ background: 'rgba(255,255,255,0.07)', color: '#9dc8a2', border: '1px solid rgba(255,255,255,0.1)', padding: '11px 24px', borderRadius: 8, fontWeight: 600, textDecoration: 'none', fontSize: 14, letterSpacing: '-0.01em' }}>
                Como funciona
              </a>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <DashboardMockup />
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ background: '#fff', padding: '80px 0' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 28px' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <p style={{ color: '#009739', fontWeight: 700, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>Funcionalidades</p>
            <h2 style={{ fontSize: 34, fontWeight: 800, color: '#0c1a0e', letterSpacing: '-0.03em', marginBottom: 12 }}>Inovação no atendimento público</h2>
            <p style={{ color: '#64748b', maxWidth: 460, margin: '0 auto', fontSize: 15, lineHeight: 1.6 }}>
              Plataforma interna que reorganiza como as demandas chegam aos defensores — sem hierarquia informal, sem sobrecarga.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
            {[
              { icon: 'balance', title: 'Distribuição automática e imparcial', text: 'Roteamento sem favorecimentos. Cada defensor recebe demandas com equidade comprovada pelo sistema.' },
              { icon: 'visibility_off', title: 'Anonimato estrutural na triagem', text: 'O funcionário nunca sabe qual defensor atende — imparcialidade garantida por arquitetura, não por regra.' },
              { icon: 'monitoring', title: 'Bem-estar e carga em tempo real', text: 'Painel de pulso diário detecta sobrecarga antes que vire problema. Alertas automáticos para gestão.' },
            ].map((f) => (
              <div key={f.title} style={{ border: '1px solid #e8f0e9', borderRadius: 12, padding: '28px 24px', background: '#fafffe' }}>
                <div style={{ width: 44, height: 44, background: '#f0faf3', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                  <span className="material-icons-outlined" style={{ color: '#009739', fontSize: 22 }}>{f.icon}</span>
                </div>
                <h3 style={{ fontWeight: 700, color: '#0c1a0e', fontSize: 15, marginBottom: 8, letterSpacing: '-0.01em' }}>{f.title}</h3>
                <p style={{ color: '#64748b', fontSize: 13, lineHeight: 1.65, margin: 0 }}>{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="como-funciona" style={{ background: '#f4fcf6', padding: '80px 0' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 72, alignItems: 'center' }}>
          <div>
            <p style={{ color: '#009739', fontWeight: 700, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>Como funciona</p>
            <h2 style={{ fontSize: 34, fontWeight: 800, color: '#0c1a0e', letterSpacing: '-0.03em', marginBottom: 40 }}>Fluxo simplificado para máxima eficiência</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                { n: '01', title: 'Funcionário abre solicitação', text: 'Preenche título e descrição. O sistema cuida do roteamento.' },
                { n: '02', title: 'Roteamento automático anônimo', text: 'Defensor ativo do dia recebe sem que o solicitante saiba a identidade.' },
                { n: '03', title: 'Defensor atende e responde', text: 'Chat interno integrado. Resultado registrado no relatório de carga.' },
              ].map((s, i, arr) => (
                <div key={s.n} style={{ display: 'flex', gap: 16, paddingBottom: i < arr.length - 1 ? 28 : 0 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#009739', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12, flexShrink: 0, letterSpacing: '-0.01em' }}>
                      {s.n}
                    </div>
                    {i < arr.length - 1 && <div style={{ width: 1, flex: 1, background: '#c8e8ce', marginTop: 6 }} />}
                  </div>
                  <div style={{ paddingBottom: i < arr.length - 1 ? 16 : 0 }}>
                    <h3 style={{ fontWeight: 700, color: '#0c1a0e', fontSize: 14, marginBottom: 4, marginTop: 10, letterSpacing: '-0.01em' }}>{s.title}</h3>
                    <p style={{ color: '#64748b', fontSize: 13, lineHeight: 1.6, margin: 0 }}>{s.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* right: kanban preview */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: 360 }}>
              {/* browser chrome */}
              <div style={{ background: '#e8eae8', borderRadius: '10px 10px 0 0', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                {['#ff5f57','#febc2e','#28c840'].map(c => <div key={c} style={{ width: 9, height: 9, borderRadius: '50%', background: c }} />)}
                <div style={{ flex: 1, background: '#d4d6d4', borderRadius: 4, height: 18, marginLeft: 8, display: 'flex', alignItems: 'center', padding: '0 8px' }}>
                  <span style={{ fontSize: 9, color: '#7a847a', fontFamily: 'monospace' }}>ramificar.dp.gov.br/defensor/kanban</span>
                </div>
              </div>
              {/* app content */}
              <div style={{ background: '#f8faf8', border: '1px solid #dde8de', borderTop: 'none', borderRadius: '0 0 10px 10px', padding: 14, boxShadow: '0 12px 40px rgba(0,80,20,0.12)' }}>
                {/* topbar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 10, borderBottom: '1px solid #e0ebe1' }}>
                  <span style={{ fontWeight: 700, fontSize: 12, color: '#1a3020' }}>Kanban — Meus processos</span>
                  <div style={{ background: '#009739', color: '#fff', fontSize: 9, fontWeight: 600, padding: '3px 8px', borderRadius: 4 }}>Hoje</div>
                </div>
                {/* 3 columns */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                  {[
                    { label: 'Pendente', color: '#f59e0b', items: ['Recurso de alvará', 'Habeas corpus'] },
                    { label: 'Em andamento', color: '#3b82f6', items: ['Revisão benefício'] },
                    { label: 'Concluído', color: '#22c55e', items: ['Defesa penal', 'Alvará prisional', 'Revisão RG'] },
                  ].map((col) => (
                    <div key={col.label}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: col.color }} />
                        <span style={{ fontSize: 9, fontWeight: 700, color: '#4a6650', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{col.label}</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                        {col.items.map(item => (
                          <div key={item} style={{ background: '#fff', border: '1px solid #dde8de', borderRadius: 6, padding: '7px 8px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                            <p style={{ fontSize: 10, color: '#2a4030', fontWeight: 500, margin: 0, lineHeight: 1.3 }}>{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: '#f5c518', padding: '68px 0' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 28px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: '#1a1300', letterSpacing: '-0.03em', marginBottom: 10 }}>
            Pronto para transformar sua gestão?
          </h2>
          <p style={{ color: '#5a4a00', fontSize: 15, marginBottom: 32, lineHeight: 1.6 }}>
            Acesse com as credenciais fornecidas pelo administrador da sua unidade.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
            <Link to="/login" style={{ background: '#1a2e1c', color: '#fff', padding: '12px 28px', borderRadius: 8, fontWeight: 700, textDecoration: 'none', fontSize: 14, letterSpacing: '-0.01em' }}>
              Entrar no sistema
            </Link>
            <a href="#como-funciona" style={{ border: '2px solid rgba(0,0,0,0.2)', color: '#1a1300', padding: '12px 28px', borderRadius: 8, fontWeight: 700, textDecoration: 'none', fontSize: 14, letterSpacing: '-0.01em' }}>
              Saiba mais
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#0c2114', padding: '36px 0' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 800, color: '#fff', fontSize: 16, letterSpacing: '-0.02em' }}>Ramificar</span>
          <p style={{ color: '#2d6a3f', fontSize: 12, margin: 0 }}>© {new Date().getFullYear()} Sistema DP — Defensoria Pública</p>
        </div>
      </footer>
    </div>
  );
}