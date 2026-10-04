# Local validation

Initial verification on 3 October 2026; reference-driven Work correction and coordinated About/Contact motion checked on 4 October 2026. Windows with Node.js 24.16.0. This records local production builds, not a deployed-site certification.

## Build and dependencies

- `npm run check`: TypeScript, ESLint and Next.js production build passed. Twelve routes were generated, including five placeholder project pages.
- `npm test`: all four contact-validation tests passed, covering required values, normalization, field lengths and the project-type allowlist.
- `npm audit`: zero known dependency vulnerabilities at verification time.
- Next.js 16.3.8, React 19.3.0, GSAP 3.15.0 and Tailwind CSS 4.3.3. Relevant installed Next.js guides were read before implementation.

## Browser and visual checks

The final production build was served at `http://localhost:3100` and exercised through Playwright.

| Coverage | Result |
| --- | --- |
| System Chrome and Edge, installed Firefox and WebKit | Desktop interaction checks passed; no collected page or console errors |
| Optical cursor | Pointer interpolation and visible magnification passed on desktop; disabled on touch and reduced motion |
| Hero/work transition | Navigation, scrolling, overlapping panels and return to the reconstructed hero passed |
| Project controls | Next button, wheel, keyboard Home/End and mobile swipe passed |
| Responsive widths | 320, 375, 390, 768, 1440, 1600, 1920 and 2560 px checked without horizontal document overflow |
| Laptop viewports | Deep-link alignment at 1366 × 768; work alignment after resizing to 1024 × 768 passed |
| Motion cleanup | Desktop → mobile → desktop resize passed; reduced-motion navigation and project controls passed |
| Direct anchors | `/#work`, `/#about` and `/#contact` aligned correctly after lazy motion initialization |
| Project routes | All five returned 200 with loaded imagery and `noindex`; unknown project returned 404 |
| Navigation | Local anchors resolve; project footer home links return to the portfolio |
| Contact without configuration | Required-field feedback and honest missing-provider-key error passed |

Desktop hero, work, about, contact, mobile layouts and intermediate motion frames were visually reviewed. The decoded reference sequence was revisited for the final comparison. The grayscale theme, staggered type, persistent navigation, optical interaction and spatial panel movement follow the supplied reference's principles while retaining Ashik's identity.

## Work correction — 4 October

The full-resolution video frames at 7.2, 8.0, 9.38, 9.6, 9.9, 10.2 and 12.5 seconds were extracted again. The initial large heading and centered stack were replaced with the reference's five-line left introduction and cropped lower-right deck.

- At 1600 × 1200, all four browser engines placed the front panel at approximately (780.8, 500.4), matching the frame's placement near (780, 500). Rear-plane steps measured 134.4 px right and 99.8 px up.
- Production checks passed in Chrome, Edge, Firefox and WebKit for the offscreen resting state, final composition, rightward front-panel exit above the advancing plane, diagonal advancement, reverse return, keyboard navigation, circular pagination and reconstructed hero. Animation-frame samples verified intermediate transforms and stacking order, rather than only the final card index. No collected console/page errors.
- The corrected work layout passed overflow checks at 320, 390, 768, 1024, 1440 and 1920 px. Mobile swipe and desktop reduced-motion controls passed.
- A recorded motion review verified that the header remains fixed during entry. Every work foreground plane, including the rear planes, starts below the resting hero viewport.
- Deliberately holding the motion chunk verified early Work clicks, changing a pending request to About, and overriding an initial `/#work` URL with About. Chrome and WebKit passed all three scenarios without a premature native jump or stale navigation overriding the latest request.
- Final-production gesture checks passed in all four engines: a real mouse drag ending outside the cropped deck, wheel project advancement, native wheel release at the last project, and opening the active project page. No collected page errors. Horizontal drags capture the pointer only after the gesture threshold, preserving normal link clicks.
- `npm run check` passed again after the correction. Contact validation, contact delivery code, security policy and dependencies were not changed by this revision.

The local motion video, per-frame measurements and revised screenshots are retained under `.qa/`. Reference composition measurements and implementation decisions are described in [reference analysis](reference-analysis.md).

## Coordinated About and Contact motion — 4 October

