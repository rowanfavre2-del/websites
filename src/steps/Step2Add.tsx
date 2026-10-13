import { useRef, useState } from 'react';
import { DOCS } from '../data/mock';
import { allDocsAdded, useStore } from '../store';
import { ScaledDoc } from '../components/Documents';
import { Button, Check } from '../components/ui';

export function Step2Add() {
  const { state, dispatch } = useStore();
  const [dragOver, setDragOver] = useState(false);
  const [fileMsg, setFileMsg] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const count = Object.values(state.docs).filter(Boolean).length;
  const ready = allDocsAdded(state);

  const takeFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const name = files[0].name;
    // The demo never reads the file. It always shows the same sample result.
    setFileMsg(`Received "${name}". In this demo, any file is read as Grace's sample documents. Nothing is uploaded or stored.`);
    dispatch({ type: 'ADD_ALL_DOCS', fileName: name });
  };

  return (
    <div className="flex flex-1 flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {DOCS.map((d) => {
          const added = state.docs[d.id];
          return (
            <button
              key={d.id}
              type="button"
              data-demo={`add-${d.id}`}
              aria-pressed={added}
              onClick={() => dispatch({ type: 'ADD_DOC', doc: d.id })}
              className={`group relative flex flex-col items-center gap-2 rounded-xl border-2 p-3 text-left transition-all ${
                added ? 'border-verified bg-verified-tint/50' : 'border-dashed border-ink/20 bg-white hover:border-accent'
              }`}
            >
              <div className={`overflow-hidden transition-transform ${added ? '' : 'group-hover:-translate-y-0.5'}`}>
                <ScaledDoc id={d.id} scale={0.5} />
              </div>
              <div className="flex w-full items-center justify-between gap-2">
                <div>
                  <div className="text-[15px] font-semibold leading-tight">{d.title}</div>
                  <div className="text-[12.5px] text-ink-muted">
                    {d.lang} · {d.currency}
                  </div>
                </div>
                {added ? (
                  <span className="flex items-center gap-1 rounded-full bg-verified px-2.5 py-1 text-[13px] font-semibold text-white">
                    <Check className="h-3.5 w-3.5" /> Added
                  </span>
                ) : (
                  <span className="rounded-full bg-accent px-3 py-1 text-[13px] font-semibold text-ink">+ Add</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-stretch gap-3">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            takeFiles(e.dataTransfer.files);
          }}
          className={`flex min-w-[260px] flex-1 items-center gap-3 rounded-xl border-2 border-dashed px-4 py-2.5 text-[14px] ${dragOver ? 'border-accent bg-accent-tint/40' : 'border-ink/20 bg-white/70'}`}
        >
          <input ref={input} type="file" tabIndex={-1} aria-hidden="true" className="hidden" onChange={(e) => takeFiles(e.target.files)} />
          <span className="text-ink-soft" aria-live="polite">
            {fileMsg ?? 'Or drop any file here. The demo shows the same sample result.'}
          </span>
          <button
            type="button"
            onClick={() => input.current?.click()}
            className="ml-auto whitespace-nowrap rounded-full border border-ink/25 bg-white px-3 py-1 font-semibold hover:border-ink/60"
          >
            Choose file
          </button>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[14px] font-medium text-ink-soft tabular-nums">{count} of 3 added</span>
          <Button demo="read-docs" disabled={!ready} onClick={() => dispatch({ type: 'START_READING' })}>
            Read my documents →
          </Button>
        </div>
      </div>
    </div>
  );
}
