import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/cn';

/** inverse — outlined on a dark background, contrast — filled on a dark background */
export type ButtonVariant = 'primary' | 'secondary' | 'inverse' | 'contrast' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 rounded-control font-medium text-center transition-colors ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ' +
  'disabled:pointer-events-none disabled:opacity-50';

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-on-primary hover:bg-primary-hover',
  secondary: 'border border-fg/25 bg-bg text-fg hover:border-fg',
  inverse: 'border border-on-inverse/40 text-on-inverse hover:bg-on-inverse/10',
  contrast: 'bg-on-inverse text-inverse hover:bg-on-inverse/85',
  ghost: 'text-fg underline-offset-4 hover:underline',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'min-h-9 px-4 text-sm',
  md: 'min-h-11 px-6 text-[15px]',
  lg: 'min-h-13 px-8 text-base',
};

export function buttonClass(variant: ButtonVariant = 'primary', size: ButtonSize = 'md', className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

type CommonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
};

type ButtonAsLink = CommonProps & { href: string; external?: boolean } & Omit<
    ComponentProps<'a'>,
    'href' | 'className' | 'children'
  >;
type ButtonAsButton = CommonProps & { href?: undefined } & Omit<ComponentProps<'button'>, 'className' | 'children'>;

/** Button or link-button (if href is passed). */
export function Button(props: ButtonAsLink | ButtonAsButton) {
  if (props.href !== undefined) {
    const { href, external, variant, size, className, children, ...rest } = props;
    const cls = buttonClass(variant, size, className);
    const isExternal = external ?? /^(https?:|tel:|mailto:)/.test(href);
    if (isExternal) {
      return (
        <a
          href={href}
          className={cls}
          target={href.startsWith('http') ? '_blank' : undefined}
          rel="noopener noreferrer"
          {...rest}
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={cls} {...rest}>
        {children}
      </Link>
    );
  }

  const { variant, size, className, children, type = 'button', ...rest } = props;
  return (
    <button type={type} className={buttonClass(variant, size, className)} {...rest}>
      {children}
    </button>
  );
}
