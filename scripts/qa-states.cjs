/*
  State QA: rotation, reduced motion, zoom, project routes, 404 and assets.
    PLAYWRIGHT=/path/to/playwright node scripts/qa-states.cjs [chromium|firefox|webkit|chrome|msedge]
*/
const pw = require(process.env.PLAYWRIGHT || "playwright");

const url = process.env.URL || "http://localhost:3100";
const engine = process.argv[2] || "chromium";
const failures = [];
const fail = (where, message) => {
  failures.push(`${where}: ${message}`);
  console.log(`  ✗ ${where}: ${message}`);
};
const launch = () =>
  engine === "chrome" || engine === "msedge"
    ? pw.chromium.launch({ channel: engine })
    : pw[engine].launch();

function watch(page, bucket) {
  page.on("pageerror", (e) => bucket.push(`pageerror ${e.message}`));
  page.on("console", (m) => m.type() === "error" && bucket.push(`console ${m.text()}`));
  page.on("response", (r) => r.url().startsWith(url) && r.status() >= 400 && !r.url().includes("/work/nope") && !r.url().endsWith("/nope") && bucket.push(`${r.status()} ${r.url()}`));
  page.on("requestfailed", (r) => r.url().startsWith(url) && bucket.push(`failed ${r.url()}`));
}

const state = (page) =>
  page.evaluate(() => {
    const stage = document.querySelector(".experience");
    const card = document.querySelector('.project-card[aria-hidden="false"]').getBoundingClientRect();
    return {
      enhanced: stage.hasAttribute("data-enhanced"),
      lettering: getComputedStyle(document.querySelector(".hero-lettering")).transform,
      intro: getComputedStyle(document.querySelector(".work-intro")).transform,
      stack: getComputedStyle(document.querySelector(".project-stack")).transform,
      workVisible: getComputedStyle(document.getElementById("work")).visibility,
      heroInert: document.getElementById("home").inert,
      workInert: document.getElementById("work").inert,
      card: { l: card.left, r: card.right, t: card.top, b: card.bottom, w: card.width },
      vw: document.documentElement.clientWidth,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });

async function rotation(browser, portrait, landscape) {
  const where = `rotate ${portrait.join("x")}↔${landscape.join("x")}`;
  console.log(where);
  const context = await browser.newContext({ viewport: { width: portrait[0], height: portrait[1] }, hasTouch: true });
  const page = await context.newPage();
  const errors = [];
  watch(page, errors);
  await page.goto(url, { waitUntil: "networkidle" });
  await page.locator('.header nav a[href="#work"]').click();
  await page.waitForTimeout(1500);
  await page.locator('button[aria-label="Next project"]').click();
  await page.waitForTimeout(900);
  for (const [w, h] of [landscape, portrait, landscape]) {
    await page.setViewportSize({ width: w, height: h });
    await page.waitForTimeout(1200);
    await page.locator('.header nav a[href="#work"]').click();
    await page.waitForTimeout(1600);
    const s = await state(page);
    if (s.overflow > 0) fail(where, `overflow at ${w}x${h}`);
    if (s.workVisible !== "visible") fail(where, `work hidden at ${w}x${h}`);
    if (s.card.w < 150 || s.card.l > s.vw - 40 || s.card.r < 40) fail(where, `front card offscreen at ${w}x${h} ${JSON.stringify(s.card)}`);
    if (!s.enhanced) {
      if (s.lettering !== "none" && s.lettering !== "matrix(1, 0, 0, 1, 0, 0)") fail(where, `stale hero transform ${s.lettering}`);
      if (s.intro !== "none" && s.intro !== "matrix(1, 0, 0, 1, 0, 0)") fail(where, `stale intro transform ${s.intro}`);
      if (s.heroInert || s.workInert) fail(where, "stale inert state");
    }
    const title = await page.evaluate(() => document.querySelector('.project-card[aria-hidden="false"] h3').textContent);
    if (title !== "MONO STUDIO") fail(where, `active project lost after rotation: ${title}`);
  }
  for (const e of errors) fail(where, e);
  await context.close();
}

async function earlyNavigation(browser, [w, h], delay) {
  // Navigation must never wait for (or be broken by) the motion engine.
  const where = `early navigation ${w}x${h} +${delay}ms`;
  console.log(where);
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(delay);
  await page.locator('.header nav a[href="#work"]').click();
  await page.waitForTimeout(2500);
  const r = await page.evaluate(() => ({
    scene: document.querySelector(".experience").dataset.scene,
    enhanced: document.querySelector(".experience").hasAttribute("data-enhanced"),
    top: document.getElementById("work").getBoundingClientRect().top,
  }));
  if (r.enhanced ? r.scene !== "work" : Math.abs(r.top) > 2) fail(where, JSON.stringify(r));
  await page.locator('.header nav a[href="#contact"]').click();
  await page.waitForTimeout(2500);
  const top = await page.evaluate(() => document.getElementById("contact").getBoundingClientRect().top);
  if (Math.abs(top) > 2) fail(where, `contact at ${top}`);
  await page.close();
}

async function reducedMotion(browser, [w, h]) {
  const where = `reduced motion ${w}x${h}`;
  console.log(where);
  const context = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: "reduce" });
  const page = await context.newPage();
  const errors = [];
  watch(page, errors);
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);
  const s = await state(page);
  if (s.enhanced) fail(where, "pinned stage enabled under reduced motion");
  const lens = await page.evaluate(() => getComputedStyle(document.querySelector(".optical-lens")).display);
  if (lens !== "none") fail(where, "optical lens available under reduced motion");
  for (const id of ["work", "about", "contact"]) {
    await page.locator(`.header nav a[href="#${id}"]`).click();
    await page.waitForTimeout(150);
    const top = await page.evaluate((id) => document.getElementById(id).getBoundingClientRect().top, id);
    if (Math.abs(top) > 2) fail(where, `${id} not reached instantly (${top})`);
  }
  // All content visible without motion.
  const hidden = await page.evaluate(() =>
    [...document.querySelectorAll("main h2, main p, main li, main .title-word")].filter((el) => {
      const cs = getComputedStyle(el);
      return cs.visibility === "hidden" || Number(cs.opacity) < 0.99;
    }).length,
  );
  if (hidden) fail(where, `${hidden} content elements hidden`);
  await page.locator('button[aria-label="Next project"]').click();
  await page.waitForTimeout(100);
  const title = await page.evaluate(() => document.querySelector('.project-card[aria-hidden="false"] h3').textContent);
  if (title !== "MONO STUDIO") fail(where, "deck controls inactive");
  for (const e of errors) fail(where, e);
  await context.close();
}

