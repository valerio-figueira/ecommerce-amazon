'use client';

import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  FileText,
  Folder,
  FolderOpen,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import type { AdminCategoryTreeNode } from '@ecommerce-amazon/shared/admin';
import { cn } from '@/lib/utils';

type CategoryTreeViewProps = {
  nodes: AdminCategoryTreeNode[];
  onCreateChild: (parent: AdminCategoryTreeNode) => void;
  onEdit: (node: AdminCategoryTreeNode) => void;
  onDelete: (node: AdminCategoryTreeNode) => void;
  onReorder: (id: string, direction: 'up' | 'down') => void;
};

export function CategoryTreeView({
  nodes,
  onCreateChild,
  onEdit,
  onDelete,
  onReorder,
}: CategoryTreeViewProps): React.JSX.Element {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const defaultExpanded = useMemo(() => {
    const ids: Record<string, boolean> = {};
    function walk(branch: AdminCategoryTreeNode[]) {
      for (const node of branch) {
        if (node.subcategories?.length) {
          ids[node.id] = true;
          walk(node.subcategories);
        }
      }
    }
    walk(nodes);
    return ids;
  }, [nodes]);

  const expandedState = { ...defaultExpanded, ...expanded };

  function toggleExpanded(id: string) {
    setExpanded((current) => ({ ...current, [id]: !(expandedState[id] ?? false) }));
  }

  return (
    <ul className="category-tree" role="tree">
      {nodes
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label))
        .map((node, index) => (
          <CategoryTreeNodeRow
            key={node.id}
            node={node}
            depth={0}
            isLast={index === nodes.length - 1}
            expandedState={expandedState}
            onToggleExpanded={toggleExpanded}
            onCreateChild={onCreateChild}
            onEdit={onEdit}
            onDelete={onDelete}
            onReorder={onReorder}
          />
        ))}
    </ul>
  );
}

type CategoryTreeNodeRowProps = {
  node: AdminCategoryTreeNode;
  depth: number;
  isLast: boolean;
  expandedState: Record<string, boolean>;
  onToggleExpanded: (id: string) => void;
  onCreateChild: (parent: AdminCategoryTreeNode) => void;
  onEdit: (node: AdminCategoryTreeNode) => void;
  onDelete: (node: AdminCategoryTreeNode) => void;
  onReorder: (id: string, direction: 'up' | 'down') => void;
};

function CategoryTreeNodeRow({
  node,
  depth,
  isLast,
  expandedState,
  onToggleExpanded,
  onCreateChild,
  onEdit,
  onDelete,
  onReorder,
}: CategoryTreeNodeRowProps): React.JSX.Element {
  const hasChildren = Boolean(node.subcategories?.length);
  const isExpanded = hasChildren && (expandedState[node.id] ?? true);

  return (
    <li
      className={cn('category-tree-node', isLast && 'category-tree-node--last')}
      role="treeitem"
      aria-expanded={hasChildren ? isExpanded : undefined}
    >
      <div className="category-tree-node__row">
        <div className="category-tree-node__spine" aria-hidden />

        <button
          type="button"
          className={cn(
            'category-tree-node__toggle',
            !hasChildren && 'category-tree-node__toggle--hidden',
          )}
          aria-label={isExpanded ? 'Recolher' : 'Expandir'}
          onClick={() => onToggleExpanded(node.id)}
          disabled={!hasChildren}
        >
          <ChevronRight className={cn('size-4 transition-transform', isExpanded && 'rotate-90')} />
        </button>

        <div className="category-tree-node__icon" aria-hidden>
          {hasChildren ? (
            isExpanded ? (
              <FolderOpen className="size-4 text-[var(--admin-primary)]" />
            ) : (
              <Folder className="size-4 text-[var(--admin-primary)]" />
            )
          ) : (
            <FileText className="size-4 text-[var(--admin-text-muted)]" />
          )}
        </div>

        <div className="category-tree-node__content min-w-0 flex-1">
          <p className="truncate font-semibold text-[var(--admin-navy)]">
            {node.icon ? <span className="mr-1.5">{node.icon}</span> : null}
            {node.label}
          </p>
          <div className="category-tree-node__meta">
            <p className="truncate text-xs text-[var(--admin-text-muted)]">/{node.slug}</p>
            {hasChildren ? (
              <span className="category-tree-node__badge">
                {node.subcategories!.length}{' '}
                {node.subcategories!.length === 1 ? 'subcategoria' : 'subcategorias'}
              </span>
            ) : null}
          </div>
        </div>

        <div className="category-tree-node__actions">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 px-2 text-xs"
            onClick={() => onCreateChild(node)}
          >
            <Plus className="mr-1 size-3.5" />
            Sub
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="size-8"
            aria-label="Subir"
            onClick={() => onReorder(node.id, 'up')}
          >
            <ChevronUp className="size-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="size-8"
            aria-label="Descer"
            onClick={() => onReorder(node.id, 'down')}
          >
            <ChevronDown className="size-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 px-2 text-xs"
            onClick={() => onEdit(node)}
          >
            <Pencil className="mr-1 size-3.5" />
            Editar
          </Button>
          <Button
            type="button"
            size="sm"
            variant="destructive"
            className="h-8 px-2 text-xs"
            onClick={() => onDelete(node)}
          >
            <Trash2 className="mr-1 size-3.5" />
            Excluir
          </Button>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <ul className="category-tree category-tree--nested" role="group">
          {node.subcategories!
            .slice()
            .sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label))
            .map((child, index) => (
              <CategoryTreeNodeRow
                key={child.id}
                node={child}
                depth={depth + 1}
                isLast={index === node.subcategories!.length - 1}
                expandedState={expandedState}
                onToggleExpanded={onToggleExpanded}
                onCreateChild={onCreateChild}
                onEdit={onEdit}
                onDelete={onDelete}
                onReorder={onReorder}
              />
            ))}
        </ul>
      )}
    </li>
  );
}
