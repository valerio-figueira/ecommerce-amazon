'use client';

import { Plug, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAdminToast } from '@/components/ui/admin-toast';
import {
  deleteMarketplaceCredentialsClient,
  listMarketplaceCredentialsClient,
  saveMarketplaceCredentialsClient,
  testMarketplaceConnectivityClient,
} from '@/lib/api/marketplace-credentials-client';
import type {
  AffiliateAccountDto,
  MarketplaceCredentialStatusDto,
} from '@ecommerce-amazon/shared/admin';

import { MaskedSecretInput } from './MaskedSecretInput';

type MarketplaceIntegrationsPanelProps = {
  initialItems: MarketplaceCredentialStatusDto[];
  affiliateAccounts: AffiliateAccountDto[];
  canManage: boolean;
  onGoToAffiliateTab?: () => void;
};

function statusClass(status: string): string {
  if (status === 'connected') return 'cms-status-pill is-published';
  if (status === 'error') return 'cms-status-pill is-draft';
  return 'cms-status-pill';
}

function statusLabel(status: string): string {
  if (status === 'connected') return 'Conectado';
  if (status === 'error') return 'Erro';
  return 'Não configurado';
}

export function MarketplaceIntegrationsPanel({
  initialItems,
  affiliateAccounts,
  canManage,
  onGoToAffiliateTab,
}: MarketplaceIntegrationsPanelProps): React.JSX.Element {
  const adminToast = useAdminToast();
  const [items, setItems] = useState(initialItems);
  const [amazonAccessKeyId, setAmazonAccessKeyId] = useState('');
  const [amazonSecretKey, setAmazonSecretKey] = useState('');
  const [shopeePartnerId, setShopeePartnerId] = useState('');
  const [shopeePartnerKey, setShopeePartnerKey] = useState('');
  const [testingMarketplace, setTestingMarketplace] = useState<string | null>(null);
  const [savingMarketplace, setSavingMarketplace] = useState<string | null>(null);
  const [lastTestOk, setLastTestOk] = useState<Record<string, boolean>>({});

  const amazonStatus = items.find((item) => item.marketplace === 'amazon_br');
  const shopeeStatus = items.find((item) => item.marketplace === 'shopee_br');
  const amazonAffiliateTag = affiliateAccounts.find((item) => item.marketplace === 'amazon_br')
    ?.affiliateTag;

  const amazonMetadata = useMemo(() => {
    if (!amazonStatus?.publicMetadata) return null;
    return amazonStatus.publicMetadata;
  }, [amazonStatus]);

  const hasInlineAmazonCredentials = Boolean(amazonAccessKeyId.trim() && amazonSecretKey.trim());
  const hasPartialAmazonCredentials = Boolean(
    amazonAccessKeyId.trim() !== '' || amazonSecretKey.trim() !== '',
  );
  const canTestAmazon = Boolean(amazonStatus?.configured || hasInlineAmazonCredentials);

  const hasInlineShopeeCredentials = Boolean(shopeePartnerId.trim() && shopeePartnerKey.trim());
  const hasPartialShopeeCredentials = Boolean(
    shopeePartnerId.trim() !== '' || shopeePartnerKey.trim() !== '',
  );
  const canTestShopee = Boolean(shopeeStatus?.configured || hasInlineShopeeCredentials);

  useEffect(() => {
    setLastTestOk((current) => ({ ...current, amazon_br: false }));
  }, [amazonAccessKeyId, amazonSecretKey]);

  useEffect(() => {
    setLastTestOk((current) => ({ ...current, shopee_br: false }));
  }, [shopeePartnerId, shopeePartnerKey]);

  async function refresh(): Promise<void> {
    const next = await listMarketplaceCredentialsClient();
    setItems(next);
  }

  async function handleTestAmazon(): Promise<void> {
    if (!canManage) return;

    const accessKeyId = amazonAccessKeyId.trim();
    const secretAccessKey = amazonSecretKey.trim();

    if (hasPartialAmazonCredentials && !hasInlineAmazonCredentials) {
      adminToast.error(
        'Preencha Access Key e Secret Key juntos, ou deixe vazios para testar credenciais salvas.',
        'Falha no teste Amazon',
      );
      return;
    }

    if (!hasInlineAmazonCredentials && !amazonStatus?.configured) {
      adminToast.error(
        'Informe Access Key e Secret Key para testar novas credenciais.',
        'Falha no teste Amazon',
      );
      return;
    }

    setTestingMarketplace('amazon_br');
    try {
      const result = await testMarketplaceConnectivityClient(
        'amazon_br',
        hasInlineAmazonCredentials ? { accessKeyId, secretAccessKey } : undefined,
      );
      setLastTestOk((current) => ({ ...current, amazon_br: result.ok }));
      if (result.ok) {
        adminToast.success(result.message, 'Amazon PA-API conectada');
      } else {
        adminToast.error(result.message, 'Falha no teste Amazon');
      }
      await refresh();
    } catch (error) {
      adminToast.error(
        error instanceof Error ? error.message : 'Erro desconhecido',
        'Falha no teste Amazon',
      );
    } finally {
      setTestingMarketplace(null);
    }
  }

  async function handleSaveAmazon(): Promise<void> {
    if (!canManage) return;
    setSavingMarketplace('amazon_br');
    try {
      await saveMarketplaceCredentialsClient('amazon_br', {
        accessKeyId: amazonAccessKeyId.trim(),
        secretAccessKey: amazonSecretKey.trim(),
      });
      setAmazonSecretKey('');
      setLastTestOk((current) => ({ ...current, amazon_br: false }));
      adminToast.success(
        'As chaves foram criptografadas e armazenadas com segurança.',
        'Credenciais Amazon salvas',
      );
      await refresh();
    } catch (error) {
      adminToast.error(
        error instanceof Error ? error.message : 'Erro desconhecido',
        'Falha ao salvar Amazon',
      );
    } finally {
      setSavingMarketplace(null);
    }
  }

  async function handleDeleteAmazon(): Promise<void> {
    if (!canManage || !amazonStatus?.configured) return;
    setSavingMarketplace('amazon_br');
    try {
      await deleteMarketplaceCredentialsClient('amazon_br');
      adminToast.success('Credenciais Amazon removidas.');
      await refresh();
    } catch (error) {
      adminToast.error(
        error instanceof Error ? error.message : 'Erro desconhecido',
        'Falha ao remover Amazon',
      );
    } finally {
      setSavingMarketplace(null);
    }
  }

  async function handleTestShopee(): Promise<void> {
    if (!canManage) return;

    const partnerId = shopeePartnerId.trim();
    const partnerKey = shopeePartnerKey.trim();

    if (hasPartialShopeeCredentials && !hasInlineShopeeCredentials) {
      adminToast.error(
        'Preencha Partner ID e Partner Key juntos, ou deixe vazios para testar credenciais salvas.',
        'Falha no teste Shopee',
      );
      return;
    }

    if (!hasInlineShopeeCredentials && !shopeeStatus?.configured) {
      adminToast.error(
        'Informe Partner ID e Partner Key para testar novas credenciais.',
        'Falha no teste Shopee',
      );
      return;
    }

    setTestingMarketplace('shopee_br');
    try {
      const result = await testMarketplaceConnectivityClient(
        'shopee_br',
        hasInlineShopeeCredentials ? { partnerId, partnerKey } : undefined,
      );
      setLastTestOk((current) => ({ ...current, shopee_br: result.ok }));
      if (result.ok) {
        adminToast.success(result.message, 'Shopee Open API conectada');
      } else {
        adminToast.error(result.message, 'Falha no teste Shopee');
      }
      await refresh();
    } catch (error) {
      adminToast.error(
        error instanceof Error ? error.message : 'Erro desconhecido',
        'Falha no teste Shopee',
      );
    } finally {
      setTestingMarketplace(null);
    }
  }

  async function handleSaveShopee(): Promise<void> {
    if (!canManage) return;
    setSavingMarketplace('shopee_br');
    try {
      await saveMarketplaceCredentialsClient('shopee_br', {
        partnerId: shopeePartnerId.trim(),
        partnerKey: shopeePartnerKey.trim(),
      });
      setShopeePartnerKey('');
      setLastTestOk((current) => ({ ...current, shopee_br: false }));
      adminToast.success(
        'As chaves foram criptografadas e armazenadas com segurança.',
        'Credenciais Shopee salvas',
      );
      await refresh();
    } catch (error) {
      adminToast.error(
        error instanceof Error ? error.message : 'Erro desconhecido',
        'Falha ao salvar Shopee',
      );
    } finally {
      setSavingMarketplace(null);
    }
  }

  async function handleDeleteShopee(): Promise<void> {
    if (!canManage || !shopeeStatus?.configured) return;
    setSavingMarketplace('shopee_br');
    try {
      await deleteMarketplaceCredentialsClient('shopee_br');
      adminToast.success('Credenciais Shopee removidas.');
      await refresh();
    } catch (error) {
      adminToast.error(
        error instanceof Error ? error.message : 'Erro desconhecido',
        'Falha ao remover Shopee',
      );
    } finally {
      setSavingMarketplace(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="cms-float-panel cms-blocks-panel">
        <p className="cms-blocks-panel__meta">
          <Plug className="mr-1 inline h-4 w-4" />
          Integrações de marketplace · <strong>chaves de API</strong>
        </p>

        <article className="cms-block-card cms-block-card--plain mb-4 space-y-4 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-[var(--admin-text)]">Amazon PA-API</h3>
              <p className="text-xs text-[var(--admin-text-muted)]">
                Access Key e Secret Key para sincronização de preços no worker. Com credenciais
                salvas, o teste usa o cofre sem precisar recolar a secret key.
              </p>
            </div>
            <span className={statusClass(amazonStatus?.healthStatus ?? 'not_configured')}>
              {statusLabel(amazonStatus?.healthStatus ?? 'not_configured')}
            </span>
          </div>

          {amazonStatus?.healthMessage ? (
            <p className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-[var(--admin-text)]">
              {amazonStatus.healthMessage}
            </p>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="amazon-access-key">Access Key ID</Label>
              <Input
                id="amazon-access-key"
                value={amazonAccessKeyId}
                onChange={(event) => setAmazonAccessKeyId(event.target.value)}
                placeholder={
                  amazonMetadata?.['accessKeyIdLast4']
                    ? `••••${String(amazonMetadata['accessKeyIdLast4'])}`
                    : 'AKIA...'
                }
                disabled={!canManage}
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amazon-secret-key">Secret Key</Label>
              <MaskedSecretInput
                id="amazon-secret-key"
                value={amazonSecretKey}
                onChange={setAmazonSecretKey}
                placeholder={amazonStatus?.configured ? '••••••••••••••••' : 'Cole a secret key'}
                disabled={!canManage}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Associate Tag</Label>
            <div className="flex flex-wrap items-center gap-2">
              <Input value={amazonAffiliateTag ?? 'Não configurada'} readOnly disabled />
              {onGoToAffiliateTab ? (
                <Button type="button" variant="outline" size="sm" onClick={onGoToAffiliateTab}>
                  Editar em Contas de afiliado
                </Button>
              ) : null}
            </div>
          </div>

          {canManage ? (
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => void handleTestAmazon()}
                disabled={testingMarketplace === 'amazon_br' || !canTestAmazon}
              >
                {testingMarketplace === 'amazon_br' ? 'Testando…' : 'Testar conectividade'}
              </Button>
              <Button
                type="button"
                onClick={() => void handleSaveAmazon()}
                disabled={
                  savingMarketplace === 'amazon_br' ||
                  !amazonAccessKeyId.trim() ||
                  !amazonSecretKey.trim() ||
                  lastTestOk['amazon_br'] !== true
                }
              >
                {savingMarketplace === 'amazon_br' ? 'Salvando…' : 'Salvar Amazon'}
              </Button>
              {amazonStatus?.configured ? (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => void handleDeleteAmazon()}
                  disabled={savingMarketplace === 'amazon_br'}
                >
                  <Trash2 className="mr-1 h-4 w-4" />
                  Remover
                </Button>
              ) : null}
            </div>
          ) : null}
        </article>

        <article className="cms-block-card cms-block-card--plain mb-4 space-y-4 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-[var(--admin-text)]">Shopee Open API</h3>
              <p className="text-xs text-[var(--admin-text-muted)]">
                Partner ID e Partner Key para enriquecimento de catálogo.
              </p>
            </div>
            <span className={statusClass(shopeeStatus?.healthStatus ?? 'not_configured')}>
              {statusLabel(shopeeStatus?.healthStatus ?? 'not_configured')}
            </span>
          </div>

          {shopeeStatus?.healthMessage ? (
            <p className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-[var(--admin-text)]">
              {shopeeStatus.healthMessage}
            </p>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="shopee-partner-id">Partner ID</Label>
              <Input
                id="shopee-partner-id"
                value={shopeePartnerId}
                onChange={(event) => setShopeePartnerId(event.target.value)}
                placeholder={
                  shopeeStatus?.publicMetadata?.['partnerId']
                    ? String(shopeeStatus.publicMetadata['partnerId'])
                    : 'Partner ID'
                }
                disabled={!canManage}
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shopee-partner-key">Partner Key</Label>
              <MaskedSecretInput
                id="shopee-partner-key"
                value={shopeePartnerKey}
                onChange={setShopeePartnerKey}
                placeholder={shopeeStatus?.configured ? '••••••••••••••••' : 'Cole a partner key'}
                disabled={!canManage}
              />
            </div>
          </div>

          {canManage ? (
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => void handleTestShopee()}
                disabled={testingMarketplace === 'shopee_br' || !canTestShopee}
              >
                {testingMarketplace === 'shopee_br' ? 'Testando…' : 'Testar conectividade'}
              </Button>
              <Button
                type="button"
                onClick={() => void handleSaveShopee()}
                disabled={
                  savingMarketplace === 'shopee_br' ||
                  !shopeePartnerId.trim() ||
                  !shopeePartnerKey.trim() ||
                  lastTestOk['shopee_br'] !== true
                }
              >
                {savingMarketplace === 'shopee_br' ? 'Salvando…' : 'Salvar Shopee'}
              </Button>
              {shopeeStatus?.configured ? (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => void handleDeleteShopee()}
                  disabled={savingMarketplace === 'shopee_br'}
                >
                  <Trash2 className="mr-1 h-4 w-4" />
                  Remover
                </Button>
              ) : null}
            </div>
          ) : null}
        </article>

        <article className="cms-block-card cms-block-card--plain p-4">
          <h3 className="text-sm font-semibold text-[var(--admin-text)]">Mercado Livre</h3>
          <p className="mt-2 text-sm text-[var(--admin-text-muted)]">
            OAuth e refresh token automático — disponível na Fase 3.
          </p>
        </article>
      </div>
    </div>
  );
}
