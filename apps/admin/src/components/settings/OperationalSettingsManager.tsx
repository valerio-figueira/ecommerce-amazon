'use client';

import { Link2, Settings, Shield, Users } from 'lucide-react';

import type {
  AffiliateAccountDto,
  OperationalStatusResponse,
  OperatorProfile,
  OperatorSummary,
  SiteSettingsResponse,
} from '@ecommerce-amazon/shared/admin';

import { AffiliateAccountsPanel } from './AffiliateAccountsPanel';
import { OperationalHealthPanel } from './OperationalHealthPanel';
import { OperatorsPanel } from './OperatorsPanel';
import { SiteSettingsPanel } from './SiteSettingsPanel';

type OperationalSettingsManagerProps = {
  profile: OperatorProfile;
  affiliateAccounts: AffiliateAccountDto[];
  siteSettings: SiteSettingsResponse;
  operationalStatus: OperationalStatusResponse;
  operators: OperatorSummary[];
};

export function OperationalSettingsManager({
  profile,
  affiliateAccounts,
  siteSettings,
  operationalStatus,
  operators,
}: OperationalSettingsManagerProps): React.JSX.Element {
  const isAdmin = profile.role === 'admin';

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
              Contas de afiliado, operadores, feature flags e saúde operacional.
            </span>
          </p>
        </div>
      </div>

      <div className="cms-float-panel cms-vitrine-panel">
        <div className="cms-panel-head">
          <h2 className="cms-panel-title">
            <Link2 className="mr-2 inline h-4 w-4" />
            Contas de afiliado
          </h2>
        </div>
      </div>
      <AffiliateAccountsPanel initialItems={affiliateAccounts} canManage={isAdmin} />

      <SiteSettingsPanel initialSettings={siteSettings} canManage={isAdmin} />

      {isAdmin ? (
        <>
          <div className="cms-float-panel cms-vitrine-panel">
            <div className="cms-panel-head">
              <h2 className="cms-panel-title">
                <Users className="mr-2 inline h-4 w-4" />
                Operadores
              </h2>
            </div>
          </div>
          <OperatorsPanel initialItems={operators} />
        </>
      ) : null}

      <div className="cms-float-panel cms-vitrine-panel">
        <div className="cms-panel-head">
          <h2 className="cms-panel-title">
            <Shield className="mr-2 inline h-4 w-4" />
            Saúde da plataforma
          </h2>
        </div>
      </div>
      <OperationalHealthPanel status={operationalStatus} />
    </section>
  );
}
