'use client';

import { createContext, useContext, useEffect, type ReactNode } from 'react';
import type { FormTexts, LeadFormDef } from '@/lib/content/types';
import { captureAttribution } from '@/lib/leads/attribution-client';

type Ctx = { forms: Record<string, LeadFormDef>; texts: FormTexts };

const FormsContext = createContext<Ctx | null>(null);

/** Request forms from Strapi (fields, labels, texts) — for every LeadForm on the page. */
export function FormsProvider({ children, ...value }: Ctx & { children: ReactNode }) {
  // The provider lives in the layout: the first page load = start of the visit; we remember UTM and referrer
  useEffect(() => {
    captureAttribution();
  }, []);
  return <FormsContext.Provider value={value}>{children}</FormsContext.Provider>;
}

export function useForms() {
  const ctx = useContext(FormsContext);
  if (!ctx) throw new Error('useForms must be used inside <FormsProvider>');
  return ctx;
}
