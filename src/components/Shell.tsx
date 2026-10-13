import { useEffect, useRef, useState } from 'react';
import { ACCESS_GOALS, GRACE, PRODUCT_NAME, PROVIDERS, PROVIDERS_WITHOUT_LANDED, STEPS, TAGLINE } from '../data/mock';
import { shareCount, useStore } from '../store';
import { Card, DocIcon, Eyebrow, Toggle } from './ui';
import { PresenterHud } from './Presenter';

export function TopBar() {
  const { state, dispatch } = useStore();
  return (
    <header className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-rule bg-ivory px-4 py-2 lg:flex-nowrap lg:px-6">
      <div className="flex items-baseline gap-3">
        <span className="font-display text-[26px] font-bold leading-none tracking-tight text-ink">
          {PRODUCT_NAME}
          <span className="text-accent">.</span>
        </span>
        <span className="hidden text-[14px] italic text-ink-muted 2xl:inline">{TAGLINE}</span>
      </div>
      <span className="whitespace-nowrap rounded-full border border-ink/15 px-2.5 py-0.5 text-[12.5px] font-medium text-ink-soft">Ship Tonight · Access to finance</span>
      <span className="whitespace-nowrap rounded-full bg-accent-tint px-2.5 py-0.5 text-[12.5px] font-semibold text-accent-dark">Demo mode: synthetic data</span>
      <div className="ml-auto flex flex-wrap items-center gap-3">
        <PresenterHud />
        <div role="group" aria-label="Switch view" className="flex rounded-full border border-ink/20 bg-white p-0.5 text-[14px] font-semibold">
          {(['newcomer', 'institution'] as const).map((v) => (
            <button
              key={v}
              type="button"
              data-demo={`view-${v}`}
              aria-pressed={state.view === v}
              onClick={() => dispatch({ type: 'SET_VIEW', view: v })}
              className={`whitespace-nowrap rounded-full px-3.5 py-1 transition-colors ${state.view === v ? 'bg-ink text-ivory' : 'text-ink hover:bg-ink/5'}`}
            >
              {v === 'newcomer' ? 'Newcomer view' : 'Institution view'}
            </button>
          ))}
        </div>
        <Toggle
          checked={state.presenter.active}
          onChange={(on) => dispatch({ type: on ? 'PRESENTER_START' : 'PRESENTER_STOP' })}
          label="Presenter mode"
          demo="presenter-toggle"
        />
      </div>
    </header>
  );
}

export function ProblemCard() {
  return (
    <Card className="p-4">
      <Eyebrow>The problem</Eyebrow>
      <p className="mt-1.5 font-display text-[18px] font-semibold leading-snug text-ink">Newcomers can afford a flat or a loan but cannot prove it.</p>
      <p className="mt-1.5 text-[14.5px] leading-[1.5] text-ink-soft">
        Their payslips, statements and savings are in another language, format and currency. Providers cannot read or verify them, so they
        refuse or ask for a UK guarantor. The newcomer then resubmits the same documents to every provider.
      </p>
    </Card>
  );
}

export function GraceCard() {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <Eyebrow>The user</Eyebrow>
        <span className="text-[11.5px] font-medium text-ink-muted">Illustrative composite persona</span>
      </div>
      <div className="mt-1.5 flex items-center gap-3">
        <div aria-hidden="true" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-verified-tint font-display text-[20px] font-bold text-verified">
          G
        </div>
        <div>
          <div className="font-display text-[19px] font-semibold leading-tight">Grace, {GRACE.age} · {GRACE.role}</div>
          <div className="text-[13.5px] text-ink-soft">Arrived from {GRACE.origin} {GRACE.arrived}</div>
        </div>
      </div>
      <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-[13.5px] leading-snug">
        <dt className="font-semibold text-ink-muted">Status</dt>
        <dd>{GRACE.visa}</dd>
        <dt className="font-semibold text-ink-muted">Needs</dt>
        <dd>{GRACE.needs}</dd>
        <dt className="font-semibold text-ink-muted">Evidence</dt>
        <dd>
          UK job offer <span className="font-semibold">(GBP)</span>, overseas payslip and bank statement <span className="font-semibold">(PHP)</span>
        </dd>
      </dl>
      <blockquote className="mt-2 border-l-[3px] border-accent pl-3 font-display text-[15px] italic leading-snug text-ink">“{GRACE.quote}”</blockquote>
      <AccessTracker />
    </Card>
  );
}

