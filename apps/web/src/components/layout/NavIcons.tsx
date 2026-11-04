import { cn } from '@/lib/cn';

type P = { className?: string };
const svg = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const;

export const SearchIcon = ({ className }: P) => (
  <svg {...svg} className={cn('size-5', className)}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

export const PhoneIcon = ({ className }: P) => (
  <svg {...svg} className={cn('size-5', className)}>
    <path d="M5 4h3.5l1.8 4.6-2.3 1.4a11 11 0 0 0 5 5l1.4-2.3L19 14.5V18a2 2 0 0 1-2 2A13 13 0 0 1 3 6a2 2 0 0 1 2-2z" />
  </svg>
);

export const ChevronIcon = ({ className }: P) => (
  <svg {...svg} className={cn('size-4', className)}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const CloseIcon = ({ className }: P) => (
  <svg {...svg} className={cn('size-5', className)}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const MenuIcon = ({ className }: P) => (
  <svg {...svg} className={cn('size-5', className)}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

export const ArrowIcon = ({ className }: P) => (
  <svg {...svg} className={cn('size-4', className)}>
    <path d="M5 12h14m-6-6 6 6-6 6" />
  </svg>
);
