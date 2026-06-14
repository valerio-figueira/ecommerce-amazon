import type { LucideIcon } from 'lucide-react';
import {
  FileStack,
  FolderTree,
  Layers,
  LayoutDashboard,
  Link2,
  Newspaper,
  Package,
  Settings,
  Ticket,
} from 'lucide-react';

export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { href: '/', label: 'Painel', icon: LayoutDashboard },
  { href: '/paginas', label: 'Páginas', icon: FileStack },
  { href: '/produtos', label: 'Produtos', icon: Package },
  { href: '/categorias', label: 'Categorias', icon: FolderTree },
  { href: '/artigos', label: 'Artigos', icon: Newspaper },
  { href: '/auto-links', label: 'Auto-Links', icon: Link2 },
  { href: '/colecoes', label: 'Coleções', icon: Layers },
  { href: '/cupons', label: 'Cupons', icon: Ticket },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
];

export type AdminBreadcrumb = {
  label: string;
  href?: string;
};