function AccessTracker() {
  const { state } = useStore();
  const describe = (id: (typeof ACCESS_GOALS)[number]['provider'], before: string): { text: string; tone: string } => {
    const st = state.status[id];
    if (st === 'proceed') return { text: 'Full application', tone: 'text-verified' };
    if (st === 'answered') return { text: 'Documents sent, under review', tone: 'text-ink' };
    if (st === 'info') return { text: 'Provider asked for a document', tone: 'text-amber-text' };
    if (st === 'viewed' || st === 'received') return { text: 'Pack being assessed', tone: 'text-ink' };
    if (state.access[id] === 'pending') return { text: 'Provider requested access', tone: 'text-accent-dark' };
    return { text: before, tone: 'text-ink-muted' };
  };
  return (
    <div className="mt-2 border-t border-rule pt-2">
      <div className="text-[11.5px] font-bold uppercase tracking-[0.12em] text-ink-muted">Grace’s access to finance, live</div>
      <ul className="mt-0.5 space-y-0.5 text-[13.5px]" aria-live="polite">
        {ACCESS_GOALS.map((g) => {
          const d = describe(g.provider, g.before);
          return (
            <li key={g.provider} className="flex justify-between gap-2">
              <span className="font-semibold">{g.goal}</span>
              <span className={`text-right font-medium transition-colors ${d.tone}`}>{d.text}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function Stepper() {
  const { state, dispatch } = useStore();
  const current = state.view === 'institution' ? 6 : state.step;
  return (
    <nav aria-label="Demo steps">
      <ol className="grid grid-cols-3 gap-1.5 sm:grid-cols-6">
        {STEPS.map((s) => {
          const reachable = s.n === 6 || s.n <= state.maxStep;
          const active = current === s.n;
          const done = s.n < current && s.n !== 6;
          return (
            <li key={s.n}>
              <button
                type="button"
                disabled={!reachable}
                aria-current={active ? 'step' : undefined}
                onClick={() => (s.n === 6 ? dispatch({ type: 'SET_VIEW', view: 'institution' }) : dispatch({ type: 'GO_STEP', step: s.n as 1 }))}
                className={`group flex w-full flex-col items-start gap-1 rounded-md px-1 py-1 text-left disabled:cursor-default`}
              >
                <span className={`h-1 w-full rounded-full transition-colors duration-500 ${active ? 'bg-accent' : done ? 'bg-verified' : 'bg-ink/10'}`} />
                <span className={`text-[12.5px] leading-tight sm:whitespace-nowrap ${active ? 'font-bold text-ink' : reachable ? 'font-medium text-ink-soft group-hover:text-ink' : 'text-ink-muted/80'}`}>
                  <span className="tabular-nums">{s.n}.</span> {s.label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function CounterStrip() {
  const { state } = useStore();
  const n = shareCount(state);
  const [pulse, setPulse] = useState(false);
  const prev = useRef(n);
  useEffect(() => {
    if (prev.current === n) return;
    prev.current = n;
    setPulse(true);
    const t = setTimeout(() => setPulse(false), 700);
    return () => clearTimeout(t);
  }, [n]);

  return (
    <div className="grid grid-cols-1 overflow-hidden rounded-xl border border-rule bg-white sm:grid-cols-2" aria-live="polite">
      <div className="flex items-center gap-3.5 border-b border-rule bg-ivory-deep/60 px-4 py-2 sm:border-b-0 sm:border-r">
        <div className="text-center text-ink-muted">
          <div className="font-display text-[38px] font-bold leading-none tabular-nums">{PROVIDERS_WITHOUT_LANDED}</div>
          <div className="text-[10.5px] font-bold uppercase tracking-wide">uploads</div>
        </div>
        <div className="min-w-0">
          <div className="text-[11.5px] font-bold uppercase tracking-[0.12em] text-ink-muted">Without {PRODUCT_NAME}</div>
          <div className="text-[15.5px] font-semibold leading-tight text-ink">
            {PROVIDERS_WITHOUT_LANDED} providers = {PROVIDERS_WITHOUT_LANDED} uploads of the same documents
            <span className="ml-1.5 text-[11px] font-normal text-ink-muted tall:hidden">(illustrative)</span>
          </div>
          <div className="mt-0.5 hidden items-center gap-0.5 text-ink-muted tall:flex" aria-hidden="true">
            {Array.from({ length: PROVIDERS_WITHOUT_LANDED }).map((_, i) => (
              <DocIcon key={i} className="h-3.5 w-3" />
            ))}
            <span className="ml-1.5 text-[11px]">illustrative</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3.5 px-4 py-2">
        <div className="flex items-start gap-1.5 text-verified">
          <div className="text-center">
            <div className="font-display text-[38px] font-bold leading-none tabular-nums">1</div>
            <div className="text-[10.5px] font-bold uppercase tracking-wide">upload</div>
          </div>
          <span aria-hidden="true" className="pt-2 text-[18px] text-ink-muted">→</span>
          <div className="text-center">
            <div className={`font-display text-[38px] font-bold leading-none tabular-nums transition-transform duration-300 ${pulse ? 'scale-125 text-accent-dark' : ''}`}>{n}</div>
            <div className="text-[10.5px] font-bold uppercase tracking-wide">{n === 1 ? 'share' : 'shares'}</div>
          </div>
        </div>
        <div className="min-w-0">
          <div className="text-[11.5px] font-bold uppercase tracking-[0.12em] text-verified">With {PRODUCT_NAME}</div>
          <div className="text-[15.5px] font-semibold leading-tight text-ink" data-demo="counter-with">
            1 upload, shared with {n} provider{n === 1 ? '' : 's'}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-1" aria-hidden="true">
            {PROVIDERS.map((p) => (
              <span
                key={p.id}
                className={`whitespace-nowrap rounded-full px-1.5 text-[10.5px] font-semibold leading-[1.6] transition-colors duration-300 ${state.shares[p.id] ? 'bg-verified text-white' : 'bg-ink/[0.06] text-ink-muted'}`}
              >
                {p.name.replace('Demo ', '')}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function TrustStrip() {
  const { dispatch } = useStore();
  const link = 'rounded px-2 py-1 text-[13.5px] font-semibold text-ivory underline decoration-ivory/40 underline-offset-4 hover:decoration-ivory';
  return (
    <footer className="flex flex-wrap items-center gap-x-4 gap-y-1 bg-ink px-4 py-2.5 text-ivory lg:px-6">
      <p className="text-[14.5px]">
        <span className="font-bold text-accent">Trust:</span> you consent per provider · originals always shown · not a credit decision · you can revoke access.
      </p>
      <div className="ml-auto flex items-center gap-1">
        <button type="button" className={link} onClick={() => dispatch({ type: 'OPEN_DRAWER', drawer: 'why' })}>
          Why now
        </button>
        <button type="button" className={link} onClick={() => dispatch({ type: 'OPEN_DRAWER', drawer: 'numbers' })}>
          The numbers
        </button>
        <button type="button" className={link} onClick={() => dispatch({ type: 'OPEN_DRAWER', drawer: 'trust' })}>
          Trust details
        </button>
      </div>
    </footer>
  );
}
