'use client';

import { useState } from 'react';
import { Photo } from '@/components/ui/Photo';
import { cn } from '@/lib/cn';
import type { Media } from '@/lib/content/types';

const MAX_THUMBS = 10;

/** Vehicle gallery: main photo (16:10) and thumbnails; a thumbnail switches the main photo. */
export function VehicleGallery({ photos, name }: { photos: Media[]; name: string }) {
  const [index, setIndex] = useState(0);
  const list = photos.slice(0, MAX_THUMBS);
  const step = (d: 1 | -1) => setIndex((i) => (i + d + list.length) % list.length);

  return (
    <div>
      <div className="relative">
        <Photo
          key={index}
          media={list[index]}
          label={`${name}, photo ${index + 1}`}
          ratio="16/10"
          priority={index === 0}
          sizes="(min-width: 1024px) 800px, 100vw"
        />
        {list.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous photo"
              onClick={() => step(-1)}
              className="absolute top-1/2 left-3 flex size-11 -translate-y-1/2 items-center justify-center rounded-control bg-bg/90 text-lg shadow-card transition-colors hover:bg-bg focus-visible:outline-2 focus-visible:outline-primary"
            >
              ←
            </button>
            <button
              type="button"
              aria-label="Next photo"
              onClick={() => step(1)}
              className="absolute top-1/2 right-3 flex size-11 -translate-y-1/2 items-center justify-center rounded-control bg-bg/90 text-lg shadow-card transition-colors hover:bg-bg focus-visible:outline-2 focus-visible:outline-primary"
            >
              →
            </button>
            <span className="tabular absolute right-3 bottom-3 rounded-badge bg-ink/80 px-2 py-1 text-xs font-semibold text-white" aria-live="polite">
              {index + 1} / {list.length}
            </span>
          </>
        )}
      </div>

      {list.length > 1 && (
        <ul className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-6">
          {list.map((m, i) => (
            <li key={i}>
              <button
                type="button"
                aria-label={`Show photo ${i + 1}`}
                aria-pressed={i === index}
                onClick={() => setIndex(i)}
                className={cn(
                  'block w-full overflow-hidden rounded-control border-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
                  i === index ? 'border-primary' : 'border-transparent hover:border-line',
                )}
              >
                <Photo media={m} label={`Photo ${i + 1}`} ratio="16/10" sizes="140px" rounded={false} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
