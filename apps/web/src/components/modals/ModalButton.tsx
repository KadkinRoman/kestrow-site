'use client';

import type { ReactNode } from 'react';
import { buttonClass, type ButtonSize, type ButtonVariant } from '@/components/ui/Button';
import { useModal, type ModalRequest } from './ModalProvider';

type Props = {
  modal: ModalRequest;
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  /** Without button styles — for text links ("terms") */
  unstyled?: boolean;
};

/** Button that opens the global modal. Can be used in server components. */
export function ModalButton({ modal, children, variant, size, className, unstyled }: Props) {
  const { open } = useModal();
  return (
    <button
      type="button"
      onClick={() => open(modal)}
      className={unstyled ? className : buttonClass(variant, size, className)}
    >
      {children}
    </button>
  );
}
