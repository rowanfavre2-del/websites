import { useEffect, useRef, useState } from 'react';
import { DOCS, READING_STAGES } from '../data/mock';
import { useStore } from '../store';
import { ScaledDoc } from '../components/Documents';
import { Check } from '../components/ui';

const STAGE_MS = 900; // 4 stages = 3.6 seconds
const TICK = 50;

export function Step3Reading() {
  const { state, dispatch } = useStore();
  const [elapsed, setElapsed] = useState(0);
  const paused = state.presenter.active && state.presenter.paused;
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const total = STAGE_MS * READING_STAGES.length;

  useEffect(() => {
    const id = setInterval(() => {
      if (!pausedRef.current) setElapsed((e) => Math.min(total + 400, e + TICK));
    }, TICK);
    return () => clearInterval(id);
  }, [total]);

  useEffect(() => {
    if (elapsed >= total + 400) dispatch({ type: 'FINISH_READING' });
  }, [elapsed, total, dispatch]);

  const stageIdx = Math.min(READING_STAGES.length, Math.floor(elapsed / STAGE_MS));
  const pct = Math.min(100, (elapsed / total) * 100);

  return (
    <div className="grid flex-1 gap-5 md:grid-cols-[1fr_1.1fr]">
      <div className="relative flex items-center justify-center rounded-xl border border-rule bg-ivory-deep/60 p-4">
        <div className="relative h-[290px] w-[300px]">
          {DOCS.map((d, i) => (
            <div
              key={d.id}
              className="absolute transition-transform duration-700"
              style={{ left: i * 52, top: i * 22, transform: `rotate(${(i - 1) * 3}deg)`, zIndex: i === stageIdx % 3 ? 5 : i }}
            >
              <ScaledDoc id={d.id} scale={0.5} />
            </div>
          ))}
          <div
            aria-hidden="true"
            className="scan-line absolute left-[-12px] right-[-40px] z-10 h-[3px] rounded-full bg-accent shadow-[0_0_18px_4px_rgba(242,107,58,0.45)]"
            style={{ top: `${(elapsed % STAGE_MS) / STAGE_MS * 100}%` }}
          />
        </div>
      </div>
      <div className="flex flex-col justify-center">
        <div className="mb-4 h-2 overflow-hidden rounded-full bg-ink/10" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label="Reading progress">
          <div className="h-full rounded-full bg-accent transition-[width] duration-100" style={{ width: `${pct}%` }} />
        </div>
        <ol className="space-y-2.5" aria-live="polite">
          {READING_STAGES.map((st, i) => {
            const done = i < stageIdx;
            const active = i === stageIdx;
            return (
              <li
                key={st.id}
                className={`flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors duration-300 ${
                  done ? 'border-verified/30 bg-verified-tint/50' : active ? 'border-accent bg-white shadow-soft' : 'border-rule bg-white/60'
                }`}
              >
                <span
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${done ? 'bg-verified text-white' : active ? 'bg-accent-tint text-accent-dark' : 'bg-ink/[0.06] text-ink-muted'}`}
                >
                  {done ? <Check /> : active ? <span className="spinner h-3.5 w-3.5 rounded-full border-2 border-accent-dark border-t-transparent" /> : <span className="text-[13px] font-bold">{i + 1}</span>}
                </span>
                <span className={`text-[17px] font-semibold ${done || active ? 'text-ink' : 'text-ink-muted'}`}>{st.label}</span>
                <span className={`ml-auto text-[14.5px] transition-opacity duration-300 ${done ? 'text-verified opacity-100' : 'opacity-0'}`}>{st.result}</span>
              </li>
            );
          })}
        </ol>
        <p className="mt-4 text-[13.5px] text-ink-muted">Simulated in this demo. No document leaves your browser.</p>
      </div>
    </div>
  );
}
