# Páginas legais (LGPD e afiliados)

Página pública `/legal` com política de privacidade, termos de uso, divulgação de afiliados e política de cookies — requisito do PRD para aprovação de contas de afiliado e conformidade LGPD.

## Por quê

- Checklist de go-live afiliado exige política de privacidade e disclaimer publicados ([PRD Core](../.cursor/plans/prd_plataforma_afiliação_de44933f.plan.md) §4.2).
- Regras de negócio: opt-in explícito para alertas, cookie de wishlist anônima, links comerciais transparentes ([`.cursor/rules/01-business-compliance.mdc`](../.cursor/rules/01-business-compliance.mdc)).
- O rodapé da vitrine já apontava para `/legal`; esta entrega implementa a rota.

## O que foi entregue

| Seção (âncora) | Conteúdo                                                                            |
| -------------- | ----------------------------------------------------------------------------------- |
| `#privacidade` | LGPD: dados coletados, bases legais, compartilhamento, direitos, contato            |
| `#termos`      | Natureza da vitrine, preços stale 24h, uso permitido, limitação de responsabilidade |
| `#afiliados`   | Amazon Associados / Shopee Afiliados, CTAs transparentes, `/go/`                    |
| `#cookies`     | Cookie `vitrine_session`, analytics futuro com consentimento                        |

Conteúdo parametrizado por [`BrandConfig`](../packages/shared/src/config/brand.ts) (`name`, `legalName`, `contactEmail`, `url`).

## Arquivos-chave

| Artefato            | Path                                                                                                          |
| ------------------- | ------------------------------------------------------------------------------------------------------------- |
| Conteúdo + metadata | [`packages/shared/src/legal/legal-content.ts`](../packages/shared/src/legal/legal-content.ts)                 |
| Testes              | [`packages/shared/src/legal/legal-content.test.ts`](../packages/shared/src/legal/legal-content.test.ts)       |
| Página Next.js      | [`apps/web/src/app/legal/page.tsx`](../apps/web/src/app/legal/page.tsx)                                       |
| UI                  | [`apps/web/src/components/legal/LegalPageContent.tsx`](../apps/web/src/components/legal/LegalPageContent.tsx) |
| Link no rodapé      | [`apps/web/src/components/layout/Footer.tsx`](../apps/web/src/components/layout/Footer.tsx)                   |
| Sitemap estático    | [`apps/web/src/app/sitemap.ts`](../apps/web/src/app/sitemap.ts) — inclui `/legal`                             |

## Import

```typescript
import { buildLegalPageContent, buildLegalPageMetadata } from '@ecommerce-amazon/shared/legal';
import { getBrandConfig } from '@ecommerce-amazon/shared/config/brand';

const brand = getBrandConfig();
const content = buildLegalPageContent(brand);
```

## Env vars relevantes

| Variável             | Uso na página legal            |
| -------------------- | ------------------------------ |
| `SITE_NAME`          | Nome público no texto          |
| `COMPANY_LEGAL_NAME` | Controlador LGPD               |
| `CONTACT_EMAIL`      | Canal de privacidade/dúvidas   |
| `WEB_PUBLIC_URL`     | URL canônica e links absolutos |

## Como testar

```bash
npm run build -w @ecommerce-amazon/shared
npm test -w @ecommerce-amazon/shared -- src/legal/legal-content.test.ts
# Com apps/web rodando:
curl -sI http://localhost:3001/legal | head
```

Abrir `/legal` no browser: sumário com âncoras, data de atualização, copy pt-BR.

## Fora de escopo (próximas fases)

- Banner de cookies + Google Consent Mode v2 (mencionado na política como futuro)
- Formulário de alertas de preço na vitrine (API já existe; exclusão via e-mail)
- Páginas legais separadas por URL (`/legal/privacidade`) — hub único `/legal` atende o link do footer

## Próximos passos

1. Ativar banner de cookies quando GA4 for integrado na vitrine.
2. Revisão jurídica humana antes de go-live em produção (texto é template editorial, não parecer legal).
