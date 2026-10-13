import { useStore } from '../store';
import { Button } from '../components/ui';

function Message({ from, subject, body, tag }: { from: string; subject: string; body: string; tag: string }) {
  return (
    <article className="rounded-xl border border-rule bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div aria-hidden="true" className="grid h-9 w-9 place-items-center rounded-lg bg-ink/[0.07] font-display text-[15px] font-bold text-ink-soft">
            {from.replace('Demo ', '')[0]}
          </div>
          <div>
            <div className="text-[15px] font-semibold">{from}</div>
            <div className="text-[12.5px] text-ink-muted">To: Grace Santos · fictional provider</div>
          </div>
        </div>
        <span className="rounded-full bg-[#FBE3DE] px-2.5 py-0.5 text-[12.5px] font-semibold text-[#9B2C1C]">{tag}</span>
      </div>
      <h3 className="mt-4 font-display text-[22px] font-semibold leading-snug">{subject}</h3>
      <p className="mt-2 text-[15.5px] leading-relaxed text-ink-soft">{body}</p>
    </article>
  );
}

export function Step1Refusal() {
  const { dispatch } = useStore();
  return (
    <div className="flex flex-1 flex-col gap-3">
      <div className="grid gap-4 md:grid-cols-2">
        <Message
          from="Demo Motor Finance"
          tag="Declined"
          subject="We were unable to verify your income."
          body="The documents you provided are not in a format we can assess. We are unable to proceed with your car finance application at this time."
        />
        <Message
          from="Demo Lettings Co."
          tag="Guarantor required"
          subject="Demo Lettings Co. asks for a UK guarantor."
          body="As you have no UK payslips or UK credit history, we require a UK-based guarantor before we can offer the tenancy."
        />
      </div>
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-dashed border-ink/25 bg-white/60 p-4">
        <p className="max-w-[46ch] text-[15.5px] text-ink">
          Grace has a signed UK nursing job offer worth <strong>£34,800 a year</strong> and savings at home. The problem is not her money. It is that no provider can assess her proof.
        </p>
        <Button className="ml-auto text-[16px]" demo="try-landed" onClick={() => dispatch({ type: 'GO_STEP', step: 2, unlock: true })}>
          Try Landed →
        </Button>
      </div>
    </div>
  );
}
