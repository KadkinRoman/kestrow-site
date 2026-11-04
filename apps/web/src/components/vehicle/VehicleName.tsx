import { Fragment } from 'react';

/** Vehicle name with non-breaking hyphenated words ("CX-5" must not wrap at the hyphen). */
export function VehicleName({ name }: { name: string }) {
  return (
    <>
      {name.split(' ').map((w, i) => (
        <Fragment key={i}>
          {i > 0 && ' '}
          {w.includes('-') ? <span className="whitespace-nowrap">{w}</span> : w}
        </Fragment>
      ))}
    </>
  );
}
