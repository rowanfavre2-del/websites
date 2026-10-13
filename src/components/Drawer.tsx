import { useEffect, useRef } from 'react';
import { NUMBERS, TRUST_POINTS, WHY_NOW, type Sourced } from '../data/mock';
import { useStore } from '../store';

const TITLES = { why: 'Why now', numbers: 'The numbers', trust: 'Trust and responsibility' } as const;

function SourcedList({ items }: { items: Sourced[] }) {
  return (
    <ol className="space-y-4">
      {items.map((it, i) => (
        <li key={i} className="border-b border-rule pb-4 last:border-0">
          <p className="text-[16px] leading-relaxed text-ink">{it.text}</p>
          <div className="mt-1 flex flex-wrap gap-x-3 text-[13.5px]">
            {it.source && (
              <a href={it.source.url} target="_blank" rel="noreferrer noopener" className="font-semibold text-accent-dark underline underline-offset-2">
                Source: {it.source.label}
              </a>
            )}
            {it.note && <span className="text-ink-muted">{it.note}</span>}
          </div>
        </li>
      ))}
    </ol>
  );
}

export function Drawer() {
  const { state, dispatch } = useStore();
  const open = state.drawer;
  const panel = useRef<HTMLDivElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    returnTo.current = document.activeElement as HTMLElement | null;
    panel.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dispatch({ type: 'OPEN_DRAWER', drawer: null });
      if (e.key === 'Tab' && panel.current) {
        const f = panel.current.querySelectorAll<HTMLElement>('a, button');
        if (f.length === 0) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      returnTo.current?.focus();
    };
  }, [open, dispatch]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <div className="absolute inset-0 bg-ink/40" onClick={() => dispatch({ type: 'OPEN_DRAWER', drawer: null })} aria-hidden="true" />
      <div
        ref={panel}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        className="drawer-in relative flex h-full w-full max-w-[480px] flex-col bg-ivory shadow-paper outline-none"
      >
        <div className="flex items-center justify-between border-b border-rule px-6 py-4">
          <h2 id="drawer-title" className="font-display text-[26px] font-semibold">
            {TITLES[open]}
          </h2>
          <button
            type="button"
            onClick={() => dispatch({ type: 'OPEN_DRAWER', drawer: null })}
            className="rounded-full px-3 py-1 text-[14px] font-semibold text-ink hover:bg-ink/5"
          >
            Close
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {open === 'why' && <SourcedList items={WHY_NOW} />}
          {open === 'numbers' && (
            <>
              <p className="mb-4 text-[14px] text-ink-soft">Only sourced figures. Vendor figures and our own estimate are labelled.</p>
              <SourcedList items={NUMBERS} />
            </>
          )}
          {open === 'trust' && (
            <ul className="space-y-3">
              {TRUST_POINTS.map((t) => (
                <li key={t} className="flex gap-3 text-[16px] leading-relaxed">
                  <span aria-hidden="true" className="mt-2 h-2 w-2 shrink-0 rounded-full bg-verified" />
                  {t}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
