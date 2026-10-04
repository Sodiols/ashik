# Ashik Rabbani

A monochrome portfolio built with Next.js App Router, React, TypeScript, Tailwind CSS and GSAP. The supplied video was decoded and reviewed before implementation. See [reference analysis](docs/reference-analysis.md) for composition and timing decisions.

## Run locally

Node.js 20.9 or newer is required; Node.js 24 was used for validation.

```powershell
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Open http://localhost:3100. The development command defaults to port 3100, keeping the portfolio separate from other apps on port 3000. Development hot reload also accepts the local `127.0.0.1` hostname. To check the production build:

```powershell
npm run check
npm test
npm audit
npm run start -- --port 3100
```

Stop the development server before starting production on the same port. Tests use Node's native TypeScript support and require Node.js 22.18+ (or Node.js 24).

## Before launch

1. Add Ashik's public Web3Forms submission key to `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY` in `.env.local` and the hosting provider's build environment. This key is intended to be public. Never put unrelated private credentials in `NEXT_PUBLIC_*` variables. Rebuild after changing these values.
2. Add the real HTTPS origin to `NEXT_PUBLIC_SITE_URL`, without a path. This enables canonical URLs and the production sitemap. Without an origin, sitemap entries are omitted and social-image URLs use the local preview origin.
3. Replace the temporary project records and SVG layouts in `data/projects.ts`. Set `placeholder: false` only after authentic imagery, descriptions, credits and permission to publish have been supplied. These concepts are labeled as independent design studies, marked `noindex` and excluded from the sitemap. No project years or clients have been invented.
4. Add the real email and supplied social URLs to `data/site.ts`. Empty entries are omitted. Replace the temporary biography in `sections/About.tsx` if desired.
5. Send an authorized test enquiry on the deployed domain and confirm receipt in Ashik's inbox. Configure Web3Forms domain restrictions where available. Honeypot protection and provider-side filtering are already supported. A captcha can be added if actual spam warrants it; no third-party captcha script is loaded by default.
6. Verify the deployed site on actual iOS/macOS Safari and physical touch devices. Local WebKit coverage is an engine check, not a claim of physical Safari/device testing. Recheck Core Web Vitals on the final hosting and with real project media.

## Architecture

- `components/Portfolio.tsx` and `animations/experience.ts`: one continuous sticky stage when the viewport is at least 900 × 600 CSS pixels, lazy-loaded GSAP scroll timeline, section navigation and cleanup. Narrow and short landscape views use native scrolling. Motion stays deferred until needed; section clicks prepare it before scrolling so initialization cannot interrupt navigation. Reduced motion keeps content still.
- `animations/sections.ts`: oversized About typography, sequential discipline reveals and the final word transforming into Contact. Independent card surfaces separate rear planes before the front while the deck keeps ownership of its transforms. Work atmosphere dissolves into About's passing light; Contact finishes on an almost white canvas. Form rows settle permanently on first interaction. Media-query cleanup restores native layouts and reduced-motion visibility.
- `components/OpticalLens.tsx`: pointer interpolation, clipped magnified type, restrained vertical stretching, grayscale rim, subtle environment parallax. No WebGL. Touch and reduced motion disable the lens; the native pointer remains available.
- `components/ProjectStack.tsx`: measured lower-right panel deck, sideways front-panel exit and diagonal advancement, reverse reconstruction, rear focus depth, wheel thresholds with boundary release, horizontal swipe/drag, keyboard arrows/Home/End, arrow controls and circular pagination. GSAP loads as the stack approaches the viewport; CSS preserves the finite deck without motion when that engine is unavailable. No global wheel trapping.
- `sections/`: Hero, Selected Work, About and Contact. Mobile uses native document flow instead of the desktop spatial transition.
- `lib/contact.ts`: shared typed validation and length limits.
- `components/ContactForm.tsx` and `components/ContactSuccess.tsx`: direct Web3Forms POST, hidden honeypot, loading lock, timeout/abort cleanup and inline failure. Confirmed provider success resolves the whole Contact scene into “MESSAGE / received.” and navigation actions. Success aligns the scene below the fixed header when Contact is visible; a response does not redirect someone browsing another section. Reset focuses the empty name field. Active fields remain visible after viewport/keyboard reflow, and name/email stack across devices. No messages in browser storage. No key means an honest unavailable message, never simulated delivery.
- `app/work/[slug]/page.tsx`: typed, statically generated project routes with project metadata and media.
- `styles/globals.css`, `styles/scenes.css` and `postcss.config.mjs`: Tailwind v4 utilities for shared layout, responsive field grids and alignment, alongside layered custom CSS for typography, lens, atmosphere and motion geometry. About and Contact scene styles are isolated from the established Hero/Work geometry. The Tailwind color theme exposes only the monochrome design tokens; the existing green availability indicator remains. No component kit or prebuilt theme.
- Responsive Tailwind utilities have priority over the layout defaults. Shared `tap-target` and `safe-header` utilities preserve the visible design while adding touch hit areas and notch clearance. The viewport allows zoom, and safe-area insets feed the existing page gutters and footer padding.
- `public/fonts/`: two self-hosted Instrument families and their SIL Open Font licenses. Runtime pages make no font requests to Google.

## Security and validation

Security headers are set in `next.config.ts`: CSP, MIME sniffing protection, frame protection, referrer policy and permissions policy. CSP permits only the site and Web3Forms for production connections. Inline scripts/styles are permitted for Next.js hydration and GSAP; this is a compatible baseline policy, not a nonce-based strict CSP. Production disables `unsafe-eval`. There are no application databases, private API keys, HTML injection, third-party analytics or message storage.

Local verification details and remaining launch checks are recorded in [validation](docs/validation.md). Browser screenshots and decoded reference frames are local review artifacts in ignored `.qa/` and `.reference/` folders. The original reference video is not shipped under `public/`.
