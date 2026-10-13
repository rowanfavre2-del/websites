import type { ButtonHTMLAttributes, ReactNode } from 'react';

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'dark' | 'ghost' | 'outline'; demo?: string };

export function Button({ variant = 'primary', demo, className = '', children, ...rest }: BtnProps) {
  const base =
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full px-5 py-2.5 text-[15px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-45';
  const v = {
    primary: 'bg-accent text-ink hover:bg-[#e85d2b]',
    dark: 'bg-ink text-ivory hover:bg-[#1a3046]',
    ghost: 'text-ink hover:bg-ink/5',
    outline: 'border border-ink/25 bg-white text-ink hover:border-ink/60',
  }[variant];
  return (
    <button type="button" data-demo={demo} className={`${base} ${v} ${className}`} {...rest}>
      {children}
    </button>
  );
}

export function Chip({ tone, children, className = '' }: { tone: 'green' | 'amber' | 'grey' | 'orange' | 'ink'; children: ReactNode; className?: string }) {
  const t = {
    green: 'bg-verified-tint text-verified',
    amber: 'bg-amber-tint text-amber-text',
    grey: 'bg-ink/[0.06] text-ink-soft',
    orange: 'bg-accent-tint text-accent-dark',
    ink: 'bg-ink text-ivory',
  }[tone];
  return <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[12.5px] font-semibold ${t} ${className}`}>{children}</span>;
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-xl border border-rule bg-white shadow-soft ${className}`}>{children}</section>;
}

export function Eyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`text-[12px] font-bold uppercase tracking-[0.14em] text-accent-dark ${className}`}>{children}</div>;
}

export function Toggle({
  checked,
  onChange,
  label,
  demo,
  srLabel,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  demo?: string;
  srLabel?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={srLabel}
      data-demo={demo}
      onClick={() => onChange(!checked)}
      className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full text-[14px] font-medium"
    >
      <span className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? 'bg-verified' : 'bg-ink/25'}`}>
        <span className={`absolute left-0 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
      </span>
      {label && <span>{label}</span>}
    </button>
  );
}

export const Check = ({ className = 'h-4 w-4' }: { className?: string }) => (
  <svg viewBox="0 0 20 20" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 10.5l3.5 3.5 7.5-8" />
  </svg>
);

export const DocIcon = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg viewBox="0 0 20 24" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M3 1.5h9l5 5v16H3z" fill="currentColor" fillOpacity="0.08" />
    <path d="M12 1.5v5h5M6 11h8M6 14.5h8M6 18h5" />
  </svg>
);
