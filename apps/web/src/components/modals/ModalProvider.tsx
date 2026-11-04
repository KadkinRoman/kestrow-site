'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { LeadForm, type LeadFormConfig } from '@/components/forms/LeadForm';
import { Button } from '@/components/ui/Button';
import { Placeholder } from '@/components/ui/Placeholder';
import { Avatar, Photo } from '@/components/ui/Photo';
import type { Author, Media, Quiz as QuizData } from '@/lib/content/types';
import { routes } from '@/lib/routes';
import { Dialog } from './Dialog';
import { Quiz } from './Quiz';

export type ModalRequest =
  | {
      type: 'lead';
      title?: string;
      text?: string;
      form?: Partial<LeadFormConfig>;
      extra?: Record<string, string>;
    }
  | { type: 'promo'; title: string; text?: string; term?: string; image?: Media }
  | { type: 'installment' }
  | { type: 'video'; caption?: string; url?: string }
  | { type: 'employee'; employee: Author }
  | { type: 'quiz' };

type Ctx = { open: (req: ModalRequest) => void; close: () => void };

const ModalContext = createContext<Ctx | null>(null);

export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal must be used inside <ModalProvider>');
  return ctx;
}

const SIZES = { lead: 'md', promo: 'lg', installment: 'lg', video: 'sm', employee: 'md', quiz: 'xl' } as const;

/** Global site modals: request, offer, financing, video review, quiz. */
export function ModalProvider({ children, quiz }: { children: ReactNode; quiz: QuizData }) {
  const [req, setReq] = useState<ModalRequest | null>(null);
  const close = useCallback(() => setReq(null), []);
  const value = useMemo<Ctx>(() => ({ open: setReq, close }), [close]);

  return (
    <ModalContext.Provider value={value}>
      {children}
      <Dialog
        open={!!req}
        onClose={close}
        size={req ? SIZES[req.type] : 'md'}
        label={req && 'title' in req ? req.title : req?.type === 'employee' ? req.employee.name : undefined}
      >
        {req && <ModalContent req={req} quiz={quiz} open={setReq} close={close} />}
      </Dialog>
    </ModalContext.Provider>
  );
}

function ModalContent({
  req,
  quiz,
  open,
  close,
}: {
  req: ModalRequest;
  quiz: QuizData;
  open: (r: ModalRequest) => void;
  close: () => void;
}) {
  switch (req.type) {
    case 'lead':
      return (
        <>
          <h2 className="pr-8 text-2xl font-semibold">{req.title ?? 'Check availability'}</h2>
          <p className="mt-2 text-fg-muted">{req.text ?? 'Leave your contact details and a Kestrow sales consultant will get in touch.'}</p>
          <LeadForm formId="lead" {...req.form} extra={{ title: req.title ?? '', ...req.extra }} className="mt-5" />
        </>
      );

    case 'promo':
      return (
        <>
          <h2 className="pr-8 text-2xl font-semibold">{req.title}</h2>
          {req.text && <p className="mt-2 text-fg-muted">{req.text}</p>}
          <Photo media={req.image} label="Offer visual" sizes="(min-width: 640px) 560px, 100vw" className="my-5 min-h-48" />
          {req.term && <p className="text-sm text-fg-muted">{req.term}</p>}
          <LeadForm
            formId="promo"
            layout="inline"
            submitLabel="Claim the offer"
            extra={{ promo: req.title }}
            className="mt-4"
          />
        </>
      );

    case 'installment':
      return (
        <>
          <h2 className="pr-8 text-2xl font-semibold">Financing</h2>
          <p className="mt-2 text-fg-muted">
            Spread the cost of your car over 36–72 months. Your exact rate, term and down payment are confirmed by our
            finance manager after a soft credit check — it does not affect your credit score.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            <span className="rounded-control bg-surface px-3 py-1">APR from 5.9%</span>
            <span className="rounded-control bg-surface px-3 py-1">36–72 months</span>
            <span className="rounded-control bg-surface px-3 py-1">Soft credit check</span>
          </div>
          <ol className="mt-6 space-y-3 border-l border-line pl-5">
            {[
              ['Step 1', 'Pick your car and your down payment'],
              ['Step 2', 'Get pre-approved in 2 minutes — soft check only'],
              ['Step 3', 'Choose the term and monthly payment that suit you'],
              ['Step 4', 'Sign the paperwork and drive home or get it delivered'],
              ['Then', 'Monthly payments on schedule'],
            ].map(([step, text]) => (
              <li key={step}>
                <b className="mr-2">{step}</b>
                <span className="text-fg-muted">{text}</span>
              </li>
            ))}
          </ol>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              onClick={() =>
                open({
                  type: 'lead',
                  title: 'Get pre-approved',
                  text: 'Our finance manager will check your rate with a soft pull and calculate the monthly payment for your car.',
                  form: { submitLabel: 'Get pre-approved' },
                })
              }
            >
              Get pre-approved
            </Button>
            <Button href={routes.payment()} variant="secondary" onClick={close}>
              How financing works
            </Button>
          </div>
        </>
      );

    case 'video':
      return <Placeholder label={req.caption ? `Video review: ${req.caption}` : 'Customer video review'} ratio="9/16" />;

    case 'employee':
      return (
        <div className="grid gap-5 sm:grid-cols-[160px_1fr]">
          <Avatar name={req.employee.name} media={req.employee.photo} className="size-40 text-4xl" />
          <div>
            <h2 className="pr-8 text-2xl font-semibold">{req.employee.name}</h2>
            {req.employee.role && <p className="mt-1 text-fg-muted">{req.employee.role}</p>}
            {req.employee.text && <p className="mt-4">{req.employee.text}</p>}
          </div>
        </div>
      );

    case 'quiz':
      return <Quiz data={quiz} />;
  }
}
