// All data in this file is synthetic and deterministic. Nothing is fetched or stored.

export const PRODUCT_NAME = 'Landed';
export const TAGLINE = 'Prove your income once. Be understood everywhere.';

/** Fixed illustrative exchange rate. Not a live rate. */
export const PHP_PER_GBP = 74;
export const SAMPLE_RENT_GBP = 1050;
export const RENT_MULTIPLE = 2.5;
/** Illustrative: how many providers a newcomer might apply to in their first months. */
export const PROVIDERS_WITHOUT_LANDED = 8;
/** "Today" in the demo. */
export const DEMO_TODAY = new Date(2026, 9, 13);

export const toGbp = (php: number) => php / PHP_PER_GBP;
export const gbp = (n: number) =>
  '£' + Math.round(n).toLocaleString('en-GB');
export const php = (n: number) => 'PHP ' + Math.round(n).toLocaleString('en-GB');

export const addDays = (d: Date, days: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
};
export const fmtDate = (d: Date) =>
  d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export const GRACE = {
  name: 'Grace Santos',
  age: 31,
  role: 'NHS nurse',
  origin: 'the Philippines',
  arrived: '3 weeks ago',
  visa: 'Work visa',
  needs: 'A flat and a car for shift work',
  quote: "I have a job and I have savings. I just can't prove it in a way they can read.",
};

export type DocId = 'offer' | 'payslip' | 'statement';

export const DOCS: { id: DocId; title: string; short: string; lang: string; currency: string }[] = [
  { id: 'offer', title: 'UK job offer letter', short: 'Job offer', lang: 'English', currency: 'GBP' },
  { id: 'payslip', title: 'Overseas payslip', short: 'Payslip', lang: 'Filipino and English', currency: 'PHP' },
  { id: 'statement', title: 'Overseas bank statement', short: 'Bank statement', lang: 'Filipino and English', currency: 'PHP' },
];

// Synthetic document contents
export const OFFER = {
  employer: 'Northgate Demo Hospital Trust',
  address: '14 Harbour Road, London E14 0XX',
  date: '18 September 2026',
  role: 'Staff Nurse, Band 5',
  salary: 34800,
  start: '3 November 2026',
  hours: '37.5 hours a week, rotating shifts',
  ref: 'NDH/HR/26/0419',
};
export const PAYSLIP = {
  employer: 'Bayview Demo Medical Centre',
  city: 'Quezon City, Philippines',
  period: 'Agosto 2026',
  basic: 48000,
  allowance: 3500,
  deductions: 6950,
  net: 44550,
  employeeNo: 'BMC-20714',
};
export const STATEMENT = {
  bank: 'Pacific Demo Savings Bank',
  account: '•••• •••• 4821',
  period: '1 to 31 August 2026',
  opening: 362400,
  credit: 44550,
  debits: 6950,
  closing: 400000,
};

export type FieldId =
  | 'employer'
  | 'salary'
  | 'monthly'
  | 'start'
  | 'prevPay'
  | 'savings'
  | 'currency'
  | 'dates';

export interface Field {
  id: FieldId;
  label: string;
  value: string;
  sub?: string;
  doc: DocId;
  /** region id inside the source document to highlight */
  region: string;
  confidence: number;
  low?: boolean;
  lowReason?: string;
}

const annualRent = SAMPLE_RENT_GBP * 12;
export const RENT_RATIO = OFFER.salary / annualRent; // about 2.76

export const FIELDS: Field[] = [
  { id: 'employer', label: 'UK employer', value: OFFER.employer, sub: OFFER.role, doc: 'offer', region: 'employer', confidence: 98 },
  { id: 'salary', label: 'Annual gross salary', value: gbp(OFFER.salary), sub: 'From UK job offer', doc: 'offer', region: 'salary', confidence: 97 },
  { id: 'monthly', label: 'Monthly gross pay', value: gbp(OFFER.salary / 12), sub: 'Annual salary ÷ 12', doc: 'offer', region: 'salary', confidence: 96 },
  { id: 'start', label: 'Start date', value: OFFER.start, sub: 'Permanent contract', doc: 'offer', region: 'start', confidence: 95 },
  {
    id: 'prevPay',
    label: 'Previous monthly pay',
    value: php(PAYSLIP.basic),
    sub: `About ${gbp(toGbp(PAYSLIP.basic))} at illustrative rate`,
    doc: 'payslip',
    region: 'basic',
    confidence: 71,
    low: true,
    lowReason: 'Faint print. Check the amount.',
  },
  {
    id: 'savings',
    label: 'Savings',
    value: php(STATEMENT.closing),
    sub: `About ${gbp(Math.round(toGbp(STATEMENT.closing) / 100) * 100)} at illustrative rate`,
    doc: 'statement',
    region: 'closing',
    confidence: 68,
    low: true,
    lowReason: 'Is this the closing balance?',
  },
  { id: 'currency', label: 'Currencies', value: 'GBP and PHP', sub: `Converted at 1 GBP = ${PHP_PER_GBP} PHP (illustrative rate)`, doc: 'payslip', region: 'currency', confidence: 99 },
  { id: 'dates', label: 'Document dates', value: 'Aug to Sep 2026', sub: 'All within the last 3 months', doc: 'statement', region: 'period', confidence: 97 },
];

