'use client';

import { ProfileAvatarPanel } from '@/components/profile/ProfileAvatarPanel';
import { ProfileForm } from '@/components/profile/ProfileForm';
import type { OperatorProfile } from '@ecommerce-amazon/shared/admin';

type OperatorProfilePageProps = {
  profile: OperatorProfile;
};

export function OperatorProfilePage({ profile }: OperatorProfilePageProps): React.JSX.Element {
  return (
    <section className="admin-profile-page">
      <div className="admin-profile-layout">
        <div className="admin-profile-page-grid">
          <ProfileAvatarPanel
            initialAvatarUrl={profile.avatarUrl}
            initialIsManagedAvatar={profile.isManagedAvatar}
            displayName={profile.name}
            email={profile.email}
          />
          <ProfileForm profile={profile} />
        </div>
      </div>
    </section>
  );
}