- About and Contact share clipped typography reveals, staggered supporting text and a moving grayscale atmosphere. Desktop Work departure and About departure connect the sections; their motion follows scroll position and reverses consistently.
- The production build passed section-motion checks in Chrome, Edge, Firefox and WebKit: intermediate reveals, reverse scrolling, section-anchor alignment, desktop/mobile media cleanup and changing reduced-motion preferences.
- Composition checks passed at 320, 375, 390, 768, 1024, 1440, 1600, 1920 and 2560 px, without horizontal document overflow or titles exceeding the viewport. Desktop, phone, tablet and wide layouts were visually reviewed.
- Contact rows have a time-based entrance that finishes immediately when any field receives focus. Typed values and resting field positions stayed stable while scrolling. Simulated provider success, failure, network failure, duplicate-submit prevention, honeypot rejection and success focus passed again with intercepted requests; no live email was sent.
- Soft gradients replace large blur filters in the new section backgrounds. Mobile defers section motion until About or Contact approaches, while reduced motion leaves all content visible and still. Footer links remain stationary and available throughout the copyright reveal.
- Holding the production motion chunk still passed early Work navigation, a newer About request and overriding an initial Work hash in Chrome and WebKit. The completed hero/work composition is retained.
- Final footer clicks immediately after scrolling passed in all four engines, including returning to Hero. Real drag gestures, wheel advancement, native wheel release at the last project and active project links passed again in all four engines. A recorded production flow confirmed the complete section sequence and return; invalid-email and missing-provider feedback also passed with no collected console/page errors.
- `npm run check` and all four contact validation tests passed. Screenshots, section measurements and motion recordings remain in the ignored `.qa/` folder.

## Responsive pass — 4 October

This revision preserves the artwork, content, colors, fonts and desktop composition. Tailwind responsive utilities adapt only device layout and controls, with the existing custom motion CSS retained.

- Short landscape views use the same scrollable Work composition as narrow views, rather than clipping the pinned stage. The shared desktop stage condition is at least 900 × 600 CSS pixels; CSS and motion queries agree at the boundaries.
- The final production matrix passed 32 viewport combinations from 280 to 2560 px wide, including 320/390 px phones, tablets, laptops, wide screens, short landscape views and both sides of the 360/600/900 px boundaries. Checks covered section alignment, visible text/control bounds, touch arrows, input sizing and horizontal overflow. All five project routes and the 404 layout passed at seven viewport widths.
- Mobile and landscape section navigation waits for optional motion initialization before starting native scrolling. Deliberately delayed production chunks passed Work navigation, replacing a pending request with About and overriding an initial Work hash in Chrome and WebKit at 390 × 844 and 932 × 430.
- Touch checks passed in Chrome, Edge, Firefox and WebKit: actual taps, project advancement, rotation between phone/tablet/landscape layouts, reduced-motion cleanup and retained form values. Focused fields stayed visible after viewport changes, including keyboard-sized height reductions. These are automated viewport simulations, not physical keyboard/device certification.
- Narrow phones keep every project control in the viewport and stack name/email fields below 360 px. Invisible hit-area extensions leave visible control sizes intact. Coarse-pointer devices show the existing project arrows without requiring hover.
- All five project routes, their images and the 404 layout passed narrow, tablet and desktop checks. Contact validation and intercepted provider success/reset layouts passed at 280, 320, 360, 390, 600, 768 and 1024 px, including phone landscape sizes. Provider failure, network failure, duplicate locking, honeypot and success focus passed again; no live email was sent.
- Injected safe-area values passed in Chrome and WebKit for phone portrait, phone landscape and tablet sizes. Header/content clearance, side gutters, footer padding and active-field visibility were checked. Physical notch and browser-chrome behavior still need device testing. Zoom remains enabled in viewport metadata.
- Desktop screenshots at 1600 × 1200 and the full project layout were compared with the pre-change captures. Layout and styling were preserved; average channel differences were at most 0.053 on the 0–255 scale, including rendering/motion variation.
- The final `npm run check` and four contact validation tests passed. Responsive results, original captures, screenshots and interaction evidence are retained under `.qa/`.

## About and Contact expressive upgrade — 4 October

