import Link from 'next/link';

import type { CategoryNavNode } from '@ecommerce-amazon/shared/category/category-tree-nav';
import { getAncestorSlugs } from '@ecommerce-amazon/shared/category/category-tree-nav';
import { cn } from '@/lib/utils';

type CategorySidebarTreeProps = {
  nodes: CategoryNavNode[];
  activeSlug: string;
};

type CategorySidebarBranchProps = {
  nodes: CategoryNavNode[];
  activeSlug: string;
  expandedSlugs: Set<string>;
  depth?: number;
};

export function CategorySidebarTree({
  nodes,
  activeSlug,
}: CategorySidebarTreeProps): React.JSX.Element {
  const expandedSlugs = new Set([...getAncestorSlugs(nodes, activeSlug), activeSlug]);

  return (
    <nav aria-label="Categorias" className="category-sidebar-tree">
      <ul className="category-sidebar-tree__list" role="tree">
        <CategorySidebarBranch
          nodes={nodes}
          activeSlug={activeSlug}
          expandedSlugs={expandedSlugs}
        />
      </ul>
    </nav>
  );
}

function CategorySidebarBranch({
  nodes,
  activeSlug,
  expandedSlugs,
  depth = 0,
}: CategorySidebarBranchProps): React.JSX.Element {
  return (
    <>
      {nodes.map((node) => {
        const hasChildren = Boolean(node.subcategories?.length);
        const isExpanded = expandedSlugs.has(node.slug);
        const isActive = node.slug === activeSlug;

        return (
          <li
            key={node.slug}
            className={cn('category-sidebar-tree__node', depth > 0 && 'category-sidebar-tree__node--nested')}
            role="treeitem"
            aria-expanded={hasChildren ? isExpanded : undefined}
            style={{ paddingLeft: `${depth * 0.85}rem` }}
          >
            <Link
              href={`/categorias/${node.slug}`}
              className={cn(
                'category-sidebar-tree__link',
                isActive && 'category-sidebar-tree__link--active',
              )}
            >
              {node.icon ? <span className="mr-1.5">{node.icon}</span> : null}
              <span className="truncate">{node.label}</span>
            </Link>

            {hasChildren && isExpanded && (
              <ul className="category-sidebar-tree__list" role="group">
                <CategorySidebarBranch
                  nodes={node.subcategories!}
                  activeSlug={activeSlug}
                  expandedSlugs={expandedSlugs}
                  depth={depth + 1}
                />
              </ul>
            )}
          </li>
        );
      })}
    </>
  );
}
