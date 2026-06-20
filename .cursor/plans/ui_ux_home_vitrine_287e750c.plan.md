---
name: UI/UX Home Vitrine
overview: Home totalmente customizável via CMS (page builder por blocos). Fase 1 = PageRenderer + API GET /pages/:slug + seed ESTORE; Admin apps/admin em fase posterior.
todos:
  - id: cms-domain
    content: 'Modelar PageLayout + PageBlock + BlockType enum + Zod por tipo de bloco'
    status: pending
  - id: cms-api-read
    content: GET /pages/:slug + seed layout home ESTORE + cache Redis
    status: pending
  - id: scaffold-web
    content: apps/web com PageRenderer + BlockRegistry (Next + Tailwind + shadcn)
    status: pending
  - id: block-components
    content: 'Blocos: hero_carousel, featured_product, product_grid, category_pills, hero_split, rich_text, banner, spacer'
    status: pending
  - id: api-gaps
    content: GET /categories, wishlist DTO, sort products, CORS_ORIGINS
    status: pending
  - id: wishlist-session
    content: Session + WishlistDrawer + click tracking
    status: pending
  - id: admin-cms-phase
    content: 'Fase 3: apps/admin CRUD, reorder, preview, publish (não fase 1)'
    status: pending
isProject: false
---

# UI/UX Home — CMS Page Builder

**Documento completo:** [`.cursor/plans/ui_home_vitrine.plan.md`](../../Documents/ecommerce-amazon/.cursor/plans/ui_home_vitrine.plan.md) no workspace.

## Mudança principal vs plano anterior

A Home **não** usa seções React fixas (`HeroCarousel.tsx` acoplado à page). Usa:

1. **`PageLayout`** persistido (slug `home`, status `published`)
2. **`PageBlock[]`** ordenados por `sortOrder`, cada um com `type` + `props` JSON
3. **`PageRenderer`** no front mapeia `type` → componente via **BlockRegistry**
4. **Admin CMS** (fase 3) edita ordem, tipos e props — sem redeploy

## Blocos iniciais (catálogo extensível)

`hero_carousel`, `featured_product`, `product_grid`, `category_pills`, `hero_split`, `curated_collection`, `coupon_strip`, `rich_text`, `banner`, `spacer`

Props guardam **referências** ao catálogo (`productSlug`, `categorySlug`); preços/ratings vêm da API de produtos em runtime.

## Fases

| Fase  | Entrega                                       |
| ----- | --------------------------------------------- |
| **1** | API leitura + seed ESTORE + web PageRenderer  |
| **2** | Detalhe, artigos, coleções                    |
| **3** | `apps/admin` — CRUD, drag-drop, draft/publish |

Ver plano completo no workspace para wireframe seed, contrato API Admin e critérios de aceite.
