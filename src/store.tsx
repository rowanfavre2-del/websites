import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from 'react';
import {
  DEMO_TODAY,
  PACKAGES,
  PROVIDERS,
  addDays,
  fmtDate,
  type DocId,
  type FieldId,
  REQUEST_KINDS,
  type PackageId,
  type ProviderId,
  type RequestKind,
} from './data/mock';

export type View = 'newcomer' | 'institution';
export type NewcomerStep = 1 | 2 | 3 | 4 | 5;
export type ProviderStatus = 'none' | 'received' | 'viewed' | 'info' | 'answered' | 'proceed';
export type Access = 'none' | 'pending' | 'approved' | 'declined' | 'revoked';
export type DrawerId = 'why' | 'numbers' | 'trust';

export interface AuditEntry {
  id: number;
  time: string;
  text: string;
  actor: 'Grace' | 'Landed' | 'Provider';
}

export interface DocRequest {
  id: number;
  provider: ProviderId;
  kind: RequestKind;
  status: 'open' | 'fulfilled';
  time: string;
}

export interface State {
  view: View;
  step: NewcomerStep;
  maxStep: NewcomerStep;
  docs: Record<DocId, boolean>;
  readingDone: boolean;
  confirmed: Partial<Record<FieldId, boolean>>;
  activeField: FieldId | null;
  pkg: PackageId;
  /** Providers ask for access; Grace approves. `shares` mirrors access === 'approved'. */
  access: Record<ProviderId, Access>;
  shares: Record<ProviderId, boolean>;
  expiry: Record<ProviderId, string | null>;
  status: Record<ProviderId, ProviderStatus>;
  instProvider: ProviderId;
  audit: AuditEntry[];
  requests: DocRequest[];
  notice: string | null;
  presenter: { active: boolean; paused: boolean; runId: number };
  caption: string | null;
  cursor: string | null;
  drawer: DrawerId | null;
}

export type Action =
  | { type: 'RESET' }
  | { type: 'GO_STEP'; step: NewcomerStep; unlock?: boolean }
  | { type: 'SET_VIEW'; view: View }
  | { type: 'ADD_DOC'; doc: DocId }
  | { type: 'ADD_ALL_DOCS'; fileName?: string }
  | { type: 'START_READING' }
  | { type: 'FINISH_READING' }
  | { type: 'SET_ACTIVE_FIELD'; field: FieldId | null }
  | { type: 'CONFIRM_FIELD'; field: FieldId }
  | { type: 'SET_PKG'; pkg: PackageId }
  | { type: 'SET_SHARE'; provider: ProviderId; shared: boolean }
  | { type: 'REQUEST_ACCESS'; provider: ProviderId }
  | { type: 'DECLINE_ACCESS'; provider: ProviderId }
  | { type: 'SET_INST_PROVIDER'; provider: ProviderId }
  | { type: 'PROVIDER_VIEW'; provider: ProviderId }
  | { type: 'PROVIDER_ACTION'; provider: ProviderId; action: 'proceed' }
  | { type: 'REQUEST_DOCS'; provider: ProviderId; kinds: RequestKind[] }
  | { type: 'FULFIL_REQUEST'; id: number }
  | { type: 'DISMISS_NOTICE' }
  | { type: 'PRESENTER_START' }
  | { type: 'PRESENTER_STOP'; keepCaption?: boolean }
  | { type: 'PRESENTER_TOGGLE_PAUSE' }
  | { type: 'SET_CAPTION'; caption: string | null }
  | { type: 'SET_CURSOR'; target: string | null }
  | { type: 'OPEN_DRAWER'; drawer: DrawerId | null };

const allProviders = <T,>(v: T): Record<ProviderId, T> => ({ lettings: v, motor: v, cu: v });

export const initialState: State = {
  view: 'newcomer',
  step: 1,
  maxStep: 1,
  docs: { offer: false, payslip: false, statement: false },
  readingDone: false,
  confirmed: {},
  activeField: null,
  pkg: 'starter',
  access: allProviders<Access>('none'),
  shares: allProviders(false),
  expiry: allProviders<string | null>(null),
  status: allProviders<ProviderStatus>('none'),
  instProvider: 'lettings',
  audit: [],
  requests: [],
  notice: null,
  presenter: { active: false, paused: false, runId: 0 },
  caption: null,
  cursor: null,
  drawer: null,
};

