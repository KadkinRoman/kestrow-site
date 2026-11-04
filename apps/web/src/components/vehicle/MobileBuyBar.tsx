'use client';

import { useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { ModalButton } from '@/components/modals/ModalButton';

const subscribe = () => () => {};

/**
 * Phones: a bar pinned to the bottom of the vehicle page — price, estimated payment, "Check availability".
 * Rendered through a portal into <body> so no transformed ancestor can break `position: fixed`.
 */
export function MobileBuyBar({ name, price, payment }: { name: string; price: string; payment: string }) {
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  if (!mounted) return null;
  return createPortal(
    <div
      data-vdp-bar
      className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t border-line bg-bg px-4 pt-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))] lg:hidden print:hidden"
    >
      <div className="min-w-0 flex-1 leading-tight">
        <div className="font-display tabular text-2xl">{price}</div>
        <div className="tabular text-xs text-fg-muted">≈ {payment}/mo*</div>
      </div>
      <ModalButton
        size="lg"
        className="shrink-0"
        modal={{
          type: 'lead',
          title: `Check availability: ${name}`,
          text: 'Leave your contact details. A sales consultant will confirm availability and send you the out-the-door price.',
          extra: { kitchen: name },
        }}
      >
        Check availability
      </ModalButton>
    </div>,
    document.body,
  );
}
