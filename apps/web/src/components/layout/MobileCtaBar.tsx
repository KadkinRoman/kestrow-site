import { ModalButton } from '@/components/modals/ModalButton';
import { buttonClass } from '@/components/ui/Button';

/**
 * Phones only: a bar pinned to the bottom with the two actions that convert on mobile —
 * tap-to-call and a short availability request. The root layout pads <body> by the bar height.
 */
export function MobileCtaBar({ phoneHref }: { phoneHref: string }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-bg/90 px-4 pt-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))] backdrop-blur-md md:hidden print:hidden">
      <div className="flex gap-2">
        <a href={phoneHref} className={buttonClass('secondary', 'md', 'flex-1')}>
          Call us
        </a>
        <ModalButton
          className="flex-[1.4]"
          modal={{
            type: 'lead',
            title: 'Check availability',
            text: 'Leave your name and phone number. A sales consultant will call you back the same business day.',
            form: { submitLabel: 'Check availability' },
          }}
        >
          Check availability
        </ModalButton>
      </div>
    </div>
  );
}
