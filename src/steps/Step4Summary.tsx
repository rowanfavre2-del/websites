import { useState } from 'react';
import { CHECKS, DOCS, FIELDS, PHP_PER_GBP, type DocId, type Field, type FieldId } from '../data/mock';

const ORDER: FieldId[] = ['employer', 'salary', 'monthly', 'prevPay', 'savings', 'start', 'currency', 'dates'];
const COMPACT: FieldId[] = ['start', 'currency', 'dates'];
import { lowConfirmed, useStore } from '../store';
import { ScaledDoc } from '../components/Documents';
import { Button, Check, Chip } from '../components/ui';

export function ConfidenceChip({ f, confirmed }: { f: Field; confirmed: boolean }) {
  if (f.low && confirmed) return <Chip tone="green"><Check className="h-3 w-3" /> Confirmed</Chip>;
  if (f.low) return <Chip tone="amber">Low {f.confidence}%</Chip>;
  return <Chip tone="green">High {f.confidence}%</Chip>;
}

export function Step4Summary() {
  const { state, dispatch } = useStore();
  const active = state.activeField ? FIELDS.find((f) => f.id === state.activeField)! : null;
  const [docTab, setDocTab] = useState<DocId>('offer');
  const shownDoc: DocId = active ? active.doc : docTab;
  const ready = lowConfirmed(state);
  const remaining = FIELDS.filter((f) => f.low && !state.confirmed[f.id]).length;

  const focusField = (f: Field | null) => {
    dispatch({ type: 'SET_ACTIVE_FIELD', field: f ? f.id : null });
    if (f) setDocTab(f.doc);
  };

  return (
    <div className="grid flex-1 gap-4 lg:grid-cols-[auto_1fr]">
      {/* Original */}
      <div className="flex flex-col">
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-ink-muted">Original</span>
          <div role="tablist" aria-label="Original documents" className="flex gap-1">
            {DOCS.map((d) => (
              <button
                key={d.id}
                role="tab"
                type="button"
                aria-selected={shownDoc === d.id}
                onClick={() => {
                  dispatch({ type: 'SET_ACTIVE_FIELD', field: null });
                  setDocTab(d.id);
                }}
                className={`rounded-full px-2.5 py-0.5 text-[12.5px] font-semibold ${shownDoc === d.id ? 'bg-ink text-ivory' : 'bg-ink/[0.06] text-ink-soft hover:bg-ink/10'}`}
              >
                {d.short}
              </button>
            ))}
          </div>
        </div>
        <div className="flex justify-center rounded-xl bg-ivory-deep/70 p-2">
          <ScaledDoc id={shownDoc} scale={0.76} active={active?.region ?? null} />
        </div>
      </div>

      {/* Extracted */}
      <div className="flex min-w-0 flex-col">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-ink-muted">UK-readable summary</span>
          <span className="text-[12.5px] text-ink-muted">1 GBP = {PHP_PER_GBP} PHP, illustrative rate</span>
        </div>
        <ul className="grid grid-cols-2 gap-1.5 sm:grid-cols-6" onMouseLeave={() => focusField(null)}>
          {ORDER.map((id) => {
            const f = FIELDS.find((x) => x.id === id)!;
            const confirmed = !!state.confirmed[f.id];
            const isActive = state.activeField === f.id;
            const needs = f.low && !confirmed;
            const compact = COMPACT.includes(f.id);
            const span = f.id === 'employer' ? 'col-span-2 sm:col-span-6' : compact ? 'col-span-2' : 'col-span-1 sm:col-span-3';
            return (
              <li key={f.id} className={span}>
                <div
                  tabIndex={0}
                  data-demo={`field-${f.id}`}
                  onMouseEnter={() => focusField(f)}
                  onFocus={() => focusField(f)}
                  aria-label={`${f.label}: ${f.value}. ${f.low ? 'Low' : 'High'} confidence, ${f.confidence}%. Highlights its source in the original.`}
                  className={`h-full rounded-lg border px-3 py-1.5 transition-colors ${
                    isActive ? 'border-accent bg-accent-tint/40' : needs ? 'border-amber-text/30 bg-amber-tint/50' : 'border-rule bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[12.5px] font-semibold leading-tight text-ink-muted">{f.label}</span>
                    {compact ? <Chip tone="green" className="!px-1.5 !text-[11.5px]">{f.confidence}%</Chip> : <ConfidenceChip f={f} confirmed={confirmed} />}
                  </div>
                  {f.id === 'employer' ? (
                    <div className="font-display text-[17px] font-semibold leading-tight">
                      {f.value} <span className="font-sans text-[13px] font-normal text-ink-soft">· {f.sub}</span>
                    </div>
                  ) : (
                    <>
                      <div className={`font-display font-semibold leading-tight ${compact ? 'text-[15px]' : 'text-[17px]'}`}>{f.value}</div>
                      {f.sub && !compact && <div className="text-[12.5px] leading-snug text-ink-soft">{f.sub}</div>}
                    </>
                  )}
                  {needs && (
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-[12.5px] font-medium leading-tight text-amber-text">{f.lowReason}</span>
                      <Button
                        variant="dark"
                        demo={`confirm-${f.id}`}
                        className="ml-auto !px-3 !py-0.5 !text-[13px]"
                        onClick={() => dispatch({ type: 'CONFIRM_FIELD', field: f.id })}
                        aria-label={`Confirm ${f.label}`}
                      >
                        Confirm
                      </Button>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mt-1.5 grid gap-1.5 sm:grid-cols-2">
          {CHECKS.map((c) => (
            <div key={c.id} className="flex gap-2 rounded-lg border border-verified/30 bg-verified-tint/40 px-3 py-1.5">
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-verified text-white">
                <Check className="h-3 w-3" />
              </span>
              <div>
                <div className="text-[13.5px] font-semibold leading-tight text-verified">{c.label}: pass</div>
                <div className="text-[12.5px] leading-snug text-ink-soft">{c.detail}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-2 flex flex-wrap items-center justify-end gap-3">
          <span className={`text-[14px] font-medium ${ready ? 'text-verified' : 'text-amber-text'}`} aria-live="polite">
            {ready ? 'All fields checked. Ready to share.' : `${remaining} field${remaining === 1 ? '' : 's'} need${remaining === 1 ? 's' : ''} your check before sharing`}
          </span>
          <Button demo="to-share" className="!py-2" disabled={!ready} onClick={() => dispatch({ type: 'GO_STEP', step: 5, unlock: true })}>
            Continue to sharing →
          </Button>
        </div>
      </div>
    </div>
  );
}
