import { Badge } from '@/components/ui/Badge';
import type { Kitchen } from '@/lib/content/types';
import { discountPercent } from '@/lib/format';

type Tone = 'accent' | 'success' | 'ink' | 'light';

/** Badges of a vehicle: price drop first, then the CMS badge; the same label never appears twice. */
export function vehicleBadges(kitchen: Pick<Kitchen, 'price' | 'oldPrice' | 'badge'>): { label: string; tone: Tone }[] {
  const list: { label: string; tone: Tone }[] = [];
  if (discountPercent(kitchen.price, kitchen.oldPrice) > 0) list.push({ label: 'Price drop', tone: 'accent' });
  const cms = kitchen.badge?.trim();
  if (cms && !list.some((b) => b.label.toLowerCase() === cms.toLowerCase())) {
    const tone: Tone = /great price/i.test(cms) ? 'success' : /just arrived/i.test(cms) ? 'ink' : 'light';
    list.push({ label: cms, tone });
  }
  return list;
}

export function VehicleBadges({ kitchen, className }: { kitchen: Pick<Kitchen, 'price' | 'oldPrice' | 'badge'>; className?: string }) {
  const list = vehicleBadges(kitchen);
  if (!list.length) return null;
  return (
    <div className={className ?? 'flex flex-wrap gap-1.5'}>
      {list.map((b) => (
        <Badge key={b.label} tone={b.tone}>
          {b.label}
        </Badge>
      ))}
    </div>
  );
}
