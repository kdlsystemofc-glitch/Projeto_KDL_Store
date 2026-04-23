# KDL Store 🛒

Sistema de gestão completo para o pequeno comércio brasileiro. PDV, estoque, garantias digitais, clientes, fornecedores, financeiro e muito mais.

## Estrutura do Projeto

```
/
├── apps/
│   ├── landing/    # Landing page (kdlstore.com.br) — Port 3000
│   ├── store/      # App do lojista (app.kdlstore.com.br) — Port 3001
│   └── admin/      # Portal Admin KDL (admin.kdlstore.com.br) — Port 3002
├── docs/
│   └── SYSTEM_MAP.md  # Mapeamento completo do sistema
├── imagens/            # Frames originais da animação hero
├── .gitignore
├── package.json        # Root (Turborepo)
├── pnpm-workspace.yaml
└── turbo.json
```

## Pré-requisitos

- Node.js 18+
- pnpm 9+
- Contas: Supabase + Stripe (veja `.env.example` em cada app)

## Instalação

```bash
pnpm install
```

## Desenvolvimento

```bash
# Todos os apps simultaneamente
pnpm dev

# App específico
pnpm dev:landing  # http://localhost:3000
pnpm dev:store    # http://localhost:3001
pnpm dev:admin    # http://localhost:3002
```

## Documentação

- [`AI_CONTEXT.md`](./AI_CONTEXT.md) - Arquivo essencial para agentes de inteligência artificial ou desenvolvedores que continuarão o projeto (Contém regras do DB, Supabase e UI).
- [`docs/schema.sql`](./docs/schema.sql) - Schema relacional completo do banco de dados (Supabase PostgreSQL).
- [`docs/SYSTEM_MAP.md`](./docs/SYSTEM_MAP.md) - Mapeamento completo do sistema: telas, fluxos, componentes e muito mais.

## Planos

| Plano | Preço | Usuários | Produtos |
|---|---|---|---|
| Starter | R$49,90/mês | 1 | até 300 |
| Pro | R$69,90/mês | até 3 | até 1.000 |
| Premium | R$99,90/mês | Ilimitado | Ilimitado |

## Status do Desenvolvimento

- ✅ Fase 1 — Fundação (Monorepo, estrutura, .gitignore)
- ✅ Fase 2 — Landing Page
- ✅ Fase 3 — App da Loja (Estoque, Fornecedores, Auto-healing, Financeiro)
- ✅ Fase 4 — Portal Admin
- ✅ Fase 5 — TenantContext, números sequenciais, convite de usuários
- ✅ Fase 6 — Garantias (código único), dashboard, correções gerais
- ✅ Fase 7 — Fidelidade, catálogo público, OS↔venda, notificações WhatsApp
- ✅ Fase 8 — Variações de produto (grade), Pets + Agenda, Regras de desconto progressivo
