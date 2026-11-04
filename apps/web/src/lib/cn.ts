/** Dependency-free className join: cn('a', cond && 'b', undefined) */
export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
