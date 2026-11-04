'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Props = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  label?: string;
};

const sizes = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-2xl', xl: 'max-w-5xl' };

/** Modal on the native <dialog>: focus trap and Esc out of the box. */
export function Dialog({ open, onClose, children, size = 'md', label }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Block page scrolling behind the dialog
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = 'hidden';
    return () => {
      root.style.overflow = prev;
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-label={label}
      onClose={onClose}
      onClick={(e) => {
        // a click on the backdrop (outside the content) closes the dialog
        if (e.target === ref.current) onClose();
      }}
      className={cn(
        'm-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] overflow-y-auto rounded-block bg-bg p-0 text-fg shadow-modal',
        sizes[size],
      )}
    >
      {open && (
        <div className="relative p-6 md:p-8">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-3 right-3 flex size-10 items-center justify-center rounded-full text-xl text-fg-muted hover:bg-surface hover:text-fg"
          >
            ✕
          </button>
          {children}
        </div>
      )}
    </dialog>
  );
}
