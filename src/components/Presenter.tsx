import { useEffect, useRef, useState } from 'react';
import { useStore, type Action, type State } from '../store';

/**
 * Presenter mode: plays the whole demo unattended in about 75 seconds.
 * Space pauses or resumes, Esc exits. Time only advances while not paused,
 * so pausing never skips a beat.
 */

type Beat = { t: number; run: (ctx: Ctx) => void };
type Ctx = { dispatch: (a: Action) => void; state: () => State };

export const TOTAL_MS = 75_000;

const press = (target: string) => window.dispatchEvent(new CustomEvent('landed-press', { detail: target }));
const domClick = (target: string) => {
  const el = document.querySelector<HTMLElement>(`[data-demo="${target}"]`);
  if (el) el.click();
  return !!el;
};

const beats: Beat[] = [];
const at = (sec: number, run: Beat['run']) => beats.push({ t: sec * 1000, run });
/** Moves the cursor to a target, then "clicks" it 0.7 s later. */
const click = (sec: number, target: string, run: Beat['run']) => {
  at(sec - 0.7, ({ dispatch }) => dispatch({ type: 'SET_CURSOR', target }));
  at(sec, (ctx) => {
    press(target);
    run(ctx);
  });
};
const hover = (sec: number, target: string, run: Beat['run']) => at(sec, (ctx) => {
  ctx.dispatch({ type: 'SET_CURSOR', target });
  run(ctx);
});
const caption = (sec: number, text: string | null) => at(sec, ({ dispatch }) => dispatch({ type: 'SET_CAPTION', caption: text }));

// 1. The refusal
caption(0.1, 'Grace has a job, a salary and savings. Two providers still said no, because her proof of income is from overseas.');
click(5, 'try-landed', ({ dispatch }) => dispatch({ type: 'GO_STEP', step: 2, unlock: true }));
// 2. Add documents
caption(5.1, null);
click(7, 'add-offer', ({ dispatch }) => dispatch({ type: 'ADD_DOC', doc: 'offer' }));
click(8.2, 'add-payslip', ({ dispatch }) => dispatch({ type: 'ADD_DOC', doc: 'payslip' }));
click(9.4, 'add-statement', ({ dispatch }) => dispatch({ type: 'ADD_DOC', doc: 'statement' }));
click(11, 'read-docs', ({ dispatch }) => dispatch({ type: 'START_READING' }));
// 3. Reading runs on its own (about 4 s) and advances to the summary.
at(11.1, ({ dispatch }) => dispatch({ type: 'SET_CURSOR', target: null }));
at(15.6, ({ dispatch }) => dispatch({ type: 'FINISH_READING' }));
// 4. Summary
hover(16.6, 'field-salary', ({ dispatch }) => dispatch({ type: 'SET_ACTIVE_FIELD', field: 'salary' }));
hover(18.4, 'field-prevPay', ({ dispatch }) => dispatch({ type: 'SET_ACTIVE_FIELD', field: 'prevPay' }));
click(19.8, 'confirm-prevPay', ({ dispatch }) => dispatch({ type: 'CONFIRM_FIELD', field: 'prevPay' }));
hover(21.2, 'field-savings', ({ dispatch }) => dispatch({ type: 'SET_ACTIVE_FIELD', field: 'savings' }));
click(22.8, 'confirm-savings', ({ dispatch }) => dispatch({ type: 'CONFIRM_FIELD', field: 'savings' }));
click(24.6, 'to-share', ({ dispatch }) => dispatch({ type: 'GO_STEP', step: 5, unlock: true }));
// 5. Consent and share: providers have asked, Grace approves each one.
caption(24.7, 'Three providers ask to see Grace’s pack. Landed sends nothing until she approves, per provider, with an expiry date.');
click(27.6, 'share-lettings', ({ dispatch }) => dispatch({ type: 'SET_SHARE', provider: 'lettings', shared: true }));
click(29.1, 'share-motor', ({ dispatch }) => dispatch({ type: 'SET_SHARE', provider: 'motor', shared: true }));
click(30.6, 'share-cu', ({ dispatch }) => dispatch({ type: 'SET_SHARE', provider: 'cu', shared: true }));
// 6. Institution view
click(32.8, 'to-institution', ({ dispatch }) => {
  dispatch({ type: 'SET_INST_PROVIDER', provider: 'lettings' });
});
caption(32.9, 'Demo Lettings Co. gets one consistent pack with an honest status. No foreign paperwork to decode.');
click(36.6, 'inst-info', () => {
  domClick('inst-info');
});
caption(36.7, 'The provider needs one more document, so it asks on Landed. No email chain, no re-upload.');
click(39, 'req-send', ({ dispatch }) => {
  if (!domClick('req-send')) dispatch({ type: 'REQUEST_DOCS', provider: 'lettings', kinds: ['address'] });
});
click(41.6, 'view-newcomer', ({ dispatch }) => dispatch({ type: 'SET_VIEW', view: 'newcomer' }));
caption(41.7, 'Grace sees the request in her view and answers it in one tap.');
click(44.2, 'fulfil-address', ({ dispatch, state }) => {
  const r = state().requests.find((x) => x.provider === 'lettings' && x.status === 'open');
  if (r) dispatch({ type: 'FULFIL_REQUEST', id: r.id });
});
click(46.8, 'view-institution', ({ dispatch }) => dispatch({ type: 'SET_VIEW', view: 'institution' }));
caption(46.9, 'The document lands in the same pack. The provider moves Grace to a full application.');
click(49.8, 'inst-proceed', ({ dispatch }) => dispatch({ type: 'PROVIDER_ACTION', provider: 'lettings', action: 'proceed' }));
click(53, 'inst-motor', ({ dispatch }) => dispatch({ type: 'SET_INST_PROVIDER', provider: 'motor' }));
caption(53.1, 'Each provider sees only what it asked for, checked against its own criteria.');
click(57.5, 'inst-cu', ({ dispatch }) => dispatch({ type: 'SET_INST_PROVIDER', provider: 'cu' }));
click(62, 'inst-lettings', ({ dispatch }) => dispatch({ type: 'SET_INST_PROVIDER', provider: 'lettings' }));
caption(62.1, 'One upload, shared with three providers. Grace stays in control of who sees what, and for how long.');
hover(64, 'counter-with', () => undefined);
at(72, ({ dispatch }) => dispatch({ type: 'SET_CURSOR', target: null }));
beats.sort((a, b) => a.t - b.t);

