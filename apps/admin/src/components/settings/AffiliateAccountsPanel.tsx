'use client';

import { Link2, Plus, ShieldCheck, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
  createAffiliateAccountClient,
  deleteAffiliateAccountClient,
  listAffiliateAccountsClient,
  updateAffiliateAccountClient,
} from '@/lib/api/affiliate-accounts-client';
import type { AffiliateAccountDto } from '@ecommerce-amazon/shared/admin';

const MARKETPLACE_LABELS: Record<string, string> = {
  amazon_br: 'Amazon BR',
  shopee_br: 'Shopee BR',
  mercadolivre_br: 'Mercado Livre BR',
};

const ALL_MARKETPLACES = ['amazon_br', 'shopee_br', 'mercadolivre_br'] as const;

const TEXTAREA_CLASS =
  'flex min-h-[80px] w-full rounded-md border border-[var(--admin-border)] bg-white px-3 py-2 text-sm text-[var(--admin-text)] shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-primary)]';

const STATUS_LABELS: Record<string, string> = {
  pending_manual_validation: 'Pendente de validação',
  active: 'Ativa',
  suspended: 'Suspensa',
};

function statusClass(status: string): string {
  if (status === 'active') return 'cms-status-pill is-published';
  if (status === 'suspended') return 'cms-status-pill is-draft';
  return 'cms-status-pill';
}

type AffiliateAccountsPanelProps = {
  initialItems: AffiliateAccountDto[];
  canManage: boolean;
};

