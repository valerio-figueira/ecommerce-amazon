import { buildAboutPageJsonLd, type AboutPageJsonLdTeamMember } from '@ecommerce-amazon/shared/seo';
import type { PublicTeamMemberDto } from '@ecommerce-amazon/shared/about';

import { getServerBrandConfig } from '@/lib/site-url';

type AboutPageJsonLdProps = {
  teamMembers: PublicTeamMemberDto[];
};

function mapTeamMemberForJsonLd(member: PublicTeamMemberDto): AboutPageJsonLdTeamMember {
  const socialLinks = member.socialLinks
    ? {
        ...(member.socialLinks.linkedin ? { linkedin: member.socialLinks.linkedin } : {}),
        ...(member.socialLinks.instagram ? { instagram: member.socialLinks.instagram } : {}),
        ...(member.socialLinks.x ? { x: member.socialLinks.x } : {}),
        ...(member.socialLinks.telegram ? { telegram: member.socialLinks.telegram } : {}),
      }
    : null;

  return {
    name: member.name,
    jobTitle: member.jobTitle,
    avatarUrl: member.avatarUrl,
    socialLinks: socialLinks && Object.keys(socialLinks).length > 0 ? socialLinks : null,
    publicTeamRole: member.publicTeamRole,
  };
}

export function AboutPageJsonLd({ teamMembers }: AboutPageJsonLdProps): React.JSX.Element {
  const brand = getServerBrandConfig();
  const jsonLd = buildAboutPageJsonLd(
    brand,
    teamMembers.map(mapTeamMemberForJsonLd),
  );

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
