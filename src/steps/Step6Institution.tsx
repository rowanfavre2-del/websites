import { useEffect, useState } from 'react';
import { DOCS, FIELDS, GRACE, PROVIDERS, REQUEST_KINDS, type Criterion, type ProviderId, type RequestKind } from '../data/mock';
import { useStore } from '../store';
import { ScaledDoc } from '../components/Documents';
import { Button, Check, Chip } from '../components/ui';
import { STATUS_LABEL } from './Step5Share';

const SUMMARY_IDS = ['employer', 'salary', 'monthly', 'start', 'savings', 'dates'] as const;

function Badge({ label, state }: { label: string; state: 'done' | 'no' | 'requested' }) {
  const tone = state === 'done' ? 'green' : state === 'requested' ? 'amber' : 'grey';
  const text = state === 'done' ? 'done' : state === 'requested' ? 'requested, not yet' : 'not yet';
  return (
    <Chip tone={tone} className="!text-[13px] !py-1">
      {state === 'done' ? <Check className="h-3.5 w-3.5" /> : <span aria-hidden="true">○</span>}
      {label}: {text}
    </Chip>
  );
}

function CriterionRow({ c }: { c: Criterion }) {
  const color = c.state === 'pass' ? 'text-verified' : c.state === 'check' ? 'text-amber-text' : 'text-ink-muted';
  return (
    <li className="flex items-start gap-2 border-b border-dashed border-rule py-1 last:border-0">
      <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ${c.state === 'pass' ? 'bg-verified text-white' : c.state === 'check' ? 'bg-amber-tint text-amber-text' : 'bg-ink/[0.07] text-ink-muted'}`}>
        {c.state === 'pass' ? <Check className="h-3 w-3" /> : <span className="text-[12px] font-bold">{c.state === 'check' ? '!' : '–'}</span>}
      </span>
      <div className="min-w-0">
        <div className="text-[14px] font-medium leading-tight text-ink">{c.label}</div>
        <div className={`text-[13px] font-semibold ${color}`}>{c.result}</div>
      </div>
    </li>
  );
}

function RequestPanel({ provider, onClose }: { provider: ProviderId; onClose: () => void }) {
  const { state, dispatch } = useStore();
  const defaults: RequestKind[] = provider === 'lettings' ? ['address'] : provider === 'motor' ? ['payslips'] : ['rtw'];
  const [picked, setPicked] = useState<RequestKind[]>(defaults);
  const alreadyOpen = (k: RequestKind) => state.requests.some((r) => r.provider === provider && r.kind === k && r.status === 'open');
  return (
    <div className="absolute left-0 right-0 top-0 z-10 flex min-h-full flex-col rounded-lg border-2 border-ink bg-white p-3 shadow-paper" role="dialog" aria-label="Request documents from Grace">
      <div className="flex items-center justify-between">
        <span className="font-display text-[17px] font-semibold">Request documents from Grace</span>
        <button type="button" onClick={onClose} className="rounded px-1.5 text-[18px] leading-none text-ink-muted hover:text-ink" aria-label="Close">×</button>
      </div>
      <p className="text-[12.5px] text-ink-soft">She is notified on Landed and replies there. Answers are read and added to this pack.</p>
      <ul className="mt-1.5 space-y-1">
        {REQUEST_KINDS.map((k) => {
          const open = alreadyOpen(k.id);
          return (
            <li key={k.id}>
              <label className={`flex cursor-pointer items-center gap-2 rounded px-1.5 py-1 text-[14px] hover:bg-ink/[0.04] ${open ? 'opacity-55' : ''}`}>
                <input
                  type="checkbox"
                  data-demo={`req-${k.id}`}
                  disabled={open}
                  checked={open || picked.includes(k.id)}
                  onChange={(e) => setPicked((p) => (e.target.checked ? [...p, k.id] : p.filter((x) => x !== k.id)))}
                  className="h-4 w-4 accent-[#0B1B2B]"
                />
                {k.label}
                {open && <span className="text-[12px] text-ink-muted">(already requested)</span>}
              </label>
            </li>
          );
        })}
      </ul>
      <Button
        variant="dark"
        demo="req-send"
        className="mt-2 self-end !px-3.5 !py-1.5 !text-[14px]"
        disabled={picked.filter((k) => !alreadyOpen(k)).length === 0}
        onClick={() => {
          dispatch({ type: 'REQUEST_DOCS', provider, kinds: picked });
          onClose();
        }}
      >
        Send request on Landed
      </Button>
    </div>
  );
}

function RequestList({ provider }: { provider: ProviderId }) {
  const { state } = useStore();
  const reqs = state.requests.filter((r) => r.provider === provider);
  if (reqs.length === 0) return null;
  return (
    <ul className="mt-1.5 space-y-1" aria-live="polite">
      {reqs.map((r) => {
        const k = REQUEST_KINDS.find((x) => x.id === r.kind)!;
        return (
          <li key={r.id} className={`rounded-md px-2 py-1 text-[13px] ${r.status === 'open' ? 'bg-amber-tint/70' : 'bg-verified-tint/60'}`}>
            <span className="font-semibold">{k.label}:</span>{' '}
            {r.status === 'open' ? <span className="text-amber-text">waiting for Grace</span> : <span className="text-verified">received on Landed {r.time}</span>}
          </li>
        );
      })}
    </ul>
  );
}

export function Step6Institution() {
  const { state, dispatch } = useStore();
  const pid = state.instProvider;
  const provider = PROVIDERS.find((p) => p.id === pid)!;
  const shared = state.shares[pid];
  const status = state.status[pid];
  const confirmedAll = !!state.confirmed.prevPay && !!state.confirmed.savings;
  const [requesting, setRequesting] = useState(false);
  useEffect(() => setRequesting(false), [pid]);

  useEffect(() => {
    if (shared) dispatch({ type: 'PROVIDER_VIEW', provider: pid });
  }, [shared, pid, dispatch]);

  return (
    <div className="flex flex-1 flex-col gap-3">
      {/* Provider header */}
      <div className="flex flex-wrap items-center gap-3">
        <div role="tablist" aria-label="Provider" className="flex max-w-full gap-1 overflow-x-auto rounded-full bg-ink/[0.06] p-1">
          {PROVIDERS.map((p) => (
            <button
              key={p.id}
              role="tab"
              type="button"
              aria-selected={pid === p.id}
              data-demo={`inst-${p.id}`}
              onClick={() => dispatch({ type: 'SET_INST_PROVIDER', provider: p.id })}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-[13.5px] font-semibold ${pid === p.id ? 'bg-white text-ink shadow-soft' : 'text-ink-soft hover:text-ink'}`}
            >
              <span className={`h-2 w-2 rounded-full ${state.shares[p.id] ? 'bg-verified' : 'bg-ink/25'}`} aria-hidden="true" />
              {p.name}
            </button>
          ))}
        </div>
        <p className="min-w-[230px] flex-1 basis-0 text-right font-display text-[15.5px] font-semibold leading-tight text-ink">One consistent pack. No re-reading foreign documents.</p>
      </div>

      {!shared ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-ink/25 bg-white/60 p-8 text-center">
          <div className="font-display text-[22px] font-semibold">
            {state.access[pid] === 'pending'
              ? `Access requested. Waiting for Grace to approve.`
              : state.access[pid] === 'declined'
                ? 'Grace declined this request'
                : state.access[pid] === 'revoked'
                  ? 'Grace revoked access'
                  : `${provider.name} has no access to Grace’s pack`}
          </div>
          <p className="max-w-[52ch] text-[15px] text-ink-soft">
            Landed does not hand out data. Providers request access to the parts they need ({provider.scope.join(', ').toLowerCase()}), the request is paid for by the provider, and
            Grace decides. Pricing to be tested.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {state.access[pid] !== 'pending' && (
              <Button variant="dark" demo="inst-request-access" onClick={() => dispatch({ type: 'REQUEST_ACCESS', provider: pid })}>
                Request access to Grace’s pack
              </Button>
            )}
            <Button variant="outline" onClick={() => dispatch({ type: 'SET_VIEW', view: 'newcomer' })}>
              Go to Grace’s view
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-2 rounded-xl border border-rule bg-white px-4 py-3 shadow-soft">
          <div className="flex flex-wrap items-start gap-3">
            <div>
              <div className="text-[12px] font-bold uppercase tracking-[0.12em] text-ink-muted">Applicant pack · {provider.wants}</div>
              <div className="font-display text-[20px] font-semibold leading-tight">
                {GRACE.name} <span className="text-[14.5px] font-normal text-ink-soft">· {GRACE.visa} · access until {state.expiry[pid]}</span>
              </div>
            </div>
            <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
              <Chip tone={STATUS_LABEL[status].tone} className="!py-1 !text-[13.5px]">
                <span className="font-normal">Status:</span> {STATUS_LABEL[status].text}
              </Chip>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge label="Machine-read" state="done" />
            <Badge label="Translator-reviewed" state={state.pkg === 'starter' ? 'no' : 'requested'} />
            <Badge label="Employer-confirmed" state={state.pkg === 'full' ? 'requested' : 'no'} />
            {confirmedAll && <span className="text-[12.5px] font-medium text-ink-soft">Flagged fields confirmed by Grace</span>}
            <div className="ml-auto flex flex-wrap gap-2">
                <Button variant="outline" demo="inst-info" className="!px-3 !py-1.5 !text-[13.5px]" aria-expanded={requesting} onClick={() => setRequesting(true)}>
                  Request more information
                </Button>
                <Button variant="dark" demo="inst-proceed" className="!px-3 !py-1.5 !text-[13.5px]" onClick={() => dispatch({ type: 'PROVIDER_ACTION', provider: pid, action: 'proceed' })}>
                  Proceed to full application
                </Button>
            </div>
          </div>

          <div className="grid flex-1 gap-4 md:grid-cols-[1fr_1fr_auto]">
            <div>
              <div className="mb-1 text-[12px] font-bold uppercase tracking-[0.12em] text-ink-muted">Standardised summary (GBP)</div>
              <div className="text-[12px] text-ink-muted">
                Shared with consent: {provider.scope.join(', ').toLowerCase()}
              </div>
              <dl className="divide-y divide-dashed divide-rule">
                {SUMMARY_IDS.map((id) => {
                  const f = FIELDS.find((x) => x.id === id)!;
                  if (id === 'savings' && !provider.scope.includes('Savings'))
                    return (
                      <div key={id} className="flex items-baseline justify-between gap-3 py-1">
                        <dt className="text-[13.5px] text-ink-muted">{f.label}</dt>
                        <dd className="text-right text-[13px] italic text-ink-muted">Not requested, not shared</dd>
                      </div>
                    );
                  return (
                    <div key={id} className="flex items-baseline justify-between gap-3 py-1">
                      <dt className="text-[13.5px] text-ink-muted">{f.label}</dt>
                      <dd className="text-right text-[14.5px] font-semibold leading-tight">
                        {f.id === 'savings' ? 'About £5,400' : f.id === 'employer' ? f.value.replace(' Hospital Trust', ' Hosp. Trust') : f.value}
                        {f.id === 'savings' && <div className="text-[11.5px] font-normal text-ink-muted">PHP 400,000 · illustrative rate</div>}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </div>
            <div className="relative flex flex-col">
              {requesting && <RequestPanel provider={pid} onClose={() => setRequesting(false)} />}
              <div className="mb-1 text-[12px] font-bold uppercase tracking-[0.12em] text-ink-muted">Your criteria (illustrative)</div>
              <ul>{provider.criteria.map((c) => <CriterionRow key={c.label} c={c} />)}</ul>
              <RequestList provider={pid} />
            </div>
            <div className="hidden md:block">
              <div className="mb-1 text-[12px] font-bold uppercase tracking-[0.12em] text-ink-muted">Originals</div>
              <div className="flex flex-col gap-1.5">
                {DOCS.map((d) => (
                  <div key={d.id} className="flex items-center gap-2">
                    <div className="overflow-hidden rounded-sm">
                      <ScaledDoc id={d.id} scale={0.16} />
                    </div>
                    <span className="w-[72px] text-[12px] leading-tight text-ink-soft">{d.short}<br /><span className="text-ink-muted">{d.currency}</span></span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 border-t border-rule pt-1.5 text-[12.5px]">
            <p className="font-semibold text-ink-soft">Requests and replies stay on Landed: no email chains, no re-uploads.</p>
            <p className="ml-auto text-ink-muted">{provider.name} is fictional · not a credit decision · machine-read, not verified, unless marked</p>
          </div>
        </div>
      )}
    </div>
  );
}
