import { Instagram, Linkedin, Send } from 'lucide-react';

import {
  listContactSocialEntries,
  type ContactPageContent,
} from '@ecommerce-amazon/shared/contact';

type ContactSocialLinksProps = {
  socialLinks: ContactPageContent['socialLinks'];
  className?: string;
  linkClassName?: string;
};

function ContactSocialIcon({ network }: { network: 'linkedin' | 'instagram' | 'x' | 'telegram' }) {
  if (network === 'linkedin') return <Linkedin className="h-4 w-4" aria-hidden />;
  if (network === 'instagram') return <Instagram className="h-4 w-4" aria-hidden />;
  if (network === 'telegram') return <Send className="h-4 w-4" aria-hidden />;
  return (
    <span className="text-xs font-semibold" aria-hidden>
      X
    </span>
  );
}

const NETWORK_LABELS: Record<'linkedin' | 'instagram' | 'x' | 'telegram', string> = {
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  x: 'X',
  telegram: 'Telegram',
};

export function ContactSocialLinks({
  socialLinks,
  className,
  linkClassName = 'inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-4 py-2 text-sm text-neutral-700 transition hover:border-neutral-300',
}: ContactSocialLinksProps): React.JSX.Element | null {
  const entries = listContactSocialEntries(socialLinks);

  if (entries.length === 0) {
    return null;
  }

  return (
    <ul className={className ?? 'mt-3 flex flex-wrap gap-3'}>
      {entries.map(([network, href]) => (
        <li key={network}>
          <a href={href} target="_blank" rel="noopener noreferrer" className={linkClassName}>
            <ContactSocialIcon network={network} />
            {NETWORK_LABELS[network]}
          </a>
        </li>
      ))}
    </ul>
  );
}
