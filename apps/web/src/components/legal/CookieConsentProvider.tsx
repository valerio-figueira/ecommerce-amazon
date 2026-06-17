'use client';

import Link from 'next/link';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { Button } from '@/components/ui/button';
import { acceptFunctionalConsent, hasFunctionalConsent } from '@/lib/session';

type CookieConsentContextValue = {
  consentGranted: boolean;
  bannerVisible: boolean;
  acceptConsent: () => void;
  requestConsent: () => void;
};

const CookieConsentContext = createContext<CookieConsentContextValue | null>(null);

export function CookieConsentProvider({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const [consentGranted, setConsentGranted] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(false);

  useEffect(() => {
    const granted = hasFunctionalConsent();
    setConsentGranted(granted);
    setBannerVisible(!granted);
  }, []);

  const acceptConsent = useCallback((): void => {
    acceptFunctionalConsent();
    setConsentGranted(true);
    setBannerVisible(false);
  }, []);

  const requestConsent = useCallback((): void => {
    if (!hasFunctionalConsent()) {
      setBannerVisible(true);
    }
  }, []);

  const value = useMemo(
    (): CookieConsentContextValue => ({
      consentGranted,
      bannerVisible,
      acceptConsent,
      requestConsent,
    }),
    [consentGranted, bannerVisible, acceptConsent, requestConsent],
  );

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
      {bannerVisible && (
        <div
          className="fixed inset-x-0 bottom-0 z-[60] border-t border-neutral-200 bg-white/95 p-4 shadow-lg backdrop-blur"
          role="dialog"
          aria-label="Consentimento de cookies"
        >
          <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-neutral-700">
              Usamos um cookie funcional para manter sua lista de desejos neste navegador. Saiba mais
              na{' '}
              <Link href="/legal#cookies" className="font-medium underline">
                política de cookies
              </Link>
              .
            </p>
            <Button type="button" variant="primary" className="shrink-0" onClick={acceptConsent}>
              Aceitar
            </Button>
          </div>
        </div>
      )}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent(): CookieConsentContextValue {
  const context = useContext(CookieConsentContext);
  if (!context) {
    throw new Error('useCookieConsent must be used within CookieConsentProvider');
  }
  return context;
}
