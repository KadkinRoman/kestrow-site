import type { NavItem } from '@/lib/content/types';

export function navHref(item: NavItem) {
  return item.type === 'EXTERNAL' && item.externalPath ? item.externalPath : item.path;
}

/** An item is active if the current path matches it or is nested under it (anchors are not highlighted). */
export function isActive(item: NavItem, pathname: string): boolean {
  const childActive = !!item.items?.some((c) => isActive(c, pathname));
  // WRAPPER (group heading without a link) — active only via nested items
  if (!item.path) return childActive;
  if (item.path.includes('#')) return false;
  if (item.path === '/') return pathname === '/';
  return pathname === item.path || pathname.startsWith(`${item.path}/`) || childActive;
}
