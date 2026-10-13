# Landed

**Prove your income once. Be understood everywhere.**

Hackathon demo for Ship Tonight (London, 13 Oct 2026), Access to finance track.

Newcomers to the UK upload their overseas financial documents once. Landed reads them and turns them into a UK-readable summary, with the originals shown alongside. Providers then *request* access to the pack. The newcomer approves each request, for a set time, and can revoke it. Follow-up document requests and replies stay on Landed.

All data is synthetic and deterministic. There is no backend. Nothing is uploaded or stored.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check and production build into dist/
npm run preview  # serve the production build
```

Requires Node 18 or later.

## Deploy

`dist/` is a static site with relative asset paths, so any static host works.

- **Netlify:** drag `dist/` into the Netlify dashboard, or set build command `npm run build` and publish directory `dist`.
- **Vercel:** import the repo. The framework preset is Vite, the output directory is `dist`.
- **GitHub Pages:** run `npm run build` and publish `dist/` (for example with `actions/deploy-pages`).

## Recording the demo

1. Open the app full screen. A viewport of about **1536 x 864** fits every step with no scrolling, for example a 1920 x 1080 screen at 125% browser zoom. 1280 x 800 also works. At 1280 x 720, two steps scroll slightly inside the stage.
2. Switch on **Presenter mode** in the top bar. It plays the whole flow in 75 seconds, with a cursor and on-screen captions.
3. **Space** pauses or resumes. **Esc** stops. The run ends on the institution view, with the counter showing 1 upload and 3 shares.

## Structure

- `src/data/mock.ts` holds all synthetic data, captions and drawer content, with sources.
- `src/store.tsx` is the single shared store (React `useReducer`), so the newcomer and institution views stay in sync.
- `src/steps/` holds the six demo steps.
- `src/components/Presenter.tsx` holds the Presenter mode timeline.

## To verify before the pitch

- The Renters' Rights Act rent-in-advance cap, which is only sourced from a guarantor provider's guide (see the `TODO` in `src/data/mock.ts`).
- A source link for the net migration figure of 171,000, which was given without a link.
