import { PACKAGES, PROVIDERS, REQUEST_KINDS } from '../data/mock';
import { openRequests, useStore, type ProviderStatus } from '../store';
import { Button, Chip, Toggle } from '../components/ui';

export const STATUS_LABEL: Record<ProviderStatus, { text: string; tone: 'grey' | 'green' | 'amber' | 'ink' }> = {
  none: { text: 'Not shared', tone: 'grey' },
  received: { text: 'Pack received', tone: 'grey' },
  viewed: { text: 'Opened by provider', tone: 'grey' },
  info: { text: 'Documents requested', tone: 'amber' },
  answered: { text: 'Documents sent', tone: 'ink' },
  proceed: { text: 'Full application', tone: 'green' },
};

export function AuditLog({ compact = false }: { compact?: boolean }) {
  const { state } = useStore();
  return (
    <div className="flex min-h-0 flex-col rounded-xl border border-rule bg-white">
      <div className="flex items-center justify-between border-b border-rule px-3 py-2">
        <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-ink-muted">Audit log</span>
        <span className="text-[11.5px] text-ink-muted">Live · this session only</span>
      </div>
      <ol className={`min-h-0 flex-1 overflow-y-auto px-3 py-1.5 text-[13px] ${compact ? 'max-h-[120px]' : 'max-h-[210px]'}`} aria-live="polite">
        {state.audit.length === 0 && <li className="py-1 text-ink-muted">No activity yet.</li>}
        {state.audit.map((e) => (
          <li key={e.id} className="flex gap-2 border-b border-dashed border-rule py-1 last:border-0 animate-[fadeIn_.35s_ease]">
            <span className="shrink-0 font-mono text-[11.5px] text-ink-muted tabular-nums">{e.time}</span>
            <span className={`shrink-0 font-semibold ${e.actor === 'Provider' ? 'text-accent-dark' : e.actor === 'Landed' ? 'text-verified' : 'text-ink'}`}>{e.actor}</span>
            <span className="text-ink-soft">{e.text}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function RequestsInbox() {
  const { state, dispatch } = useStore();
  const reqs = state.requests.filter((r) => state.shares[r.provider]);
  if (reqs.length === 0) return null;
  return (
    <div className="rounded-xl border-2 border-amber-text/30 bg-amber-tint/40 px-3 py-2.5" aria-live="polite">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-amber-text">Requests from providers</span>
        <span className="text-[11.5px] font-medium text-ink-muted">Answered on Landed, no emails</span>
      </div>
      <ul className="mt-1.5 space-y-1.5">
        {reqs.map((r) => {
          const k = REQUEST_KINDS.find((x) => x.id === r.kind)!;
          const p = PROVIDERS.find((x) => x.id === r.provider)!;
          return (
            <li key={r.id} className="flex items-center gap-2 rounded-lg bg-white px-3 py-2">
              <div className="min-w-0">
                <div className="text-[14.5px] font-semibold leading-tight">{k.label}</div>
                <div className="text-[12.5px] text-ink-muted">
                  {p.name} · {r.status === 'open' ? k.why : `Sent: ${k.fulfil}`}
                </div>
              </div>
              {r.status === 'open' ? (
                <Button demo={`fulfil-${r.kind}`} className="ml-auto !px-3 !py-1 !text-[13px]" onClick={() => dispatch({ type: 'FULFIL_REQUEST', id: r.id })}>
                  Add and send
                </Button>
              ) : (
                <Chip tone="green" className="ml-auto">Sent</Chip>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function Step5Share() {
  const { state, dispatch } = useStore();
  const anyShared = Object.values(state.shares).some(Boolean);
  return (
    <div className="grid flex-1 gap-4 lg:grid-cols-[1.35fr_1fr]">
      <div className="flex min-w-0 flex-col gap-3">
        <fieldset>
          <legend className="mb-1.5 flex w-full items-center justify-between text-[12px] font-bold uppercase tracking-[0.12em] text-ink-muted">
            Choose a package <span className="normal-case tracking-normal text-[12px] font-semibold text-accent-dark">Pricing to be tested</span>
          </legend>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {PACKAGES.map((p) => {
              const on = state.pkg === p.id;
              return (
                <label
                  key={p.id}
                  data-demo={`pkg-${p.id}`}
                  className={`cursor-pointer rounded-lg border-2 px-3 py-1.5 transition-colors focus-within:ring-2 focus-within:ring-accent ${on ? 'border-ink bg-white' : 'border-rule bg-white/60 hover:border-ink/40'}`}
                >
                  <input type="radio" name="pkg" value={p.id} checked={on} onChange={() => dispatch({ type: 'SET_PKG', pkg: p.id })} className="sr-only" />
                  <div className="flex items-center gap-2">
                    <span className={`h-3.5 w-3.5 rounded-full border-2 ${on ? 'border-ink bg-ink shadow-[inset_0_0_0_2px_white]' : 'border-ink/40'}`} />
                    <span className="font-display text-[16px] font-semibold">{p.name}</span>
                  </div>
                  <div className="mt-0.5 text-[12.5px] leading-snug text-ink-soft">{p.desc}</div>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div>
          <div className="mb-1.5 flex items-center justify-between text-[12px] font-bold uppercase tracking-[0.12em] text-ink-muted">
            Access requests from providers <span className="normal-case tracking-normal text-[11.5px] font-medium">Fictional providers</span>
          </div>
          <ul className="space-y-2">
            {PROVIDERS.map((p) => {
              const shared = state.shares[p.id];
              const acc = state.access[p.id];
              const canApprove = shared || acc === 'pending' || acc === 'declined';
              const st = STATUS_LABEL[state.status[p.id]];
              const line =
                acc === 'approved'
                  ? `Until ${state.expiry[p.id]}`
                  : acc === 'pending'
                    ? 'Asked for access'
                    : acc === 'declined'
                      ? 'You declined this request'
                      : acc === 'revoked'
                        ? 'Access revoked by you'
                        : 'Has not asked for access';
              return (
                <li
                  key={p.id}
                  className={`flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-lg border px-3 py-2 transition-colors sm:flex-nowrap ${
                    shared ? 'border-verified/40 bg-white' : acc === 'pending' ? 'border-accent/50 bg-white' : 'border-rule bg-white/60'
                  }`}
                >
                  <span className={canApprove ? '' : 'pointer-events-none opacity-40'}>
                    <Toggle checked={shared} onChange={(v) => dispatch({ type: 'SET_SHARE', provider: p.id, shared: v })} demo={`share-${p.id}`} srLabel={`Approve access for ${p.name}`} />
                  </span>
                  <div className="min-w-[150px] flex-1">
                    <div className="text-[15.5px] font-semibold leading-tight">{p.name}</div>
                    <div className="text-[12.5px] leading-snug text-ink-muted">
                      {line} · wants {p.scope.join(', ').toLowerCase()}
                    </div>
                  </div>
                  {shared ? (
                    <>
                      <Chip tone={st.tone}>{st.text}</Chip>
                      <Button variant="outline" className="!px-3 !py-1 !text-[13px]" onClick={() => dispatch({ type: 'SET_SHARE', provider: p.id, shared: false })} aria-label={`Revoke access for ${p.name}`}>
                        Revoke
                      </Button>
                    </>
                  ) : acc === 'pending' ? (
                    <>
                      <Chip tone="orange">Request waiting</Chip>
                      <Button variant="outline" className="!px-3 !py-1 !text-[13px]" onClick={() => dispatch({ type: 'DECLINE_ACCESS', provider: p.id })} aria-label={`Decline access for ${p.name}`}>
                        Decline
                      </Button>
                    </>
                  ) : (
                    <Chip tone="grey">No access</Chip>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-3">
        <div className="rounded-xl border border-rule bg-ivory-deep/60 px-3.5 py-2.5 text-[13.5px] leading-snug text-ink-soft">
          <strong className="text-ink">Providers ask, you decide.</strong> Nothing is sent out by default. A provider sees only what it asked for and you approved, until the expiry date. Requests and replies stay on Landed.
        </div>
        <RequestsInbox />
        <AuditLog compact={openRequests(state).length > 0 || state.requests.length > 0} />
        <Button variant="dark" demo="to-institution" disabled={!anyShared} onClick={() => dispatch({ type: 'SET_VIEW', view: 'institution' })} className="mt-auto self-end">
          See what a provider sees →
        </Button>
      </div>
    </div>
  );
}