export function PresenterEngine() {
  const { state, dispatch } = useStore();
  const { active, paused, runId } = state.presenter;
  const stateRef = useRef(state);
  stateRef.current = state;
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  // Timeline
  useEffect(() => {
    if (!active) return;
    let t = 0;
    let next = 0;
    let last = performance.now();
    tick(0);
    window.scrollTo({ top: 0 });
    // Drop focus from the toggle so its focus ring is not in the recording.
    (document.activeElement as HTMLElement | null)?.blur();
    const ctx: Ctx = { dispatch, state: () => stateRef.current };
    const id = window.setInterval(() => {
      const nowMs = performance.now();
      const dt = nowMs - last;
      last = nowMs;
      if (pausedRef.current) return;
      t += dt;
      while (next < beats.length && beats[next].t <= t) {
        beats[next].run(ctx);
        next++;
      }
      tick(t);
      if (t >= TOTAL_MS) {
        window.clearInterval(id);
        dispatch({ type: 'PRESENTER_STOP', keepCaption: true });
      }
    }, 50);
    return () => window.clearInterval(id);
  }, [active, runId, dispatch]);

  // Keyboard: Space pauses, Esc exits (drawers take Esc first)
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        dispatch({ type: 'PRESENTER_TOGGLE_PAUSE' });
      } else if (e.key === 'Escape' && !stateRef.current.drawer) {
        dispatch({ type: 'PRESENTER_STOP' });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, dispatch]);

  // Presenter transitions run even if the OS asks for reduced motion.
  useEffect(() => {
    document.documentElement.classList.toggle('presenter', active);
  }, [active]);

  return null;
}

const tick = (t: number) => window.dispatchEvent(new CustomEvent<number>('landed-tick', { detail: t }));

/** Compact timer shown in the top bar while Presenter mode runs. */
export function PresenterHud() {
  const { state } = useStore();
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const on = (e: Event) => setElapsed((e as CustomEvent<number>).detail);
    window.addEventListener('landed-tick', on);
    return () => window.removeEventListener('landed-tick', on);
  }, []);
  if (!state.presenter.active) return null;
  const paused = state.presenter.paused;
  const secs = Math.floor(elapsed / 1000);
  return (
    <div className="w-[190px] rounded-lg bg-ink px-2.5 py-1 text-ivory" role="status">
      <div className="flex items-center justify-between text-[12px] font-semibold">
        <span>{paused ? 'Paused · Space resumes' : 'Space pauses · Esc exits'}</span>
        <span className="tabular-nums text-ivory/80">
          {Math.floor(secs / 60)}:{String(secs % 60).padStart(2, '0')}
        </span>
      </div>
      <div className="mt-1 h-1 overflow-hidden rounded-full bg-ivory/20">
        <div className="h-full bg-accent" style={{ width: `${Math.min(100, (elapsed / TOTAL_MS) * 100)}%` }} />
      </div>
    </div>
  );
}

export function PresenterCursor() {
  const { state } = useStore();
  const target = state.presenter.active ? state.cursor : null;
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [ripple, setRipple] = useState(0);

  useEffect(() => {
    if (!target) return;
    const update = () => {
      const el = document.querySelector<HTMLElement>(`[data-demo="${target}"]`);
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (r.top < 0 || r.bottom > window.innerHeight) el.scrollIntoView({ block: 'center', behavior: 'smooth' });
      setPos({ x: r.left + Math.min(r.width / 2, 60), y: r.top + r.height / 2 });
    };
    update();
    const id = window.setInterval(update, 150);
    return () => window.clearInterval(id);
  }, [target]);

  useEffect(() => {
    const onPress = () => setRipple((n) => n + 1);
    window.addEventListener('landed-press', onPress);
    return () => window.removeEventListener('landed-press', onPress);
  }, []);

  if (!state.presenter.active || !pos) return null;
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed z-50 transition-[left,top] duration-[650ms] ease-[cubic-bezier(.4,0,.2,1)]"
      style={{ left: pos.x, top: pos.y, opacity: target ? 1 : 0 }}
    >
      {ripple > 0 && <span key={ripple} className="press-ripple absolute -left-5 -top-5 h-10 w-10 rounded-full border-[3px] border-accent" />}
      <svg width="26" height="30" viewBox="0 0 26 30" className="drop-shadow-[0_2px_4px_rgba(11,27,43,0.35)]">
        <path d="M2 2l20 11.5-9 2.2-4.6 9.3z" fill="#0B1B2B" stroke="#FAF7F0" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
