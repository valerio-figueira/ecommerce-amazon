'use client';

import { Plus, Users } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useAdminToast } from '@/components/ui/admin-toast';
import {
  createOperatorClient,
  listOperatorsClient,
  updateOperatorAccessClient,
} from '@/lib/api/operators-client';
import type { OperatorSummary } from '@ecommerce-amazon/shared/admin';

import { ChangePasswordForm } from './ChangePasswordForm';

type OperatorsPanelProps = {
  initialItems: OperatorSummary[];
};

export function OperatorsPanel({ initialItems }: OperatorsPanelProps): React.JSX.Element {
  const adminToast = useAdminToast();
  const [items, setItems] = useState(initialItems);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'editor'>('editor');
  const [saving, setSaving] = useState(false);

  async function refresh(): Promise<void> {
    const next = await listOperatorsClient();
    setItems(next);
  }

  async function handleCreate(): Promise<void> {
    setSaving(true);
    try {
      await createOperatorClient({ email, name, password, role });
      adminToast.success('Operador criado.');
      setSheetOpen(false);
      setEmail('');
      setName('');
      setPassword('');
      setRole('editor');
      await refresh();
    } catch (error) {
      adminToast.error(error instanceof Error ? error.message : 'Falha ao criar operador');
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(operator: OperatorSummary): Promise<void> {
    try {
      await updateOperatorAccessClient(operator.id, {
        status: operator.status === 'active' ? 'disabled' : 'active',
      });
      adminToast.success('Status do operador atualizado.');
      await refresh();
    } catch (error) {
      adminToast.error(error instanceof Error ? error.message : 'Falha ao atualizar operador');
    }
  }

  async function changeRole(operator: OperatorSummary, nextRole: 'admin' | 'editor'): Promise<void> {
    try {
      await updateOperatorAccessClient(operator.id, { role: nextRole });
      adminToast.success('Papel do operador atualizado.');
      await refresh();
    } catch (error) {
      adminToast.error(error instanceof Error ? error.message : 'Falha ao atualizar papel');
    }
  }

  return (
    <div className="cms-float-panel cms-blocks-panel">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="cms-blocks-panel__meta">
          Equipe CMS · <strong>{items.length} operadores</strong>
        </p>
        <div className="flex flex-wrap gap-2">
          <ChangePasswordForm />
          <Button type="button" size="sm" onClick={() => setSheetOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Convidar operador
          </Button>
        </div>
      </div>

      <div className="cms-block-list space-y-3">
        {items.map((operator) => (
          <article key={operator.id} className="cms-block-card cms-block-card--plain p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-medium text-[var(--admin-text)]">
                  <Users className="mr-2 inline h-4 w-4" />
                  {operator.name}
                </h3>
                <p className="text-sm text-[var(--admin-text-muted)]">{operator.email}</p>
                <p className="mt-2 text-xs text-[var(--admin-text-muted)]">
                  {operator.role === 'admin' ? 'Administrador' : 'Editor'} ·{' '}
                  {operator.status === 'active' ? 'Ativo' : 'Inativo'}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Select
                  value={operator.role}
                  onValueChange={(value: 'admin' | 'editor') => void changeRole(operator, value)}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => void toggleStatus(operator)}
                >
                  {operator.status === 'active' ? 'Desativar' : 'Ativar'}
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Convidar operador</SheetTitle>
            <SheetDescription>
              Crie uma conta com senha temporária. O operador deve trocar a senha no primeiro acesso.
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="operator-name">Nome</Label>
              <Input id="operator-name" value={name} onChange={(event) => setName(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="operator-email">E-mail</Label>
              <Input
                id="operator-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="operator-password">Senha temporária</Label>
              <Input
                id="operator-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Papel</Label>
              <Select value={role} onValueChange={(value: 'admin' | 'editor') => setRole(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <SheetFooter>
            <Button type="button" onClick={() => void handleCreate()} disabled={saving}>
              {saving ? 'Criando…' : 'Criar operador'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