- About now has a custom SVG connection line drawn with scroll position, individual sans-serif letter reveals and staggered discipline rules. The serif lettering remains intact. Discipline hover effects are limited to devices with a fine pointer and hover support.
- Contact shares the letter choreography and drawn circle motif. Its orbit follows scrolling without an endless animation loop. The circular arrow is a real button: Enter, clicking or tapping focuses the first message field; after submission it targets the success panel instead.
- The original heading text remains available as a single accessible name. Decorative letters, paths and arrows are hidden from assistive technology. Changing reduced-motion preferences removes the scroll transforms and leaves complete, visible illustrations.
- Chrome, Edge, Firefox and WebKit passed intermediate/reversible drawing, completed letter transforms, discipline hover, keyboard and mobile prompt activation, retained form values and reduced-motion cleanup. Touch/rotation checks passed again in all four engines, including active-field visibility and retained values across phone, tablet and short landscape sizes.
- The composition passed ten viewport combinations from 280 to 2560 px, including 900 × 600 and phone landscape, with text/control bounds, section navigation and no horizontal overflow checked. All five project routes and the 404 layout also passed at seven widths. Desktop and phone screenshots were visually reviewed.
- Hero and the reference-matched Work implementation remain unchanged. Tailwind responsive utilities, safe-area handling, contact validation and delivery behavior are retained. No dependency was added. TypeScript, lint, the production build and all four contact validation tests passed.
- The final production server passed the new motion/prompt checks in all four engines. A recorded Hero → Work → About → Contact → Hero flow passed with invalid-email and missing-provider feedback and no collected console/page errors.

The new motion assertions are retained in `.qa/connection-motion.cjs`; results and screenshots remain in the ignored QA directory. These browser checks simulate mobile layouts; physical devices and inbox delivery retain the requirements below. Performance was not re-benchmarked for this expressive upgrade.

## Availability dot and field focus — 4 October

The wordmark dot is green (`#22c55e`) and has an accessible “Available for work” label. It is rendered outside the header's color-inverting layer, with matching wordmark metrics so its position stays unchanged. Homepage and project-page checks passed in Chrome and WebKit at 280, 390 and 1600 px, including dot alignment and light/dark backdrop review. Contact inputs, select and textarea no longer draw a surrounding focus outline; their existing underline still identifies the active field. Mouse and keyboard focus checks passed. Evidence is retained in `.qa/focus-dot-results.json` and screenshots.

## Project-type dropdown — 4 October

The contact project-type field now uses a custom select-only combobox matching the existing Instrument Sans typography and monochrome palette. The closed control retains its underline; the animated white options panel has generous rows, a dark active highlight and a checkmark on the selected option. It opens above the trigger when needed, caps its height to the visible area and scrolls shorter menus. Reduced motion removes the entry animation.

Production checks passed in Chrome, Edge, Firefox and WebKit at desktop size and five phone/tablet/landscape viewport combinations (280 × 653, 390 × 844, 768 × 1024, 932 × 430 and 390 × 400). Checks covered option selection, Arrow/Home/End/Enter/Escape/Tab keys, typeahead, outside dismissal, validation focus, retained selection across resizing, hidden form values, visible menu bounds and reduced motion. An actual touch tap selected an option successfully. The field keeps its accessible label and error description; focus uses the underline instead of a surrounding box.

The completion of desktop section navigation now preserves focus if a visitor has already started using that section. This prevents an open dropdown from closing when the scroll animation finishes. The recorded complete section flow passed again with invalid-email and missing-provider feedback and no collected console/page errors. Simulated provider success, failure, network failure, duplicate locking, honeypot and success/reset behavior passed through the new control; the provider payload contained the chosen project type. No live email was sent and the temporary dummy-key process was stopped. TypeScript, lint, production build and all four contact validation tests passed.

Evidence is retained in `.qa/project-dropdown-results.json`, `.qa/contact-results.json`, screenshots and the production flow recording. The existing in-app preview was refreshed and visually reviewed with the dropdown open.

## Connected About and Contact scenes — 4 October

