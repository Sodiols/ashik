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

Browser QA (needs Playwright and its browsers, which are deliberately not project dependencies):

```powershell
$env:PLAYWRIGHT = "<path to node_modules/playwright>"
node scripts/qa-browser.cjs chrome   # 24 viewports: layout, navigation, deck, swipe, form
node scripts/qa-states.cjs chrome    # rotation, reduced motion, zoom, early navigation, routes, 404
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

The homepage is server-rendered. Static sections (`sections/`, `Header`, `Footer`) ship no JavaScript; four small client islands add behaviour:

- `components/ExperienceController.tsx`: section navigation, `aria-current`, deferred rendering and *when* motion loads. Motion loads after the first paint when the browser is idle, or earlier on the first scroll gesture; navigation never waits for it. It also renders the off-screen scenes (`.defer-render`) before anything depends on exact geometry.
- `components/OpticalLens.tsx`: a small circular window translated by the compositor over a pre-scaled hero copy. No clip-path, no DOM queries or style recalculation per frame; the loop runs only while the pointer moves inside the hero and stops when it settles. Fine pointers on the spatial layout only; never under reduced motion.
- `components/ProjectStack.tsx`: the layered deck. Plane geometry (`lib/deck.ts`) is in percentages of the card, so resizes and rotation never need measuring. Phones get a native scroll-snap rail with a visible next card; tablets and short landscape get a compact deck; the spatial layout keeps the full diagonal deck. Wheel input is claimed only while the pinned Work scene shows and is released at the first and last project; horizontal swipes are taken only when they clearly dominate.
- `components/ContactScene.tsx` + `ContactForm.tsx`: the enquiry/success state and the Web3Forms submission (validation, honeypot, lock, timeout/abort, focus handling).

Motion (`animations/`):

- `config.ts`: the single source for media queries (`stageQuery`, `railQuery`), duration and easing tokens.
- `experience.ts`: one `gsap.matchMedia` context for the pinned hero → work stage, its departure into About, and section motion. Creation is all-or-nothing, so a failure can never leave the page half-enhanced. The stage's scroll length is reserved by CSS from the first paint, so enabling it never moves content.
- `sections.ts`: About and Contact reveals as a few coordinated timelines. Reveals use opacity, never visibility, so content stays keyboard-reachable.

Responsive system (`styles/globals.css`): Tailwind v4 owns layout. Breakpoints `xs 360 · sm 600 · md 900 · lg 1100 · xl 1440 · 2xl 1800`, plus shape variants: `stage` (≥ 900 × 600 and landscape: the spatial layout; everything else uses native document flow), `short` (landscape under 600 px tall) and `coarse` (touch). Colour, type, easing and spacing tokens live in `@theme`.

Specialised visuals (`styles/effects.css`): hero type geometry (both words share one unit derived from the tighter of width and height, so the pair keeps its relationship at any aspect ratio), atmosphere (pre-softened gradients and cached box-shadows, no large blur filters), the lens, deck planes (depth from position and a veil, no blur), clipped display type and form internals. Runtime states such as the pinned stage live in a `states` layer after `utilities`, so they reliably override static classes.

Transform ownership is explicit: GSAP owns the stage elements and cards, the lens owns `.optical-lens`, `.lens-content` and `.atmosphere-drift`, CSS owns card surfaces during departure and hover states. No element is animated by both CSS transitions and GSAP.

- `lib/contact.ts`: shared typed validation and length limits.
- `app/work/[slug]/page.tsx`: statically generated project pages; unknown slugs return the static 404.
- `public/fonts/`: Instrument Sans and Instrument Serif Italic (SIL OFL, licenses included). No runtime font requests leave the site.
- The availability dot is monochrome and inverts with the header.

## Security and validation

Security headers are set in `next.config.ts`: CSP, MIME sniffing protection, frame protection, referrer policy and permissions policy. CSP permits only the site and Web3Forms for production connections. Inline scripts/styles are permitted for Next.js hydration and GSAP; this is a compatible baseline policy, not a nonce-based strict CSP. Production disables `unsafe-eval`. There are no application databases, private API keys, HTML injection, third-party analytics or message storage.

Local verification details and remaining launch checks are recorded in [validation](docs/validation.md). Browser screenshots and decoded reference frames are local review artifacts in ignored `.qa/` and `.reference/` folders. The original reference video is not shipped under `public/`.