export const READING_STAGES = [
  { id: 'lang', label: 'Detecting language', result: 'English, Filipino' },
  { id: 'cur', label: 'Detecting currency', result: 'GBP, PHP' },
  { id: 'fields', label: 'Extracting fields', result: '8 fields found' },
  { id: 'consistency', label: 'Checking consistency', result: 'Name, dates and amounts agree' },
];

export const CHECKS = [
  {
    id: 'rent',
    label: 'Income vs sample rent',
    detail: `${gbp(OFFER.salary)} a year vs sample rent ${gbp(SAMPLE_RENT_GBP)} a month: ${RENT_RATIO.toFixed(2)}x, above the common ${RENT_MULTIPLE}x test`,
    pass: true,
  },
  {
    id: 'consistent',
    label: 'Documents consistent',
    detail: 'Same name on all three. Net pay appears on the bank statement.',
    pass: true,
  },
];

export type PackageId = 'starter' | 'verified' | 'full';
export const PACKAGES: { id: PackageId; name: string; desc: string; shareDays: number }[] = [
  { id: 'starter', name: 'Starter', desc: 'Free automated reading', shareDays: 30 },
  { id: 'verified', name: 'Verified', desc: 'Adds partner translator review', shareDays: 30 },
  { id: 'full', name: 'Full pack', desc: 'Adds employer confirmation and 90-day sharing', shareDays: 90 },
];

export type ProviderId = 'lettings' | 'motor' | 'cu';

export interface Criterion {
  label: string;
  result: string;
  state: 'pass' | 'check' | 'outside';
}

export type Scope = 'Income' | 'Employment' | 'Savings' | 'Originals';

export const PROVIDERS: { id: ProviderId; name: string; kind: string; wants: string; scope: Scope[]; criteria: Criterion[] }[] = [
  {
    id: 'lettings',
    name: 'Demo Lettings Co.',
    kind: 'Letting agent',
    wants: 'Flat in Stratford, £1,050 a month',
    scope: ['Income', 'Employment', 'Originals'],
    criteria: [
      { label: `Income at least ${RENT_MULTIPLE}x annual rent`, result: `Pass: ${RENT_RATIO.toFixed(2)}x`, state: 'pass' },
      { label: 'Documents consistent', result: 'Pass', state: 'pass' },
      { label: 'Employment confirmed by employer', result: 'Not yet: offer letter read only', state: 'check' },
    ],
  },
  {
    id: 'motor',
    name: 'Demo Motor Finance',
    kind: 'Car finance',
    wants: 'Used car, £9,000 over 4 years',
    scope: ['Income', 'Employment', 'Originals'],
    criteria: [
      { label: 'Monthly gross income at least £1,800', result: `Pass: ${gbp(OFFER.salary / 12)}`, state: 'pass' },
      { label: 'Employment starts within 3 months', result: `Pass: ${OFFER.start}`, state: 'pass' },
      { label: 'UK credit history', result: 'Outside this pack: assess separately', state: 'outside' },
    ],
  },
  {
    id: 'cu',
    name: 'Demo Credit Union',
    kind: 'Credit union',
    wants: 'Current account and small loan',
    scope: ['Income', 'Savings', 'Originals'],
    criteria: [
      { label: 'Works within membership area', result: 'Pass: London E14', state: 'pass' },
      { label: 'Savings evidence', result: `Pass: ${php(STATEMENT.closing)}, about £5,400`, state: 'pass' },
      { label: 'Savings confirmed by user', result: 'Confirmed by Grace', state: 'pass' },
    ],
  },
];

export const STEPS = [
  { n: 1, label: 'The refusal' },
  { n: 2, label: 'Add documents' },
  { n: 3, label: 'Reading' },
  { n: 4, label: 'Summary' },
  { n: 5, label: 'Consent and share' },
  { n: 6, label: 'Institution view' },
] as const;

export const CAPTIONS: Record<number, string> = {
  1: 'Grace can afford a flat and a car. Two providers said no: her proof of income is from overseas.',
  2: 'Grace adds her documents once: a UK job offer, plus a payslip and bank statement from home.',
  3: 'Landed reads them: language, currency, key figures, and whether they agree.',
  4: 'A UK-readable summary beside the originals. Grace confirms the two figures Landed flagged.',
  5: 'Providers ask for access. Grace approves each one, for a set time, and can revoke it.',
  6: 'The provider gets one consistent pack with an honest status, and asks for more on Landed.',
};

// ---------- Drawers ----------

export interface Sourced {
  text: string;
  source?: { label: string; url: string };
  note?: string;
}

