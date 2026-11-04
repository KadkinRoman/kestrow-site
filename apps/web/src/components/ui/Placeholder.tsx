import { cn } from '@/lib/cn';

type Props = {
  label: string;
  className?: string;
  /** CSS aspect-ratio, e.g. '4/3', '16/9', '9/16' */
  ratio?: string;
  dark?: boolean;
};

/** Grey media placeholder. Will be replaced with next/image once photos and videos arrive. */
export function Placeholder({ label, className, ratio, dark }: Props) {
  return (
    <div
      role="img"
      aria-label={label}
      style={ratio ? { aspectRatio: ratio } : undefined}
      className={cn(
        'flex items-center justify-center rounded-media border p-4 text-center text-sm',
        dark
          ? 'border-on-inverse/20 bg-on-inverse/5 text-on-inverse-muted'
          : 'placeholder-stripes border-line text-fg-muted',
        className,
      )}
    >
      {label}
    </div>
  );
}
