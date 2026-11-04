import { Avatar } from '@/components/ui/Photo';
import type { Author } from '@/lib/content/types';

function PersonCard({ label, person }: { label: string; person: Author }) {
  return (
    <div className="flex items-center gap-4 rounded-card bg-surface p-4">
      <Avatar name={person.name} media={person.photo} className="size-14 text-base" />
      <div className="min-w-0">
        <div className="text-xs text-fg-muted">{label}</div>
        <div className="font-semibold">{person.name}</div>
        {person.role && <div className="text-sm text-fg-muted">{person.role}</div>}
      </div>
    </div>
  );
}

/** Author and Expert cards next to the article table of contents (final prototype) */
export function ArticleAuthors({ author, expert }: { author?: Author; expert?: Author }) {
  if (!author && !expert) return null;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {author && <PersonCard label="Author" person={author} />}
      {expert && <PersonCard label="Expert" person={expert} />}
    </div>
  );
}
