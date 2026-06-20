# Imagens remotas — vitrine e admin

Tratamento de URLs de imagem (uploads gerenciados, CDN e hosts de dev) sem quebrar páginas em runtime.

## Por quê

Avatares de operador e mídia enviada pelo admin ficam em `STORAGE_PUBLIC_BASE_URL` (ex.: `http://localhost:3000/uploads/...`). O `next/image` da vitrine só aceita hosts listados em `images.remotePatterns`. Sem isso, a página quebra com:

`Invalid src prop ... hostname "localhost" is not configured`

Quando a API está parada, imagens e fetches analíticos também devem degradar com fallback — não derrubar a UI.

## O quê foi entregue

### Vitrine (`apps/web`)

- `next.config.ts` — `remotePatterns` derivados de `NEXT_PUBLIC_API_URL`, `STORAGE_PUBLIC_BASE_URL` e origens de dev.
- `RemoteImage` (`src/components/ui/RemoteImage.tsx`) — usa `next/image` quando o host está na allowlist; caso contrário, `<img>` nativo. Em `onError`, oculta a imagem (ou renderiza `fallback`).
- Todos os usos de `next/image` na vitrine passaram a usar `RemoteImage`.

### Admin (`apps/admin`)

- `ManagedImage` — `<img>` com `onError` e fallback opcional (pré-visualizações de capa).
- Avatares (`AdminUserMenu`, `ProfileAvatarPanel`) — voltam para iniciais se a foto não carregar.
- `ProductThumbnail` — aceita `http://` (uploads locais) além de `https://`.
- Dashboard (`/`) — `loadDashboardAnalytics()` com fetch seguro; banner amarelo quando a API não responde (layout do shell já tratava falha de perfil).

### Shared (`packages/shared`)

- `buildNextImageRemotePatterns`, `isNextImageRemoteUrl` — lógica reutilizável e testada (`next-image/remote-patterns.test.ts`).

## Arquivos-chave

| Caminho                                             | Papel                                                                 |
| --------------------------------------------------- | --------------------------------------------------------------------- |
| `packages/shared/src/next-image/remote-patterns.ts` | Allowlist e matcher de URL                                            |
| `apps/web/next-image-config.ts`                     | Patterns para `next.config` (sem import de subpath no loader do Next) |
| `apps/web/src/components/ui/RemoteImage.tsx`        | Componente resiliente na vitrine                                      |
| `apps/admin/src/components/ui/ManagedImage.tsx`     | Imagens com fallback no admin                                         |
| `apps/admin/src/lib/api/analytics.ts`               | `loadDashboardAnalytics()`                                            |

## Env relevantes

| Variável                   | Uso                            |
| -------------------------- | ------------------------------ |
| `NEXT_PUBLIC_API_URL`      | Host da API / uploads em dev   |
| `STORAGE_PUBLIC_BASE_URL`  | Base pública S3/GCS/filesystem |
| `NEXT_ALLOWED_DEV_ORIGINS` | IPs LAN extras no dev          |

`apps/web` expõe `NEXT_PUBLIC_STORAGE_PUBLIC_BASE_URL` no build a partir de `STORAGE_PUBLIC_BASE_URL`.

## Como testar

```bash
# Build + testes unitários dos patterns
npm run build -w @ecommerce-amazon/shared
npm run test:unit -- packages/shared/src/next-image/remote-patterns.test.ts
npm run build -w @ecommerce-amazon/web
npm run build -w @ecommerce-amazon/admin
```

1. Com API rodando, abra um artigo com autor que tenha avatar (`/artigos/[slug]`) — foto deve aparecer sem erro de hostname.
2. Pare a API (`docker compose stop` ou não subir `apps/api`) e recarregue o dashboard admin — deve mostrar banner de indisponibilidade, não tela de erro.
3. Com avatar cadastrado e API parada, o menu do operador deve mostrar iniciais em vez de imagem quebrada.

## Próximos passos (não implementados)

- Placeholder visual unificado (silhueta) em `RemoteImage`/`ManagedImage` quando `fallback` não for passado.
- Rewrites na vitrine para servir `/uploads/*` via proxy interno (menos dependência de host absoluto em produção).