export function AffiliateAccountsPanel({
  initialItems,
  canManage,
}: AffiliateAccountsPanelProps): React.JSX.Element {
  const adminToast = useAdminToast();
  const [items, setItems] = useState(initialItems);
  const [validateTarget, setValidateTarget] = useState<AffiliateAccountDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AffiliateAccountDto | null>(null);
  const [validationNotes, setValidationNotes] = useState('');
  const [checklistConfirmed, setChecklistConfirmed] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [newMarketplace, setNewMarketplace] = useState<string>('');
  const [newTag, setNewTag] = useState('');
  const [creating, setCreating] = useState(false);

  const availableMarketplaces = useMemo(
    () => ALL_MARKETPLACES.filter((mp) => !items.some((item) => item.marketplace === mp)),
    [items],
  );

  async function refresh(): Promise<void> {
    const next = await listAffiliateAccountsClient();
    setItems(next);
  }

  async function saveTag(account: AffiliateAccountDto, affiliateTag: string): Promise<void> {
    if (!canManage) return;
    setSavingId(account.id);
    try {
      await updateAffiliateAccountClient(account.id, { affiliateTag });
      adminToast.success('Tag afiliado atualizada.');
      await refresh();
    } catch (error) {
      adminToast.error(error instanceof Error ? error.message : 'Falha ao salvar tag');
    } finally {
      setSavingId(null);
    }
  }

  async function toggleSuspend(account: AffiliateAccountDto): Promise<void> {
    if (!canManage) return;
    setSavingId(account.id);
    try {
      const nextStatus = account.status === 'suspended' ? 'active' : 'suspended';
      if (nextStatus === 'active') {
        await updateAffiliateAccountClient(account.id, {
          status: 'active',
          checklistConfirmed: true,
        });
      } else {
        await updateAffiliateAccountClient(account.id, { status: 'suspended' });
      }
      adminToast.success(nextStatus === 'suspended' ? 'Conta suspensa.' : 'Conta reativada.');
      await refresh();
    } catch (error) {
      adminToast.error(error instanceof Error ? error.message : 'Falha ao atualizar status');
    } finally {
      setSavingId(null);
    }
  }

  async function confirmValidation(): Promise<void> {
    if (!validateTarget || !canManage) return;
    setSavingId(validateTarget.id);
    try {
      await updateAffiliateAccountClient(validateTarget.id, {
        status: 'active',
        validationNotes: validationNotes.trim() || null,
        checklistConfirmed: true,
      });
      adminToast.success('Conta validada e ativada.');
      setValidateTarget(null);
      setValidationNotes('');
      setChecklistConfirmed(false);
      await refresh();
    } catch (error) {
      adminToast.error(error instanceof Error ? error.message : 'Falha ao validar conta');
    } finally {
      setSavingId(null);
    }
  }

  async function confirmDelete(): Promise<void> {
    if (!deleteTarget || !canManage) return;
    setSavingId(deleteTarget.id);
    try {
      await deleteAffiliateAccountClient(deleteTarget.id);
      adminToast.success('Conta de afiliado excluída.');
      setDeleteTarget(null);
      await refresh();
    } catch (error) {
      adminToast.error(error instanceof Error ? error.message : 'Falha ao excluir conta');
    } finally {
      setSavingId(null);
    }
  }

  async function handleCreate(): Promise<void> {
    if (!canManage || !newMarketplace || !newTag.trim()) return;
    setCreating(true);
    try {
      await createAffiliateAccountClient({
        marketplace: newMarketplace as 'amazon_br' | 'shopee_br' | 'mercadolivre_br',
        affiliateTag: newTag.trim(),
      });
      adminToast.success('Conta de afiliado criada.');
      setSheetOpen(false);
      setNewMarketplace('');
      setNewTag('');
      await refresh();
    } catch (error) {
      adminToast.error(error instanceof Error ? error.message : 'Falha ao criar conta');
    } finally {
      setCreating(false);
    }
  }

  function openCreateSheet(): void {
    setNewMarketplace(availableMarketplaces[0] ?? '');
    setNewTag('');
    setSheetOpen(true);
  }

  return (
    <div className="cms-float-panel cms-blocks-panel">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="cms-blocks-panel__meta">
          Gate de escala · <strong>{items.length} contas</strong>
        </p>
        {canManage && availableMarketplaces.length > 0 ? (
          <Button type="button" size="sm" onClick={openCreateSheet}>
            <Plus className="mr-2 h-4 w-4" />
            Nova conta
          </Button>
        ) : null}
      </div>
      <p className="mb-4 text-sm text-[var(--admin-text-muted)]">
        Contas pendentes bloqueiam redirecionamentos `/go`, batch checkout e indexação (quando o
        gate SEO estiver ativo). Uma conta por marketplace.
      </p>
      <div className="cms-block-list space-y-3">
        {items.map((account) => (
          <AffiliateAccountCard
            key={account.id}
            account={account}
            canManage={canManage}
            saving={savingId === account.id}
            onSaveTag={(tag) => void saveTag(account, tag)}
            onValidate={() => {
              setValidateTarget(account);
              setValidationNotes(account.validationNotes ?? '');
              setChecklistConfirmed(false);
            }}
            onToggleSuspend={() => void toggleSuspend(account)}
            onDelete={() => setDeleteTarget(account)}
          />
        ))}
      </div>

      <AlertDialog open={validateTarget !== null} onOpenChange={(open) => !open && setValidateTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Validar conta de afiliado</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-left text-sm text-[var(--admin-text-muted)]">
                <p>Confirme o checklist PRD antes de promover para ativa:</p>
                <ul className="list-disc space-y-1 pl-5">
                  <li>Tag/id afiliado correto e ativo no marketplace</li>
                  <li>URL do site declarada na rede = domínio de produção</li>
                  <li>Política de privacidade e disclaimer publicados</li>
                  <li>Teste de atribuição de clique realizado</li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="validation-notes">Notas de evidência (opcional)</Label>
              <textarea
                id="validation-notes"
                className={TEXTAREA_CLASS}
                value={validationNotes}
                onChange={(event) => setValidationNotes(event.target.value)}
                rows={3}
              />
            </div>
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                className="mt-1"
                checked={checklistConfirmed}
                onChange={(event) => setChecklistConfirmed(event.target.checked)}
              />
              <span>Confirmo que o checklist de validação manual foi concluído.</span>
            </label>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={!checklistConfirmed || savingId !== null}
              onClick={(event) => {
                event.preventDefault();
                void confirmValidation();
              }}
            >
              Ativar conta
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir conta de afiliado</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `Remover a conta ${MARKETPLACE_LABELS[deleteTarget.marketplace] ?? deleteTarget.marketplace}? Redirecionamentos e batch checkout para este marketplace deixarão de funcionar até uma nova conta ser cadastrada.`
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={savingId !== null}
              onClick={(event) => {
                event.preventDefault();
                void confirmDelete();
              }}
            >
              Excluir conta
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Nova conta de afiliado</SheetTitle>
            <SheetDescription>
              A conta é criada como pendente de validação manual. Após o checklist PRD, ative-a no
              painel.
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Marketplace</Label>
              <Select value={newMarketplace} onValueChange={setNewMarketplace}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o marketplace" />
                </SelectTrigger>
                <SelectContent>
                  {availableMarketplaces.map((marketplace) => (
                    <SelectItem key={marketplace} value={marketplace}>
                      {MARKETPLACE_LABELS[marketplace]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-affiliate-tag">Tag / ID afiliado</Label>
              <Input
                id="new-affiliate-tag"
                value={newTag}
                onChange={(event) => setNewTag(event.target.value)}
                placeholder="Ex.: vitrine-21"
              />
            </div>
          </div>
          <SheetFooter>
            <Button
              type="button"
              onClick={() => void handleCreate()}
              disabled={creating || !newMarketplace || !newTag.trim()}
            >
              {creating ? 'Criando…' : 'Criar conta'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

type AffiliateAccountCardProps = {
  account: AffiliateAccountDto;
  canManage: boolean;
  saving: boolean;
  onSaveTag: (tag: string) => void;
  onValidate: () => void;
  onToggleSuspend: () => void;
  onDelete: () => void;
};

function AffiliateAccountCard({
  account,
  canManage,
  saving,
  onSaveTag,
  onValidate,
  onToggleSuspend,
  onDelete,
}: AffiliateAccountCardProps): React.JSX.Element {
  const [tag, setTag] = useState(account.affiliateTag);

  return (
    <article className="cms-block-card cms-block-card--plain p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-medium text-[var(--admin-text)]">
            <Link2 className="mr-2 inline h-4 w-4" />
            {MARKETPLACE_LABELS[account.marketplace] ?? account.marketplace}
          </h3>
          <span className={`mt-2 inline-flex ${statusClass(account.status)}`}>
            {STATUS_LABELS[account.status] ?? account.status}
          </span>
          {account.validatedBy ? (
            <p className="mt-2 text-xs text-[var(--admin-text-muted)]">
              Validada por {account.validatedBy}
              {account.validatedAt ? ` em ${new Date(account.validatedAt).toLocaleString('pt-BR')}` : ''}
            </p>
          ) : null}
        </div>
        {canManage ? (
          <div className="flex flex-wrap gap-2">
            {account.status === 'pending_manual_validation' ? (
              <Button type="button" size="sm" onClick={onValidate} disabled={saving}>
                <ShieldCheck className="mr-2 h-4 w-4" />
                Validar conta
              </Button>
            ) : null}
            {account.status === 'active' || account.status === 'suspended' ? (
              <Button type="button" size="sm" variant="outline" onClick={onToggleSuspend} disabled={saving}>
                {account.status === 'suspended' ? 'Reativar' : 'Suspender'}
              </Button>
            ) : null}
            <Button type="button" size="sm" variant="destructive" onClick={onDelete} disabled={saving}>
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </Button>
          </div>
        ) : null}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
        <div className="space-y-2">
          <Label htmlFor={`tag-${account.id}`}>Tag / ID afiliado</Label>
          <Input
            id={`tag-${account.id}`}
            value={tag}
            disabled={!canManage || saving}
            onChange={(event) => setTag(event.target.value)}
          />
        </div>
        {canManage ? (
          <Button
            type="button"
            size="sm"
            disabled={saving || tag.trim() === account.affiliateTag}
            onClick={() => onSaveTag(tag.trim())}
          >
            Salvar tag
          </Button>
        ) : null}
      </div>

      {account.validationNotes ? (
        <p className="mt-3 text-xs text-[var(--admin-text-muted)]">
          Notas: {account.validationNotes}
        </p>
      ) : null}
    </article>
  );
}