// TODO(verify before pitch): confirm the Renters' Rights Act rent-in-advance cap
// (one month outside student housing) and its commencement date against legislation.gov.uk,
// not only the guarantor provider's guide cited below.
export const WHY_NOW: Sourced[] = [
  {
    text: "A guarantor provider reports that the Renters' Rights Act caps rent in advance at one month outside student housing, closing the old workaround of paying months upfront.",
    source: { label: 'Housing Hand guide', url: 'https://housinghand.com/help-and-advice/guides-for-tenants/how-to-rent-without-a-guarantor' },
    note: 'To verify before the pitch.',
  },
  {
    text: 'Regulators are focused on thin credit files and credit invisibility.',
    note: 'General context, no figure claimed.',
  },
  {
    text: 'Open Banking verifies UK accounts by data. Foreign documents remain the paper gap.',
    source: { label: 'Finextra', url: 'https://www.finextra.com/blogposting/27825/how-open-banking-data-can-resolve-thin-credit-files' },
  },
  {
    text: 'A 10-year baseline for settlement is proposed, not yet in the Immigration Rules. Newcomers may spend longer on temporary status.',
    source: { label: 'Whyte Croft Ford', url: 'https://www.whytecroftford.com/?p=27596491' },
  },
];

export const NUMBERS: Sourced[] = [
  {
    text: '10.0 million people (16.8%) in England and Wales were born outside the UK in 2021. In London it was 40.6%.',
    source: { label: 'ONS, Census 2021', url: 'https://www.ons.gov.uk/peoplepopulationandcommunity/populationandmigration/internationalmigration/bulletins/internationalmigrationenglandandwales/census2021' },
  },
  {
    text: 'About 813,000 long-term arrivals in 2025 (ONS provisional).',
    source: { label: 'EIN', url: 'https://www.ein.org.uk/node/801433' },
  },
  {
    text: '3.5 million UK newcomers have little or no UK credit history.',
    source: { label: 'tech.eu (Nova Credit, 2022)', url: 'https://tech.eu/2022/04/12/enabling-access-to-credit-for-immigrants-us-based-fintech-goes-to-europe/' },
    note: 'Vendor estimate.',
  },
  {
    text: 'In a 1,000-person survey of recent immigrants: 66% said getting credit took longer than it should, 55% felt treated differently, and 26% had a fully online process.',
    source: { label: 'Business Wire (Nova Credit, 2023)', url: 'https://www.businesswire.com/news/home/20230726515779/en/Lenders-That-Level-the-Playing-Field-for-UK-Immigrants-Will-Benefit-Most-From-One-of-UKs-Fastest-Growing-Demographics' },
    note: 'Vendor-sponsored survey.',
  },
  {
    text: 'Our estimate: 66% of 3.5 million is roughly 2.3 million people for whom credit takes too long.',
    note: 'Our own estimate, combining the two vendor figures above.',
  },
  {
    text: 'Letting agents commonly require income of 2.5 to 3 times the annual rent.',
    source: { label: 'Moving to the UK', url: 'https://movingtotheuk.co.uk/directory/housing/rental-agencies' },
  },
  {
    text: 'Honest counterpoint: net migration has fallen to 171,000. The existing population and roughly 800,000 yearly arrivals remain.',
    note: 'Likely the same ONS provisional release as above. Confirm the source link before the pitch.',
  },
];

export const TRUST_POINTS: string[] = [
  'Providers request access and Grace approves each one, with an expiry date and a revoke button. Each provider sees only the data it asked for.',
  'Originals are always shown beside the summary.',
  'Low-confidence fields must be confirmed by the user before sharing.',
  'The biggest risk is forged documents. Landed flags inconsistencies, shows verification status honestly, never presents a machine-read pack as verified, and providers can still verify with the employer.',
  'Not a credit decision, and not a certified translation unless partner-reviewed. This demo stores nothing.',
];

// ---------- Document requests from institutions ----------

// What Grace is trying to get access to, and where each provider stood before Landed.
export const ACCESS_GOALS: { provider: ProviderId; goal: string; before: string }[] = [
  { provider: 'lettings', goal: 'A flat', before: 'Asked for a UK guarantor' },
  { provider: 'motor', goal: 'A car', before: 'Declined: income not verified' },
  { provider: 'cu', goal: 'Bank account and loan', before: 'Not applied yet' },
];

export type RequestKind = 'address' | 'rtw' | 'payslips' | 'reference';
export const REQUEST_KINDS: { id: RequestKind; label: string; why: string; fulfil: string }[] = [
  { id: 'address', label: 'Proof of UK address', why: 'Needed to complete the tenancy application', fulfil: 'Employer letter confirming temporary UK address (synthetic)' },
  { id: 'rtw', label: 'Right to work share code', why: 'Required check before any offer', fulfil: 'Share code W12 345 678 (synthetic)' },
  { id: 'payslips', label: 'Three months of overseas payslips', why: 'To see a longer income history', fulfil: 'June and July payslips added and read by Landed (synthetic)' },
  { id: 'reference', label: 'Employer reference contact', why: 'To confirm the job offer directly', fulfil: 'HR contact at Northgate Demo Hospital Trust (synthetic)' },
];
