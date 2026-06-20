# CMS — Grade Bento de Categorias

Bloco `category_bento_grid`: grade assimétrica (layout bento) de cards de categoria com imagem, título e subtítulo — inspirada em vitrines de marketplace.

Plano relacionado: [cms_forms_fase_1](../.cursor/plans/cms_forms_fase_1_30663f90.plan.md)

## O quê

- Novo `BlockType.CATEGORY_BENTO_GRID` (`category_bento_grid`)
- Grid responsivo 2 colunas (mobile) / 4 colunas (desktop)
- Cards **pequenos** (1 coluna) e **grandes** (2 colunas) configuráveis
- Ação ao clicar: nenhuma, filtrar categoria na página ou abrir link
- Formulário admin com cards repetíveis (colapsáveis por padrão)

## Schema (Zod)

```typescript
// packages/shared/src/cms/block-schemas.ts
categoryBentoTileSchema = {
  title: string,
  subtitle?: string,
  imageUrl: url,
  href?: string,
  categorySlug?: string,
  size: 'small' | 'large',
}

categoryBentoGridPropsSchema = {
  title: string,
  tiles: tile[] // min 1, max 8
}
```

## Arquivos-chave

| Camada       | Path                                                                  |
| ------------ | --------------------------------------------------------------------- |
| Enum         | `packages/domain/src/enums/cms.ts`                                    |
| Schema       | `packages/shared/src/cms/block-schemas.ts`                            |
| Migration    | `packages/infrastructure/.../migrations/0005_category_bento_grid.sql` |
| Web UI       | `apps/web/src/components/blocks/CategoryBentoGrid.tsx`                |
| Web block    | `apps/web/src/components/blocks/CategoryBentoGridBlock.tsx`           |
| Registry web | `apps/web/src/components/cms/BlockRegistry.tsx`                       |
| Admin form   | `apps/admin/src/components/cms/props-forms/CategoryBentoGridForm.tsx` |
| Seed home    | `packages/infrastructure/src/persistence/drizzle/seed.ts`             |

## Layout sugerido (6 cards)

Padrão visual da referência em grade 4 colunas:

```
[ Grande ][ Peq ][ Peq ]
[ Peq    ][ Peq ][ Grande ]
```

Alterne `size: 'large'` e `size: 'small'` no admin para reproduzir o efeito.

## Filtro de categoria

Tiles com `categorySlug` usam `CategoryFilterProvider` (mesmo contexto das pills). Grades de produtos na mesma página reagem ao clique.

## Como testar

```bash
npm run db:migrate
npm run db:seed   # banco novo; home já inclui bloco bento
npm run dev:api
npm run dev:web
npm run dev:admin
```

1. Home → ver seção **Categorias populares** com cards bento
2. Admin → `/paginas/home` → **Configurar** bloco **Grade Bento de Categorias**
3. Adicionar/remover cards, alternar tamanhos, salvar e recarregar vitrine

```bash
npm run lint --workspace=@ecommerce-amazon/admin
npm run build --workspace=@ecommerce-amazon/web
npm run build --workspace=@ecommerce-amazon/admin
```

## Imagens externas (Next.js)

O bloco usa `next/image` na vitrine (`apps/web`). Hosts de imagem precisam estar em `apps/web/next.config.ts` → `images.remotePatterns`.

Já configurados: `placehold.co`, `images.pexels.com` (testes). Para outro CDN, adicione o hostname e reinicie `npm run dev:web`:

```typescript
{ protocol: 'https', hostname: 'seu-cdn.exemplo.com' },
```

## Próximos passos (opcional)

- Preencher subtítulo com contagem real de produtos (`GET /categories`)
- Imagens default por categoria no seed/API
- Vínculo explícito com bloco `PRODUCT_GRID` (como pills)
