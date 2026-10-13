import type { ReactNode } from 'react';
import { GRACE, OFFER, PAYSLIP, STATEMENT, type DocId } from '../data/mock';

export const DOC_W = 360;
export const DOC_H = 470;

const n = (v: number) => v.toLocaleString('en-GB', { minimumFractionDigits: 2 });

function Region({ id, active, children, className = '' }: { id: string; active: string | null; children: ReactNode; className?: string }) {
  const on = active === id;
  return (
    <div
      data-region={id}
      className={`relative rounded-[3px] transition-all duration-300 ${on ? 'bg-accent/15 ring-2 ring-accent ring-offset-1 ring-offset-white' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

function Paper({ children, tint = '#FFFFFF' }: { children: ReactNode; tint?: string }) {
  return (
    <div
      className="relative overflow-hidden rounded-sm border border-[#E6E1D6] text-[11px] leading-[1.45] text-[#1d2a36] shadow-paper"
      style={{ width: DOC_W, height: DOC_H, background: tint }}
    >
      {children}
      <div className="pointer-events-none absolute bottom-2 right-3 font-mono text-[9px] uppercase tracking-wider text-[#9aa3ab]">Synthetic sample</div>
    </div>
  );
}

function OfferLetter({ active }: { active: string | null }) {
  return (
    <Paper>
      <div className="flex items-center justify-between border-b-4 border-[#24507a] px-6 pb-3 pt-5">
        <Region id="employer" active={active}>
          <div className="font-display text-[15px] font-semibold text-[#24507a]">{OFFER.employer}</div>
          <div className="text-[10px] text-[#5b6875]">{OFFER.address}</div>
        </Region>
        <div className="grid h-9 w-9 place-items-center rounded-full bg-[#24507a] font-display text-[13px] font-bold text-white">N</div>
      </div>
      <div className="space-y-2.5 px-6 pt-4">
        <div className="flex justify-between text-[10px] text-[#5b6875]">
          <span>Ref: {OFFER.ref}</span>
          <span>{OFFER.date}</span>
        </div>
        <div>
          <div className="font-semibold">{GRACE.name}</div>
          <div className="text-[#5b6875]">c/o International Recruitment Team</div>
        </div>
        <div className="font-semibold">Offer of employment: {OFFER.role}</div>
        <p>Dear Grace,</p>
        <p>We are pleased to offer you a permanent position as {OFFER.role} in our Acute Medicine department.</p>
        <Region id="salary" active={active} className="px-1 py-0.5">
          <p>
            Your starting salary will be <strong>£{OFFER.salary.toLocaleString('en-GB')} per annum</strong> gross, paid monthly in arrears.
          </p>
        </Region>
        <Region id="start" active={active} className="px-1 py-0.5">
          <p>
            Start date: <strong>{OFFER.start}</strong>. Hours: {OFFER.hours}.
          </p>
        </Region>
        <p>This offer is subject to your registration and right to work checks, which you have completed.</p>
        <p className="pt-1">Yours sincerely,</p>
        <div className="font-display text-[16px] italic text-[#24507a]">A. Okafor</div>
        <div className="text-[10px] text-[#5b6875]">Head of Nursing Workforce</div>
      </div>
    </Paper>
  );
}

function Payslip({ active }: { active: string | null }) {
  const row = (k: string, v: string, strong = false) => (
    <div className={`flex justify-between border-b border-dashed border-[#d8d2c4] py-1 ${strong ? 'font-semibold' : ''}`}>
      <span>{k}</span>
      <span className="font-mono">{v}</span>
    </div>
  );
  return (
    <Paper tint="#FFFDF7">
      <div className="bg-[#2f6b4f] px-5 py-3 text-white">
        <div className="font-display text-[14px] font-semibold">{PAYSLIP.employer}</div>
        <div className="text-[10px] opacity-90">{PAYSLIP.city}</div>
      </div>
      <div className="px-5 pt-3">
        <div className="text-center font-display text-[14px] font-semibold tracking-wide">PAHAYAG NG SAHOD</div>
        <div className="mb-2 text-center text-[10px] text-[#5b6875]">Payslip</div>
        <div className="mb-3 grid grid-cols-2 gap-x-3 gap-y-1 rounded border border-[#e2dccd] p-2 text-[10.5px]">
          <span className="text-[#5b6875]">Pangalan</span>
          <span>{GRACE.name.toUpperCase()}</span>
          <span className="text-[#5b6875]">Blg. ng Empleyado</span>
          <span>{PAYSLIP.employeeNo}</span>
          <span className="text-[#5b6875]">Panahon</span>
          <span>{PAYSLIP.period}</span>
          <span className="text-[#5b6875]">Posisyon</span>
          <span>Staff Nurse</span>
        </div>
        <Region id="basic" active={active} className="px-1">
          <div className="flex justify-between border-b border-dashed border-[#d8d2c4] py-1">
            <span>Batayang Sahod (Basic)</span>
            <span className="font-mono opacity-60 blur-[0.3px]">₱ {n(PAYSLIP.basic)}</span>
          </div>
        </Region>
        {row('Allowance', '₱ ' + n(PAYSLIP.allowance))}
        {row('Kaltas (SSS, PhilHealth, Pag-IBIG, Tax)', '-₱ ' + n(PAYSLIP.deductions))}
        <Region id="currency" active={active} className="px-1">
          {row('Netong Sahod (Net pay)', '₱ ' + n(PAYSLIP.net), true)}
          <div className="pt-1 text-right text-[9.5px] text-[#5b6875]">Lahat ng halaga ay nasa Piso (PHP)</div>
        </Region>
        <div className="mt-4 rounded bg-[#f1ece0] p-2 text-[10px] text-[#5b6875]">
          Ipinadala sa account: Pacific Demo Savings Bank ••4821 noong 30 Agosto 2026
        </div>
        <div className="mt-5 flex justify-between text-[10px] text-[#5b6875]">
          <span>Inihanda ni: Payroll Office</span>
          <span className="rotate-[-6deg] rounded border-2 border-[#2f6b4f]/60 px-1.5 font-semibold text-[#2f6b4f]/80">BAYAD</span>
        </div>
      </div>
    </Paper>
  );
}

function Statement({ active }: { active: string | null }) {
  return (
    <Paper>
      <div className="flex items-end justify-between border-b border-[#d8d2c4] px-5 pb-2 pt-4">
        <div>
          <div className="font-display text-[14px] font-semibold text-[#7a2e2e]">{STATEMENT.bank}</div>
          <div className="text-[10px] text-[#5b6875]">Makati, Philippines</div>
        </div>
        <div className="text-right text-[10px] font-semibold uppercase tracking-wide text-[#7a2e2e]">Pahayag ng Account</div>
      </div>
      <div className="space-y-2 px-5 pt-3">
        <div className="grid grid-cols-2 gap-y-1 text-[10.5px]">
          <span className="text-[#5b6875]">May-ari ng Account</span>
          <span>{GRACE.name.toUpperCase()}</span>
          <span className="text-[#5b6875]">Numero ng Account</span>
          <span className="font-mono">{STATEMENT.account}</span>
        </div>
        <Region id="period" active={active} className="px-1">
          <div className="grid grid-cols-2 text-[10.5px]">
            <span className="text-[#5b6875]">Panahon ng Pahayag</span>
            <span>{STATEMENT.period}</span>
          </div>
        </Region>
        <table className="mt-1 w-full text-[10px]">
          <thead>
            <tr className="border-b border-[#d8d2c4] text-left text-[#5b6875]">
              <th className="py-1 font-medium">Petsa</th>
              <th className="font-medium">Paglalarawan</th>
              <th className="text-right font-medium">Halaga (₱)</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            <tr className="border-b border-dashed border-[#e6e0d2]"><td className="py-1">01/08</td><td className="font-sans">Panimulang balanse</td><td className="text-right">{n(STATEMENT.opening)}</td></tr>
            <tr className="border-b border-dashed border-[#e6e0d2]"><td className="py-1">05/08</td><td className="font-sans">Padala sa pamilya</td><td className="text-right">-4,000.00</td></tr>
            <tr className="border-b border-dashed border-[#e6e0d2]"><td className="py-1">17/08</td><td className="font-sans">Bayad sa kuryente</td><td className="text-right">-2,950.00</td></tr>
            <tr className="border-b border-dashed border-[#e6e0d2]"><td className="py-1">30/08</td><td className="font-sans">SAHOD BAYVIEW DEMO MC</td><td className="text-right">{n(STATEMENT.credit)}</td></tr>
          </tbody>
        </table>
        <Region id="closing" active={active} className="px-1 py-1">
          <div className="flex items-center justify-between rounded bg-[#f6efe6] px-2 py-1.5">
            <span className="font-semibold">Natitirang Balanse</span>
            <span className="font-mono text-[12px] font-semibold">₱ {n(STATEMENT.closing)}</span>
          </div>
        </Region>
        <div className="pt-2 text-[9.5px] text-[#5b6875]">
          Ang pahayag na ito ay awtomatikong ginawa. Para sa mga katanungan, tumawag sa aming hotline.
        </div>
      </div>
    </Paper>
  );
}

export function Doc({ id, active = null }: { id: DocId; active?: string | null }) {
  if (id === 'offer') return <OfferLetter active={active} />;
  if (id === 'payslip') return <Payslip active={active} />;
  return <Statement active={active} />;
}

/** Renders a document at a fixed scale while reserving the right layout box. */
export function ScaledDoc({ id, scale, active = null }: { id: DocId; scale: number; active?: string | null }) {
  return (
    <div style={{ width: DOC_W * scale, height: DOC_H * scale }} className="relative shrink-0">
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }} className="absolute left-0 top-0">
        <Doc id={id} active={active} />
      </div>
    </div>
  );
}
