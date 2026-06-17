# Sistema DP — Defensoria Pública

Sistema interno de gestão de demandas com roteamento anônimo para defensores.

## Stack

- **Frontend**: Vite + React + TypeScript (porta 5173)
- **Backend**: NestJS + TypeScript (porta 3000)
- **Banco**: SQLite (dev) via Prisma ORM 7 + better-sqlite3 adapter

## Setup Rápido

### 1. Backend

```bash
cd backend
npm install
npm run db:migrate       # cria o banco SQLite
npm run seed             # popula usuários e escala de teste
npm start                # inicia em http://localhost:3000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev              # inicia em http://localhost:5173
```

## Usuários de Teste (seed)

| E-mail | Senha | Papel |
|--------|-------|-------|
| admin@dp.gov.br | admin123 | ADMIN |
| defensor1@dp.gov.br | defensor123 | DEFENSOR |
| defensor2@dp.gov.br | defensor123 | DEFENSOR |
| defensor3@dp.gov.br | defensor123 | DEFENSOR |
| func1@dp.gov.br | func123 | FUNCIONARIO |
| func2@dp.gov.br | func123 | FUNCIONARIO |

## Variáveis de Ambiente (backend/.env)

```env
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="dp-secret-dev"
```

## Páginas

| Rota | Papel | Descrição |
|------|-------|-----------|
| `/login` | todos | Login |
| `/dashboard` | FUNCIONARIO | Painel: processos + pulso do dia |
| `/processos/novo` | FUNCIONARIO | Abrir nova solicitação |
| `/processos/:id` | FUNCIONARIO | Detalhe + chat anônimo |
| `/defensor` | DEFENSOR/ADMIN | Painel: alertas + lista de processos |
| `/defensor/kanban` | DEFENSOR/ADMIN | Kanban com 3 colunas |
| `/defensor/processos/:id` | DEFENSOR/ADMIN | Detalhe + chat + atualizar status/prazo |
| `/defensor/relatorio` | DEFENSOR/ADMIN | Relatório de carga mensal |
| `/defensor/pulso` | DEFENSOR/ADMIN | Painel do pulso com regra dos 5 |
| `/admin` | ADMIN | Cadastro de usuários + gestão da escala |

## Regras de Negócio Implementadas

- **Anonimato**: nenhum endpoint acessível ao FUNCIONARIO retorna nome/email/ID do defensor
- **Codinomes**: escala diária mapeia defensor real → codinome (ex: "Alfa", "Beta")
- **Round-robin**: processos roteados ao defensor ativo do dia; auto-gerado se não configurado
- **Urgência**: Verde >5 dias, Amarelo 2-5 dias, Vermelho <2 dias do prazo
- **Alerta inatividade**: cron diário às 08h marca processos sem interação há +1 dia
- **Relatório mensal**: 4 faixas — Verde (<10), Amarelo (10-19), Laranja (20-29), Vermelho (30+)
- **Pulso anônimo**: respostas só em agregado; comentários visíveis apenas com ≥5 por nível
- **Polling**: frontend atualiza mensagens a cada 5 segundos (sem WebSocket)

## Estrutura

```
/
├── backend/
│   ├── prisma/schema.prisma    # modelo de dados
│   ├── prisma/seed.ts          # dados iniciais
│   └── src/
│       ├── auth/               # JWT + login
│       ├── users/              # CRUD de usuários (admin)
│       ├── scale/              # escala de rotação
│       ├── processes/          # processos com roteamento anônimo
│       ├── messages/           # chat por processo
│       ├── workload/           # relatório de carga + cron
│       └── pulse/              # pulso do dia
└── frontend/
    └── src/
        ├── contexts/AuthContext.tsx
        └── pages/              # 9 páginas
```
