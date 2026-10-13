import { CAPTIONS } from '../data/mock';
import { useStore } from '../store';
import { Step1Refusal } from '../steps/Step1Refusal';
import { Step2Add } from '../steps/Step2Add';
import { Step3Reading } from '../steps/Step3Reading';
import { Step4Summary } from '../steps/Step4Summary';
import { Step5Share } from '../steps/Step5Share';
import { Step6Institution } from '../steps/Step6Institution';
import { CounterStrip, Stepper } from './Shell';

function NoticeBanner() {
  const { state, dispatch } = useStore();
  if (state.view !== 'newcomer' || !state.notice) return null;
  const onShare = state.step === 5;
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-accent/50 bg-accent-tint/60 px-3 py-1.5 text-[14px]" role="status">
      <span className="font-bold text-accent-dark">New on Landed</span>
      <span className="text-ink">{state.notice}</span>
      <div className="ml-auto flex gap-1">
        {!onShare && state.maxStep >= 5 && (
          <button type="button" className="rounded-full bg-ink px-3 py-0.5 text-[13px] font-semibold text-ivory" onClick={() => dispatch({ type: 'GO_STEP', step: 5 })}>
            Open
          </button>
        )}
        <button type="button" className="rounded-full px-2 py-0.5 text-[13px] font-semibold text-ink-soft hover:bg-ink/5" onClick={() => dispatch({ type: 'DISMISS_NOTICE' })}>
          Dismiss
        </button>
      </div>
    </div>
  );
}

export function Stage() {
  const { state, dispatch } = useStore();
  const current = state.view === 'institution' ? 6 : state.step;
  const caption = state.caption ?? CAPTIONS[current];

  return (
    <main className="flex min-h-0 min-w-0 flex-1 flex-col gap-2" aria-label="Demo">
      <Stepper />
      <CounterStrip />
      <div className="flex items-start gap-3 rounded-lg bg-ink px-4 py-2 text-ivory">
        <span className="mt-0.5 shrink-0 rounded bg-accent px-1.5 py-0.5 text-[12px] font-bold uppercase tracking-wide text-ink">
          {state.view === 'institution' ? 'Provider' : `Step ${current}`}
        </span>
        <p key={caption} className="caption-in text-[16.5px] font-medium leading-snug" aria-live="polite">
          {caption}
        </p>
        {!state.presenter.active && (
          <button
            type="button"
            onClick={() => dispatch({ type: 'RESET' })}
            className="ml-auto shrink-0 rounded-full border border-ivory/30 px-3 py-0.5 text-[12.5px] font-semibold text-ivory/90 hover:border-ivory"
          >
            Restart
          </button>
        )}
      </div>
      <NoticeBanner />
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden pb-1" key={`${state.view}-${current}`}>
        <div className="step-in flex min-h-full flex-col">
          {state.view === 'institution' ? (
            <Step6Institution />
          ) : state.step === 1 ? (
            <Step1Refusal />
          ) : state.step === 2 ? (
            <Step2Add />
          ) : state.step === 3 ? (
            <Step3Reading />
          ) : state.step === 4 ? (
            <Step4Summary />
          ) : (
            <Step5Share />
          )}
        </div>
      </div>
    </main>
  );
}