The current redesign supersedes the earlier About/Contact compositions described above. Hero typography, optical lens, fonts and the resting project-deck geometry are preserved. About uses oversized “ABOUT / Ashik.” typography, a passing grayscale light field, full-width discipline rows and a restrained watermark. The decorative About SVG loop and repeated orbit backgrounds are removed. Contact uses “LET’S / create / TOGETHER.” with an asymmetric form and almost white atmosphere. At the user's request, the original circular arrow button is restored below the Contact headline, with a scroll-drawn rotating ring, diagonal hover/focus arrow exchange and click-to-focus action.

Work departure now translates independent card surfaces, with rear planes departing before the front. The existing deck retains ownership of card transforms, blur and stacking order. Background depth diminishes continuously into About, and wheel gestures release to document scrolling during departure. The final discipline word transforms while Contact typography enters. Form fields use a short stagger and stay still after editing begins.

Local verification for this revision:

- TypeScript, ESLint and the production build passed. All four shared contact-validation tests passed; dependency audit reported zero vulnerabilities.
- A 32-viewport matrix from 280 to 2560 CSS pixels passed navigation, text/control bounds and no horizontal overflow, including narrow phones and short landscape views. All five project routes and the 404 layout passed at seven widths. Additional laptop-height layouts were reviewed after refining the About title scale.
- Connected scene motion, rear-plane separation, reverse navigation, project selection during departure, stable editing and reduced-motion cleanup passed in Chrome, Edge, Firefox and WebKit. Actual touch events, retained input/focus through six viewport changes and focused-field visibility passed in all four engines.
- The existing custom project-type dropdown passed again on the production build in all four engines, including keyboard/typeahead, validation, outside dismissal, viewport placement, retained values and reduced motion.
- The restored circular Contact button passed on the final production build in Chrome, Edge, Firefox and WebKit. Checks covered its placement beneath the headline, reversible ring drawing, scroll rotation, diagonal hover animation, Enter/click/touch activation, visible name-field focus, retained values and reduced-motion cleanup. Desktop, 280/390 px phones, tablet and short-landscape bounds passed. Evidence is `.qa/restored-contact-arrow-results.json` and `.qa/restored-arrow-desktop.png` / `.qa/restored-arrow-mobile.png`; the in-app preview was refreshed and visually reviewed.
- Intercepted provider checks passed in all four engines: confirmed success, rejection, network failure, duplicate locking, honeypot, selected project-type payload, empty reset with name-field focus, and no browser message storage. Confirmed success replaces the entire Contact composition with “MESSAGE / received.” and Work/Home actions. The success scene aligns below the header, and a response does not redirect a visitor who has navigated away. Success typography fits nine phone/tablet/landscape viewport combinations.
- A slow production Hero → Work → About → Contact scroll was recorded and visually reviewed. Invalid-email focus, honest missing-provider feedback and return-to-home behavior passed with no collected console/page errors.

Development labels have been replaced by honest “independent design study” wording. The existing `placeholder` flags, `noindex` and sitemap exclusions remain; these concepts are not represented as commissioned client projects. The green availability dot is retained from the user's earlier explicit request. No new dependency or private credential was added.

Evidence is retained in `.qa/scene-motion-results.json`, `.qa/scene-contact-results.json`, `.qa/scenes-responsive-32.json`, `.qa/device-interactions.json`, `.qa/project-dropdown-results.json`, `.qa/responsive-contact-results.json`, `.qa/scenes-flow-results.json`, screenshots and `.qa/scenes-flow.webm`. Automated browser engines and viewport simulation do not establish physical-device coverage or actual inbox delivery. Launch requirements below remain open.

## Local development origin and port collision — 4 October

Husnalogy's customizer browser tests were reusing the portfolio development server on port 3000, causing `/__e2e/customizer` to return 404. The portfolio's `npm run dev` now explicitly selects its established port 3100. The portfolio config allows the exact loopback hostname `127.0.0.1` for development resources and HMR. Both applications were restarted on their respective ports; no customizer route was added to the portfolio, and no Husnalogy source was changed.

Live checks confirmed the portfolio homepage and dev JavaScript return 200 on port 3100, the actual Husnalogy customizer fixture returns 200 on port 3000, and HMR WebSocket connections from `127.0.0.1` succeed on both. Portfolio TypeScript and ESLint passed. Evidence is `.qa/dev-origin-results.json`. These checks validate routing and development connectivity; they do not establish that the separate Husnalogy E2E suite passes.