let auditSeq = 0;
let reqSeq = 0;
// Demo clock: real time of day, formatted the UK way.
const now = () => new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
const log = (s: State, actor: AuditEntry['actor'], text: string): AuditEntry[] =>
  [{ id: ++auditSeq, time: now(), actor, text }, ...s.audit].slice(0, 30);

const providerName = (id: ProviderId) => PROVIDERS.find((p) => p.id === id)!.name;
const requestAccess = (s: State, id: ProviderId): State => ({
  ...s,
  access: { ...s.access, [id]: 'pending' },
  audit: log(s, 'Provider', `${providerName(id)} requested access to Grace’s pack`),
});
/** Presenter captions are cleared as soon as someone navigates by hand. */
const keepCap = (s: State) => (s.presenter.active ? s.caption : null);
const maxOf = (a: NewcomerStep, b: NewcomerStep) => (a > b ? a : b) as NewcomerStep;

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'RESET':
      return { ...initialState, presenter: s.presenter, drawer: null };
    case 'GO_STEP': {
      if (!a.unlock && a.step > s.maxStep) return s;
      let next: State = { ...s, view: 'newcomer', step: a.step, maxStep: maxOf(s.maxStep, a.step), activeField: null, caption: keepCap(s) };
      // First time Grace reaches sharing: the providers she applied to ask for access through Landed.
      if (a.step === 5 && s.maxStep < 5) {
        for (const p of PROVIDERS) if (next.access[p.id] === 'none') next = requestAccess(next, p.id);
      }
      return next;
    }
    case 'SET_VIEW':
      return { ...s, view: a.view, activeField: null, caption: keepCap(s) };
    case 'ADD_DOC':
      if (s.docs[a.doc]) return s;
      return { ...s, docs: { ...s.docs, [a.doc]: true }, audit: log(s, 'Grace', `Added ${a.doc === 'offer' ? 'UK job offer' : a.doc === 'payslip' ? 'overseas payslip' : 'overseas bank statement'}`) };
    case 'ADD_ALL_DOCS':
      return {
        ...s,
        docs: { offer: true, payslip: true, statement: true },
        audit: log(s, 'Grace', a.fileName ? `Uploaded "${a.fileName}" (demo reads sample documents)` : 'Added all three documents'),
      };
    case 'START_READING':
      return { ...s, view: 'newcomer', step: 3, maxStep: maxOf(s.maxStep, 3), readingDone: false, caption: keepCap(s) };
    case 'FINISH_READING':
      if (s.step !== 3) return s;
      return { ...s, step: 4, maxStep: maxOf(s.maxStep, 4), readingDone: true, audit: log(s, 'Landed', 'Read 3 documents, 8 fields, 2 flagged for review') };
    case 'SET_ACTIVE_FIELD':
      return s.activeField === a.field ? s : { ...s, activeField: a.field };
    case 'CONFIRM_FIELD':
      if (s.confirmed[a.field]) return s;
      return { ...s, confirmed: { ...s.confirmed, [a.field]: true }, audit: log(s, 'Grace', `Confirmed ${a.field === 'savings' ? 'savings balance' : 'previous monthly pay'}`) };
    case 'SET_PKG': {
      const days = PACKAGES.find((p) => p.id === a.pkg)!.shareDays;
      const expiry = { ...s.expiry };
      (Object.keys(expiry) as ProviderId[]).forEach((k) => {
        if (s.shares[k]) expiry[k] = fmtDate(addDays(DEMO_TODAY, days));
      });
      return { ...s, pkg: a.pkg, expiry, audit: log(s, 'Grace', `Chose ${PACKAGES.find((p) => p.id === a.pkg)!.name} package`) };
    }
    case 'SET_SHARE': {
      if (s.shares[a.provider] === a.shared) return s;
      // Grace can only approve a provider that has asked for access.
      if (a.shared && !['pending', 'declined'].includes(s.access[a.provider])) return s;
      const days = PACKAGES.find((p) => p.id === s.pkg)!.shareDays;
      const exp = fmtDate(addDays(DEMO_TODAY, days));
      const name = providerName(a.provider);
      return {
        ...s,
        access: { ...s.access, [a.provider]: a.shared ? 'approved' : 'revoked' },
        shares: { ...s.shares, [a.provider]: a.shared },
        expiry: { ...s.expiry, [a.provider]: a.shared ? exp : null },
        status: { ...s.status, [a.provider]: a.shared ? 'received' : 'none' },
        requests: a.shared ? s.requests : s.requests.filter((r) => r.provider !== a.provider),
        audit: log(s, 'Grace', a.shared ? `Approved access for ${name}, expires ${exp}` : `Revoked access for ${name}`),
      };
    }
    case 'REQUEST_ACCESS':
      if (['pending', 'approved'].includes(s.access[a.provider])) return s;
      return { ...requestAccess(s, a.provider), notice: `${providerName(a.provider)} requested access to your pack` };
    case 'DECLINE_ACCESS':
      if (s.access[a.provider] !== 'pending') return s;
      return { ...s, access: { ...s.access, [a.provider]: 'declined' }, audit: log(s, 'Grace', `Declined access request from ${providerName(a.provider)}`) };
    case 'SET_INST_PROVIDER':
      return { ...s, view: 'institution', instProvider: a.provider, caption: keepCap(s) };
    case 'PROVIDER_VIEW':
      if (s.status[a.provider] !== 'received') return s;
      return { ...s, status: { ...s.status, [a.provider]: 'viewed' }, audit: log(s, 'Provider', `${providerName(a.provider)} opened the pack`) };
    case 'PROVIDER_ACTION': {
      if (!s.shares[a.provider]) return s;
      const text = `${providerName(a.provider)} moved Grace to a full application`;
      return { ...s, status: { ...s.status, [a.provider]: 'proceed' }, audit: log(s, 'Provider', text), notice: text };
    }
    case 'REQUEST_DOCS': {
      if (!s.shares[a.provider]) return s;
      const fresh = a.kinds.filter((k) => !s.requests.some((r) => r.provider === a.provider && r.kind === k && r.status === 'open'));
      if (fresh.length === 0) return s;
      const name = providerName(a.provider);
      const labels = fresh.map((k) => REQUEST_KINDS.find((r) => r.id === k)!.label).join(', ');
      const t = now();
      const added: DocRequest[] = fresh.map((k) => ({ id: ++reqSeq, provider: a.provider, kind: k, status: 'open', time: t }));
      const text = `${name} requested: ${labels}`;
      return { ...s, requests: [...s.requests, ...added], status: { ...s.status, [a.provider]: 'info' }, audit: log(s, 'Provider', text), notice: text };
    }
    case 'FULFIL_REQUEST': {
      const r = s.requests.find((x) => x.id === a.id);
      if (!r || r.status === 'fulfilled' || !s.shares[r.provider]) return s;
      const requests = s.requests.map((x) => (x.id === a.id ? { ...x, status: 'fulfilled' as const, time: now() } : x));
      const stillOpen = requests.some((x) => x.provider === r.provider && x.status === 'open');
      const label = REQUEST_KINDS.find((k) => k.id === r.kind)!.label;
      return {
        ...s,
        requests,
        status: { ...s.status, [r.provider]: stillOpen ? 'info' : 'answered' },
        audit: log(s, 'Grace', `Sent ${label} to ${providerName(r.provider)}`),
        notice: stillOpen ? s.notice : null,
      };
    }
    case 'DISMISS_NOTICE':
      return { ...s, notice: null };
    case 'PRESENTER_START':
      return { ...initialState, presenter: { active: true, paused: false, runId: s.presenter.runId + 1 } };
    case 'PRESENTER_STOP':
      return { ...s, presenter: { ...s.presenter, active: false, paused: false }, cursor: null, caption: a.keepCaption ? s.caption : null };
    case 'PRESENTER_TOGGLE_PAUSE':
      if (!s.presenter.active) return s;
      return { ...s, presenter: { ...s.presenter, paused: !s.presenter.paused } };
    case 'SET_CAPTION':
      return { ...s, caption: a.caption };
    case 'SET_CURSOR':
      return { ...s, cursor: a.target };
    case 'OPEN_DRAWER':
      return { ...s, drawer: a.drawer };
  }
}

const Ctx = createContext<{ state: State; dispatch: Dispatch<Action> } | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <Ctx.Provider value={{ state, dispatch }}>{children}</Ctx.Provider>;
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useStore must be used inside StoreProvider');
  return v;
}

export const pendingAccess = (s: State) => PROVIDERS.filter((p) => s.access[p.id] === 'pending');
export const shareCount = (s: State) => Object.values(s.shares).filter(Boolean).length;
export const allDocsAdded = (s: State) => Object.values(s.docs).every(Boolean);
export const lowConfirmed = (s: State) => !!s.confirmed.prevPay && !!s.confirmed.savings;

export const openRequests = (s: State) => s.requests.filter((r) => r.status === 'open' && s.shares[r.provider]);
