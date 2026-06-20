# Quick wins mobile — vitrine (`apps/web`)

## O quê

Correções de layout e responsividade na vitrine pública para telas estreitas (320–430px), sem novas features.

**Entregue:**

- Grid de produtos em categorias: 1 coluna no mobile (`sm:grid-cols-2` a partir de 640px)
- Link **Artigos** no footer + seção **Explorar** no drawer de categorias
- CTA afiliado fixo no rodapé da página de produto (`<md`)
- Utility `pb-safe` + `viewportFit: cover` para safe-area iOS
- Thumbnails da galeria com scroll horizontal
- Breadcrumb do detalhe com scroll horizontal
- Tipografia mínima 12px nos CTAs compactos de cards

**Fora do escopo:** busca no header, bottom tab bar, touch targets 44px, placeholder de preço stale.

## Por quê

Auditoria mobile identificou cards espremidos em grid 2 colunas, hub editorial inacessível abaixo de 640px e perda do CTA de conversão ao rolar páginas longas de produto. Alinhado a [06-ux-conversion.mdc](../.cursor/rules/06-ux-conversion.mdc) (CTA full-width mobile, cenário A/B).

## Como funciona

```mermaid
flowchart LR
  subgraph mobile [Mobile lt md]
    Drawer[Drawer categorias + Explorar]
    Footer[Footer com Artigos]
    StickyCta[CTA fixo detalhe produto]
  end
  subgraph layout [Layout]
    Grid1Col[Grid 1 col categorias]
    SafeArea[pb-safe + viewportFit cover]
  end
  Drawer --> Artigos[/artigos]
  Footer --> Artigos
  StickyCta --> GoRedirect[/go]
```

### Grid de categorias

`grid-cols-2` até 549px → `min-[550px]:grid-cols-3` → `min-[830px]:grid-cols-4`, com `ProductCard variant="compact"`.

### Navegação editorial

- [`Footer.tsx`](../apps/web/src/components/layout/Footer.tsx): link `/artigos`
- [`CategoryCatalogDrawer.tsx`](../apps/web/src/components/layout/CategoryCatalogDrawer.tsx): seção "Explorar" com Artigos e Sobre; overlay/painel renderizados via **portal** em `document.body` (evita recorte pelo `backdrop-blur` do header)

### CTA sticky no detalhe

[`ProductDetailStickyCta.tsx`](../apps/web/src/components/product/ProductDetailStickyCta.tsx): barra `fixed bottom-0`, `md:hidden`, reutiliza `AffiliateGoLink` com `placement=PRODUCT_DETAIL_CTA`. O `<main>` da página ganha `pb-28` no mobile para não ocultar conteúdo atrás da barra.

Comportamento com preço stale: mesmo CTA "Ver preço na {marketplace}" (sem valor numérico), conforme compliance.

### Safe-area

- Classe `.pb-safe` em [`globals.css`](../apps/web/src/app/globals.css)
- `export const viewport` com `viewportFit: 'cover'` em [`layout.tsx`](../apps/web/src/app/layout.tsx)
- Aplicado no cookie banner, CTA sticky e padding inferior do drawer de categorias

## Arquivos-chave

| Arquivo                                                      | Mudança                                         |
| ------------------------------------------------------------ | ----------------------------------------------- |
| `apps/web/src/app/categorias/[slug]/page.tsx`                | Grid 1 col mobile                               |
| `apps/web/src/components/loading/ProductGridSkeleton.tsx`    | Skeleton alinhado                               |
| `apps/web/src/components/layout/Footer.tsx`                  | Link Artigos                                    |
| `apps/web/src/components/layout/CategoryCatalogDrawer.tsx`   | Seção Explorar                                  |
| `apps/web/src/components/product/ProductDetailStickyCta.tsx` | Novo componente                                 |
| `apps/web/src/app/produtos/[slug]/page.tsx`                  | Sticky CTA, breadcrumb scroll, padding inferior |
| `apps/web/src/components/product/ProductImageGallery.tsx`    | Thumbnails scroll                               |
| `apps/web/src/components/product/ProductCardActions.tsx`     | `text-xs` em compact                            |
| `apps/web/src/app/globals.css`                               | `.pb-safe`, drawer safe-area                    |
| `apps/web/src/app/layout.tsx`                                | Viewport export                                 |
| `apps/web/src/components/legal/CookieConsentProvider.tsx`    | `pb-safe` no banner                             |

## Como testar

```bash
pnpm --filter @ecommerce-amazon/web lint
pnpm --filter @ecommerce-amazon/web build
```

DevTools — viewports 360px, 375px, 390px:

1. `/categorias/{slug}` — 1 card por linha; CTAs legíveis
2. Menu categorias (mobile) — links Artigos e Sobre no fim do drawer
3. Footer — link Artigos visível
4. `/produtos/{slug}` — rolar até o fim; CTA fixo visível; breadcrumb não quebra layout
5. Produto com 5+ imagens — thumbnails com scroll horizontal
6. iPhone com notch (simulador) — cookie banner e CTA sticky acima do home indicator

## Próximos passos (não implementados)

- Busca funcional no header
- Grid 2 col em `CategoryBentoGrid` / `CuratedCollectionSlide` (impacto menor)
- Placeholder visual quando preço stale em grids
- Touch targets 44px em ícones do header
- Sticky CTA em embeds editoriais longos