## Contact delivery

Provider behavior was tested in a separate temporary development process using intercepted requests and a dummy public key. No live email was sent, and no dummy key is shipped in the application.

Simulated success, provider rejection, network failure, duplicate-submit locking, honeypot rejection and success focus all passed. Messages were not written to local or session storage. Four unit tests cover shared validation. The real Web3Forms key has not been supplied, so delivery to Ashik's inbox remains unverified.

## Performance and security

Initial-build Lighthouse 13.5.0 results from 3 October, simulated mobile, production build (before the work-composition correction):

| Metric | Result |
| --- | --- |
| Performance | 93 / 100 |
| Accessibility | 100 / 100 |
| Best practices | 100 / 100 |
| SEO | 100 / 100 |
| First contentful paint | 1.0 s |
| Largest contentful paint | 2.8 s |
| Total blocking time | 170 ms |
| Cumulative layout shift | 0 |

After the coordinated About/Contact revision, before the responsive pass, an isolated Lighthouse 13.5.0 simulated-mobile run scored 89 performance and 100 each for accessibility, best practices and SEO. FCP was 1.3 s, LCP 2.9 s, total blocking time 230 ms and CLS 0. The report is retained as `.qa/lighthouse-coordinated-isolated.json`; the table above records the earlier baseline.

The connected About/Contact redesign was measured twice on the production build before restoring the circular Contact button. Performance scored 82 and 92 on identical code; accessibility, best practices and SEO scored 100 in both runs. FCP was 1.3 / 1.2 s, LCP 3.0 / 2.8 s, total blocking time 420 / 140 ms and CLS 0 in both. The spread demonstrates local lab variation rather than a consistent 92 score. Reports are `.qa/lighthouse-scenes.json` and `.qa/lighthouse-scenes-repeat.json`. The restored SVG button reuses the existing GSAP dependency; it has not received a separate Lighthouse benchmark.

GSAP desktop motion and stack animation are loaded on demand. Mobile uses native scrolling and defers About/Contact motion until those sections approach; reduced-motion navigation keeps the content still. Fonts are hosted locally, project placeholders are small SVGs, and the original reference video is excluded from public assets. These are lab results; LCP and other Core Web Vitals need measurement again on the final hosting with real media and field traffic.

Production response checks confirmed CSP, frame protection, MIME sniffing protection, permissions policy and referrer policy. Production CSP omits `unsafe-eval`; HTTPS upgrade is enabled only when a real HTTPS site origin is configured. The compatible CSP allows inline Next.js scripts and GSAP styles and is not a strict nonce policy. No private keys, databases, analytics or message storage were added.

## Implementation audit and repair — 5 October

A full audit and refactor, preserving the creative direction. Measured on the local production build (Windows, Node 24.16, Chrome stable, Playwright 1.62 browsers, Lighthouse 13.5). Before/after numbers come from the original commit and this revision served side by side and measured interleaved, so both saw the same machine conditions.

### What was found

- First paint was blocked by one very large initial layout (≈2 s at 4× CPU throttling), not by JavaScript. Part of that was the cold Windows font cache resolving the metric-fallback faces; the rest was laying out off-screen scenes.
- The optical lens restyled a full-viewport clipped layer every frame and queried the DOM per frame (261 style recalculations and 766 ms of layerization in a 2 s pointer trace at 4× CPU).
- Desktop CLS 0.17: enabling the pinned stage collapsed the atmosphere's container after load.
- Hero words were positioned by viewport height but sized by width, so they collided on short laptops (1366 × 768). Tablet Work metadata overlapped the deck.
- Text arrows (← → ↗) are not in Instrument Sans and rendered from different system fonts per platform. The font families were registered as `sans` and `serif`, colliding with CSS generic keywords.
- Large blur filters on animated surfaces; blurred project cards during movement; CSS and GSAP sharing transforms; 1,659 effective lines of custom CSS with duplicate and empty media queries.
- Unknown project slugs returned an error shell that only rendered client-side.

### What changed

