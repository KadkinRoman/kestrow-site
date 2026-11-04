'use client';

import { useState } from 'react';
import { ModalButton } from '@/components/modals/ModalButton';
import { Photo, staticPhoto } from '@/components/ui/Photo';
import { cn } from '@/lib/cn';

type Option = { value: string; label: string; photo?: string };

const GROUPS: { id: string; title: string; options: Option[] }[] = [
  {
    id: 'type',
    title: 'Body type',
    options: [
      { value: 'SUV', label: 'SUV', photo: 'type-suv.jpg' },
      { value: 'sedan', label: 'Sedan', photo: 'type-sedan.jpg' },
      { value: 'pickup', label: 'Pickup', photo: 'type-pickup.jpg' },
      { value: 'electric', label: 'Electric', photo: 'type-electric.jpg' },
    ],
  },
  {
    id: 'budget',
    title: 'Budget',
    options: [
      { value: 'under $25k', label: 'Under $25k' },
      { value: '$25–40k', label: '$25–40k' },
      { value: '$40k+', label: '$40k+' },
    ],
  },
  {
    id: 'fuel',
    title: 'Fuel',
    options: [
      { value: 'gasoline', label: 'Gasoline' },
      { value: 'hybrid', label: 'Hybrid' },
      { value: 'electric', label: 'Electric' },
    ],
  },
];

/**
 * Body-type car finder: choosing body type / budget / fuel changes the visual.
 * The photo follows the body type; budget and fuel are shown in the caption over it.
 */
export function MaterialMixer() {
  const [state, setState] = useState<Record<string, Option>>(
    Object.fromEntries(GROUPS.map((g) => [g.id, g.options[0]])),
  );
  const caption = `${state.type.value} · ${state.budget.value} · ${state.fuel.value}`;

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
      <div className="relative" aria-live="polite">
        <Photo
          media={staticPhoto(state.type.photo ?? 'type-suv.jpg', caption)}
          label={caption}
          ratio="16/10"
          sizes="(min-width: 1024px) 700px, 100vw"
        />
        <p className="absolute inset-x-3 bottom-3 rounded-media bg-inverse/75 px-4 py-2.5 text-sm text-on-inverse backdrop-blur-sm">
          {caption}
        </p>
      </div>
      <div className="space-y-6">
        {GROUPS.map((g) => (
          <fieldset key={g.id}>
            <legend className="mb-2 font-semibold">{g.title}</legend>
            <div className="flex flex-wrap gap-2">
              {g.options.map((o) => {
                const active = state[g.id].value === o.value;
                return (
                  <button
                    key={o.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setState((s) => ({ ...s, [g.id]: o }))}
                    className={cn(
                      'min-h-10 rounded-control border px-4 text-sm transition-colors',
                      active ? 'border-fg bg-fg text-bg' : 'border-line hover:border-fg',
                    )}
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ))}
        <ModalButton
          modal={{
            type: 'lead',
            title: 'Find this car for me',
            text: 'Tell us how to reach you. A sales consultant will send you cars that match your selection.',
            form: { formId: 'catalog-photo', submitLabel: 'Find this car for me' },
            extra: { selection: caption },
          }}
        >
          Find this car for me
        </ModalButton>
      </div>
    </div>
  );
}
