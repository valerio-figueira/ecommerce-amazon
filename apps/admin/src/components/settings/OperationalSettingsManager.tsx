'use client';

import { Link2, Plug, Settings, Shield, SlidersHorizontal, Users } from 'lucide-react';
import { useState } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type {
  AffiliateAccountDto,
  MarketplaceCredentialStatusDto,
  OperationalStatusResponse,
  OperatorProfile,
  OperatorSummary,
  SiteSettingsResponse,
} from '@ecommerce-amazon/shared/admin';

import { AffiliateAccountsPanel } from './AffiliateAccountsPanel';
import { MarketplaceIntegrationsPanel } from './MarketplaceIntegrationsPanel';
import { OperationalHealthPanel } from './OperationalHealthPanel';
import { OperatorsPanel } from './OperatorsPanel';
import { SiteSettingsPanel } from './SiteSettingsPanel';

type SettingsTab = 'affiliate' | 'integrations' | 'preferences' | 'operators' | 'health';

type OperationalSettingsManagerProps = {
  profile: OperatorProfile;
  affiliateAccounts: AffiliateAccountDto[];
  marketplaceCredentials: MarketplaceCredentialStatusDto[];
  siteSettings: SiteSettingsResponse;
  operationalStatus: OperationalStatusResponse;
  operators: OperatorSummary[];
};

export function OperationalSettingsManager({
  profile,
  affiliateAccounts,
  marketplaceCredentials,
  siteSettings,
  operationalStatus,
  operators,
}: OperationalSettingsManagerProps): React.JSX.Element {
  const isAdmin = profile.role === 'admin';
  const [activeTab, setActiveTab] = useState<SettingsTab>('affiliate');

  const tabCount = isAdmin ? 5 : 4;

  function isSettingsTab(value: string): value is SettingsTab {
  return (
    value === 'affiliate' ||
    value === 'integrations' ||
    value === 'preferences' ||
    value === 'operators' ||
    value === 'health'
  );
}

  function handleTabChange(value: string): void {
    if (isSettingsTab(value)) {
      setActiveTab(value);
    }
  }

  return (
    <section className="cms-editor-section">
      <div className="cms-float-panel cms-vitrine-panel">
        <div className="cms-panel-head">
          <h2 className="cms-panel-title">
            <Settings className="mr-2 inline h-4 w-4" />
            Configurações operacionais
          </h2>
          <p className="cms-panel-meta">
            <strong>Governança da plataforma</strong>
            <span className="mt-1 block text-xs font-normal text-[var(--admin-text-muted)]">
              Contas de afiliado, integrações de API, operadores, feature flags e saúde operacional.
            </span>
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <div className="cms-float-panel cms-blocks-panel">
          <p className="cms-blocks-panel__meta">
            Seções · <strong>{tabCount} abas</strong>
          </p>
          <TabsList>
            <TabsTrigger value="affiliate" className="inline-flex items-center gap-2">
              <Link2 className="h-4 w-4" />
              Contas de afiliado
            </TabsTrigger>
            <TabsTrigger value="integrations" className="inline-flex items-center gap-2">
              <Plug className="h-4 w-4" />
              Integrações
            </TabsTrigger>
            <TabsTrigger value="preferences" className="inline-flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Preferências
            </TabsTrigger>
            {isAdmin ? (
              <TabsTrigger value="operators" className="inline-flex items-center gap-2">
                <Users className="h-4 w-4" />
                Operadores
              </TabsTrigger>
            ) : null}
            <TabsTrigger value="health" className="inline-flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Saúde
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="affiliate">
          <div className="cms-float-panel cms-vitrine-panel">
            <div className="cms-panel-head">
              <h2 className="cms-panel-title">
                <Link2 className="mr-2 inline h-4 w-4" />
                Contas de afiliado
              </h2>
              <p className="cms-panel-meta">
                <strong>Gate de escala PRD §4.2</strong>
                <span className="mt-1 block text-xs font-normal text-[var(--admin-text-muted)]">
                  Valide tags, ative marketplaces e controle redirecionamentos `/go`.
                </span>
              </p>
            </div>
          </div>
          <AffiliateAccountsPanel initialItems={affiliateAccounts} canManage={isAdmin} />
        </TabsContent>

        <TabsContent value="integrations">
          <div className="cms-float-panel cms-vitrine-panel">
            <div className="cms-panel-head">
              <h2 className="cms-panel-title">
                <Plug className="mr-2 inline h-4 w-4" />
                Integrações de API
              </h2>
              <p className="cms-panel-meta">
                <strong>Cofre de credenciais</strong>
                <span className="mt-1 block text-xs font-normal text-[var(--admin-text-muted)]">
                  Chaves criptografadas para o worker sincronizar preços com Amazon e Shopee.
                </span>
              </p>
            </div>
          </div>
          <MarketplaceIntegrationsPanel
            initialItems={marketplaceCredentials}
            affiliateAccounts={affiliateAccounts}
            canManage={isAdmin}
            onGoToAffiliateTab={() => setActiveTab('affiliate')}
          />
        </TabsContent>

        <TabsContent value="preferences">
          <SiteSettingsPanel initialSettings={siteSettings} canManage={isAdmin} />
        </TabsContent>

        {isAdmin ? (
          <TabsContent value="operators">
            <div className="cms-float-panel cms-vitrine-panel">
              <div className="cms-panel-head">
                <h2 className="cms-panel-title">
                  <Users className="mr-2 inline h-4 w-4" />
                  Operadores
                </h2>
                <p className="cms-panel-meta">
                  <strong>Equipe CMS</strong>
                  <span className="mt-1 block text-xs font-normal text-[var(--admin-text-muted)]">
                    Convide editores, defina papéis e gerencie acessos ao painel.
                  </span>
                </p>
              </div>
            </div>
            <OperatorsPanel initialItems={operators} />
          </TabsContent>
        ) : null}

        <TabsContent value="health">
          <div className="cms-float-panel cms-vitrine-panel">
            <div className="cms-panel-head">
              <h2 className="cms-panel-title">
                <Shield className="mr-2 inline h-4 w-4" />
                Saúde da plataforma
              </h2>
              <p className="cms-panel-meta">
                <strong>Status operacional</strong>
                <span className="mt-1 block text-xs font-normal text-[var(--admin-text-muted)]">
                  Variáveis de ambiente, gate de escala e falhas recentes de sync.
                </span>
              </p>
            </div>
          </div>
          <OperationalHealthPanel status={operationalStatus} />
        </TabsContent>
      </Tabs>
    </section>
  );
}
