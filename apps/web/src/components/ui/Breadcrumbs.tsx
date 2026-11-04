import Link from 'next/link';
import { Fragment } from 'react';

export type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const all: Crumb[] = [{ label: 'Home', href: '/' }, ...items];
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-fg-muted">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {all.map((c, i) => {
          const isLast = i === all.length - 1;
          return (
            <Fragment key={i}>
              {i > 0 && <li aria-hidden>/</li>}
              <li>
                {c.href && !isLast ? (
                  <Link href={c.href} className="hover:text-fg">
                    {c.label}
                  </Link>
                ) : (
                  <span aria-current={isLast ? 'page' : undefined} className="text-fg">
                    {c.label}
                  </span>
                )}
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
