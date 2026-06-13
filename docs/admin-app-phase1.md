# Admin CMS — fase 1 (estrutura inicial)

Painel operador separado da vitrine pública: login com JWT, shell de navegação e páginas placeholder para os módulos CMS previstos no MVP.

Plano de referência: [`.cursor/plans/ui_home_vitrine.plan.md`](../.cursor/plans/ui_home_vitrine.plan.md) (Fase 3). UI inspirada no painel IPMA ([php-app `UI_UX_ADMIN.md`](../../php-app/docs/UI_UX_ADMIN.md)).

## O quê foi entregue

- App **`apps/admin`** (Next.js 15, porta 3002)
- Auth completa: tabela `operators`, `POST /admin/auth/login`, `GET /admin/auth/me`, JWT HS256
- Login com card centrado + gradiente azul (padrão php-app)
- Shell autenticado: sidebar colapsável, header com breadcrumbs, menu do operador, footer
- Feedback unificado via **toast** no canto inferior direito (`useAdminToast`, variantes success/error/info)
- Rotas stub: Painel, Páginas, Produtos, Artigos, Coleções, Cupons, Configurações

## Fora de escopo (fase seguinte)

- Draft/preview/publish de páginas
- Formulários dos tipos de bloco restantes
- Gestão de operadores além do seed dev

Ver [admin-cms-blocks-phase2.md](./admin-cms-blocks-phase2.md) para o editor de blocos entregue.

## Fluxo de autenticação

```mermaid
sequenceDiagram
  participant Browser
  participant Admin as apps_admin
  participant API as Fastify
  participant DB as PostgreSQL

  Browser->>Admin: POST /login
  Admin->>API: POST /admin/auth/login
  API->>DB: operators by email
  API-->>Admin: JWT + operator DTO
  Admin-->>Browser: Set-Cookie vitrine_admin_token
  Browser->>Admin: GET /paginas
  Admin->>Admin: layout verifica JWT
  Admin-->>Browser: AdminShell + página stub
```

1. Formulário em `/login` chama `POST /api/auth/login` (Route Handler Next.js).
2. Handler repassa credenciais para a API e grava cookie **`vitrine_admin_token`** (`httpOnly`, `SameSite=Lax`, 8h).
3. Layout `(dashboard)` valida JWT com `JWT_SECRET` compartilhado.
4. Logout via `POST /api/auth/logout` limpa o cookie.

## Variáveis de ambiente

| Variável | Default | Uso |
|----------|---------|-----|
| `ADMIN_PORT` | `3002` | Porta do painel |
| `JWT_SECRET` | (dev placeholder) | Assinatura JWT — **obrigatório alterar em produção**; deve ser **o mesmo** na API e no admin (`next.config.ts` carrega `.env` da raiz do monorepo) |
| `JWT_EXPIRES_IN` | `8h` | Expiração do token |
| `ADMIN_SEED_EMAIL` | `admin@vitrine.local` | Operador criado no seed |
| `ADMIN_SEED_PASSWORD` | `vitrine-admin` | Senha do operador seed |
| `API_INTERNAL_URL` | `http://localhost:3000` | Proxy de login server-side |
| `CORS_ORIGINS` | inclui `:3002` | Origem admin na API |

## Como rodar

```bash
npm run db:migrate && npm run db:seed   # cria operador seed
npm run dev:api                          # :3000
npm run dev:admin                        # :3002
```

Abrir http://localhost:3002/login — credenciais padrão do seed acima.

## Rotas do admin

| Rota | Conteúdo |
|------|----------|
| `/login` | Tela de login |
| `/` | Dashboard com KPIs placeholder |
| `/paginas` | Lista páginas CMS + link para editor |
| `/paginas/[slug]` | Editor de blocos (`CMSBlockOrderManager`) |
| `/produtos` | Listagem + link para cadastro manual |
| `/produtos/novo` | Formulário de criação (modo híbrido) |
| `/artigos` | Empty state — hub de conteúdo |
| `/colecoes` | Empty state — coleções curadas |
| `/cupons` | Empty state — central de cupons |
| `/configuracoes` | Empty state — settings |

## Arquivos-chave

| Área | Path |
|------|------|
| App Next.js | `apps/admin/` |
| Login + shell | `apps/admin/src/components/admin/`, `apps/admin/src/components/auth/` |
| Toast global | `apps/admin/src/components/ui/admin-toast.tsx`, provider em `AdminAppProviders.tsx` |
| Auth API | `apps/api/src/adapters/http/routes/admin-routes.ts` |
| Use case | `packages/application/src/use-cases/admin-auth/AuthenticateOperator.ts` |
| Migration | `packages/infrastructure/src/persistence/drizzle/migrations/0004_operators.sql` |
| Seed operador | `packages/infrastructure/src/persistence/drizzle/seed.ts` |

## Design tokens (botões)

| Token | Valor | Uso |
|-------|-------|-----|
| `--admin-primary` | `#0d6efd` | CTA primário (`Button` default/primary, tabs ativos, chips selecionados) |
| `--admin-primary-hover` | `#0b5ed7` | Hover de CTA |
| `--admin-navy` | `#182a5a` | Texto e marca — **não** usar como fundo de botão |

Componente: `apps/admin/src/components/ui/button.tsx` (`variant="primary"` por padrão).

## Próximos passos

1. Preview draft com token
2. `PublishPage` use case + botão publicar
3. Formulários dos tipos de bloco restantes
4. Gestão de operadores (convite, desativar)

Editor de blocos: [admin-cms-blocks-phase2.md](./admin-cms-blocks-phase2.md).
