"use client";
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import en from '@/i18n/en.json';
import vn from '@/i18n/vn.json';

type Locale = 'en' | 'vn';

interface LocaleContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, fallback?: string) => string;
}

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

const dictionaries: Record<Locale, Record<string, any>> = {
  en,
  vn,
};

function flatten(obj: Record<string, any>, prefix = ''): Record<string, string> {
  const res: Record<string, string> = {};
  for (const k of Object.keys(obj)) {
    const val = obj[k];
    const key = prefix ? `${prefix}.${k}` : k;
    if (typeof val === 'string') res[key] = val;
    else if (typeof val === 'object') Object.assign(res, flatten(val, key));
  }
  return res;
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('locale') : null;
      return (stored as Locale) || 'vn';
    } catch {
      return 'vn';
    }
  });

  useEffect(() => {
    try { localStorage.setItem('locale', locale); } catch {}
  }, [locale]);

  const dict = useMemo(() => flatten(dictionaries[locale] || {}), [locale]);

  const t = (key: string, fallback = '') => {
    return dict[key] || fallback || key;
  };

  const value = useMemo(() => ({ locale, setLocale: setLocaleState, t }), [locale, dict]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}

export default LocaleProvider;