See the README architecture section. In short: server-rendered sections with four small client islands; motion loads after first paint (idle) or on first scroll intent and never blocks navigation; a compositor-only lens; percent-based deck geometry with a native scroll-snap rail on phones and no animated blur; one `gsap.matchMedia` context; a Tailwind v4 responsive system with `stage`, `flow` and `short` shape variants; custom CSS reduced from 1,659 to 821 effective lines (−51%) with one block per media condition; monochrome availability dot; SVG arrows; a static 404 for unknown slugs; COOP and HSTS (HTTPS only) headers.

### Results

| Measure | Original | This revision |
| --- | --- | --- |
| Hero first paint, Lighthouse mobile run (observed, 4× CPU) | 2.46 s | 0.58 s |
| Speed Index, Lighthouse mobile (median of 6) | 4.0 s | 1.2 s |
| Total long-task time, mobile load (median) | 860 ms | 689 ms |
| Lighthouse mobile performance (median of 6, interleaved) | 90 (88–92) | 89 (82–97) |
| Lighthouse mobile simulated TBT (median) | 221 ms | 316 ms |
| Lighthouse desktop performance | 92, CLS 0.168 | 100 (×3), CLS 0 |
| Accessibility / Best practices / SEO (home) | 100 / 100 / 100 | 100 / 100 / 100 |
| Optical lens at 4× CPU, dropped frames over 2 s | 51 of 68 | 0 of 120 |
| Deck navigation, p95 frame | 16.9 ms | 16.8 ms |

The simulated mobile TBT is higher even though total main-thread work fell: the hero now paints about 1.8 s earlier, so the same framework evaluation and hydration (unchanged at ≈75 ms unthrottled) fall after first paint, where TBT counts them. Mobile Lighthouse scores on this machine vary by up to 15 points between identical runs. Inline CSS (`experimental.inlineCss`) and Suspense-split hydration were tried and measured; neither helped, and both were reverted.

Frame pacing of the hero → work transition on GPU Chrome improved from p95 40 ms to 13–27 ms on a quiet machine after promoting the two scaled atmosphere shapes and the hero lettering. Later runs while other applications used the GPU were slower for both builds (current 12–14 dropped frames per 2.5 s versus 17–20 for the original).

Project pages score 92–93 mobile and 100 desktop; their SEO score is 66 only because placeholder studies are intentionally `noindex`.

### Browser QA

`scripts/qa-browser.cjs` (24 viewports from 280 × 653 to 2560 × 1440) checks horizontal overflow, header collisions, hero type bounds against the header and metadata, real header navigation and `aria-current`, the front card and controls, next/previous, CDP touch swipes (horizontal advances, vertical scrolls the page), About and Contact text bounds, form width, 16 px controls, validation, the custom dropdown, the success state (Web3Forms intercepted, nothing sent), focus on reset, the footer home link, console errors and failed requests. `scripts/qa-states.cjs` checks portrait ↔ landscape rotation (including tablet crossing between the flow and stage layouts), navigation before motion has loaded, reduced motion, 80–150% zoom, all project routes and the 404.

Earlier matrix runs passed in Edge (all), Firefox (all) and Chrome (all but one intermittent 320 × 568 timing), and WebKit (all but 2560 × 1440 timing in headless software rendering at ~2 fps). Final-run results are recorded below. Issues found and fixed by these runs: reveals hiding fields from keyboard focus, ScrollTrigger refreshes cancelling smooth navigation, early navigation before `load`, Firefox software-rendering cost of the atmosphere, and the success scroll under the header.

## Remaining launch requirements

1. Supply `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY` and the final HTTPS `NEXT_PUBLIC_SITE_URL`, then rebuild.
2. Replace explicitly labeled project layouts with authentic work, descriptions and publishing permissions. Add the real contact email/social URLs if desired. No clients, project years, achievements or portrait have been invented.
3. Send an authorized enquiry from the deployed domain and confirm actual inbox delivery.
4. Check actual iOS/macOS Safari and physical touch devices. Automated WebKit is browser-engine coverage only.
5. Verify production hosting, final domain metadata, real-media performance and field Core Web Vitals.

Local QA JSON, screenshots and decoded reference frames are retained in ignored `.qa/` and `.reference/` directories. The implementation is available for review; launch requirements above remain open.