async function zoom(browser, [w, h], factor) {
  // Browser zoom shrinks or grows the CSS viewport at the same device size.
  const where = `zoom ${Math.round(factor * 100)}% of ${w}x${h}`;
  console.log(where);
  const context = await browser.newContext({
    viewport: { width: Math.round(w / factor), height: Math.round(h / factor) },
    deviceScaleFactor: factor,
  });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  for (const id of ["home", "work", "about", "contact"]) {
    if (id !== "home") await page.locator(`.header nav a[href="#${id}"]`).click();
    await page.waitForTimeout(1500);
    const r = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      header: (() => {
        const a = document.querySelector(".header a").getBoundingClientRect();
        const n = document.querySelector(".header nav").getBoundingClientRect();
        return n.left - a.right;
      })(),
    }));
    if (r.overflow > 0) fail(where, `overflow at ${id}`);
    if (r.header < 8) fail(where, "header items collide");
  }
  await context.close();
}

async function routes(browser) {
  for (const [w, h] of [[320, 568], [390, 844], [768, 1024], [1440, 900], [2560, 1440]]) {
    const where = `routes ${w}x${h}`;
    console.log(where);
    const context = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await context.newPage();
    const errors = [];
    watch(page, errors);
    for (const slug of ["nova", "mono-studio", "atelier-19", "object", "forma"]) {
      const response = await page.goto(`${url}/work/${slug}`, { waitUntil: "networkidle" });
      if (response.status() !== 200) fail(where, `/work/${slug} returned ${response.status()}`);
      const r = await page.evaluate(() => {
        const img = document.querySelector("main img");
        const vw = document.documentElement.clientWidth;
        return {
          overflow: document.documentElement.scrollWidth - vw,
          image: img.complete && img.naturalWidth > 0,
          outside: [...document.querySelectorAll("main h1, main p, main a, main span")].filter((el) => {
            const b = el.getBoundingClientRect();
            return b.width && (b.left < -1 || b.right > vw + 1);
          }).length,
          robots: document.querySelector('meta[name="robots"]')?.content,
          h1: document.querySelectorAll("h1").length,
        };
      });
      if (r.overflow > 0) fail(where, `${slug} overflow`);
      if (!r.image) fail(where, `${slug} image missing`);
      if (r.outside) fail(where, `${slug}: ${r.outside} elements outside viewport`);
      if (r.h1 !== 1) fail(where, `${slug}: ${r.h1} h1 elements`);
    }
    await page.locator('a[href="/#work"]').first().click();
    await page.waitForURL(/\/#work$/);
    await page.waitForTimeout(1500);
    const workTop = await page.evaluate(() => document.getElementById("work").getBoundingClientRect().top);
    if (Math.abs(workTop) > 2 && !(await page.evaluate(() => document.querySelector(".experience").dataset.scene === "work")))
      fail(where, `back to work landed at ${workTop}`);
    // The intentional 404 logs a console error, so use an unwatched page.
    const probe = await context.newPage();
    const missing = await probe.goto(`${url}/work/nope`);
    if (missing.status() !== 404) fail(where, `unknown project returned ${missing.status()}`);
    const nf = await probe.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      h1: document.querySelector("h1")?.textContent,
    }));
    if (nf.overflow > 0 || !nf.h1) fail(where, "404 page broken");
    for (const e of errors) fail(where, e);
    await context.close();
  }
}

(async () => {
  const browser = await launch();
  const steps = [
    () => rotation(browser, [390, 844], [844, 390]),
    () => rotation(browser, [768, 1024], [1024, 768]),
    () => rotation(browser, [820, 1180], [1180, 820]),
    ...[0, 300, 900, 2000].map((d) => () => earlyNavigation(browser, [1440, 900], d)),
    () => earlyNavigation(browser, [390, 844], 0),
    () => reducedMotion(browser, [1440, 900]),
    () => reducedMotion(browser, [390, 844]),
    ...[0.8, 1, 1.25, 1.5].flatMap((f) => [() => zoom(browser, [1440, 900], f), () => zoom(browser, [390, 844], f)]),
    () => routes(browser),
  ];
  for (const step of steps) {
    try {
      await step();
    } catch (error) {
      fail("step", error.message.split("\n").slice(0, 4).join(" | "));
    }
  }
  await browser.close();
  console.log(failures.length ? `\n${failures.length} failure(s)` : "\nall state checks passed");
  process.exit(failures.length ? 1 : 0);
})();
