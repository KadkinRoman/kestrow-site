'use client';

import { useState } from 'react';
import { LeadForm } from '@/components/forms/LeadForm';
import { buttonClass } from '@/components/ui/Button';
import { Photo, staticPhoto } from '@/components/ui/Photo';
import { cn } from '@/lib/cn';
import type { Quiz as QuizData } from '@/lib/content/types';

/** Quiz "find your car": N single-choice questions + a final step with contact details. */
export function Quiz({ data }: { data: QuizData }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const total = data.steps.length + 1;
  const isFinal = step === data.steps.length;
  const current = data.steps[step];
  const progress = ((step + 1) / total) * 100;

  const extra = Object.fromEntries(
    data.steps.filter((s) => answers[s.id]).map((s) => [s.question, answers[s.id]]),
  );

  return (
    <div className="grid gap-8 md:grid-cols-[1.4fr_1fr]">
      <div className="flex min-h-[420px] flex-col">
        <div className="flex items-center justify-between gap-4 pr-8 text-sm text-fg-muted">
          <span>{data.title}</span>
          <span aria-live="polite">
            {step + 1}/{total}
          </span>
        </div>
        <div
          className="mt-3 h-1.5 overflow-hidden rounded-control bg-surface"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
        >
          <div className="h-full bg-primary transition-[width]" style={{ width: `${progress}%` }} />
        </div>

        {!isFinal && current ? (
          <fieldset className="mt-8">
            <legend className="text-2xl font-semibold">{current.question}</legend>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {current.options.map((o) => {
                const selected = answers[current.id] === o;
                return (
                  <button
                    key={o}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setAnswers((a) => ({ ...a, [current.id]: o }))}
                    className={cn(
                      'min-h-12 rounded-media border px-4 py-3 text-left transition-colors',
                      selected ? 'border-fg bg-fg text-bg' : 'border-line hover:border-fg',
                    )}
                  >
                    {o}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ) : (
          <div className="mt-8">
            <h3 className="text-2xl font-semibold">{data.final.title}</h3>
            <p className="mt-2 text-fg-muted">{data.final.text}</p>
            <LeadForm formId="quiz" submitLabel={data.final.submitLabel} extra={extra} className="mt-5" />
          </div>
        )}

        <div className="mt-auto flex items-center justify-between gap-4 pt-8">
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className={cn('text-sm text-fg-muted hover:text-fg', step === 0 && 'invisible')}
          >
            ‹ Previous step
          </button>
          {!isFinal && (
            <button type="button" onClick={() => setStep((s) => s + 1)} className={buttonClass('primary')}>
              {current && answers[current.id] ? 'Next' : 'Skip'}
            </button>
          )}
        </div>
      </div>

      <Photo
        media={current?.image ?? staticPhoto('keys.jpg', 'Car keys handed over to a new owner')}
        label="Car photo for the question"
        sizes="(min-width: 768px) 420px, 0px"
        className="hidden min-h-[420px] md:block"
      />
    </div>
  );
}
