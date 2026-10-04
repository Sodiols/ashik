/*
  Browser QA for the production build. Not part of `npm test`: it needs
  Playwright and its browsers, which are not project dependencies.

    npm run build && npm run start -- --port 3100
    PLAYWRIGHT=/path/to/node_modules/playwright node scripts/qa-browser.cjs [chromium|firefox|webkit|chrome|msedge]

  Web3Forms is intercepted; no message is ever sent.
*/
const pw = require(process.env.PLAYWRIGHT || "playwright");
const fs = require("node:fs");

const url = process.env.URL || "http://localhost:3100";
const engine = process.argv[2] || "chromium";
const only = process.env.ONLY ? process.env.ONLY.split(",") : null;
const viewports = [
  [280, 653], [320, 568], [320, 667], [360, 640], [375, 667], [390, 844], [393, 852],
  [414, 896], [430, 932], [600, 960], [768, 1024], [820, 1180], [912, 1368], [932, 430],
  [1024, 768], [1280, 720], [1280, 800], [1366, 768], [1440, 900], [1536, 864],
  [1600, 900], [1600, 1200], [1920, 1080], [2560, 1440],
].filter(([w, h]) => !only || only.includes(`${w}x${h}`));

const launch = () => {
  if (engine === "chrome" || engine === "msedge") return pw.chromium.launch({ channel: engine });
  return pw[engine].launch();
};

const failures = [];
const slow = Number(process.env.WAIT_SCALE || 1);
const fail = (where, message) => {
  failures.push(`${where}: ${message}`);
  console.log(`  ✗ ${message}`);
};

async function swipe(page, cdp, from, to, steps = 8) {
  if (!cdp) return false;
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: from[0], y: from[1] }] });
  for (let i = 1; i <= steps; i++) {
    const x = from[0] + ((to[0] - from[0]) * i) / steps;
    const y = from[1] + ((to[1] - from[1]) * i) / steps;
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y }] });
    await page.waitForTimeout(16 * slow);
  }
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  return true;
}

const activeTitle = (page) =>
  page.evaluate(() => document.querySelector('.project-card[aria-hidden="false"] h3')?.textContent);

async function checkViewport(browser, [width, height]) {
  const where = `${engine} ${width}x${height}`;
  console.log(where);
  const touch = width < 900 || (width < 1100 && height > width);
  const context = await browser.newContext({
    viewport: { width, height },
    hasTouch: touch,
    isMobile: touch && engine !== "firefox",
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(`pageerror ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error" || (m.type() === "warning" && /key|hydrat/i.test(m.text()))) errors.push(`console ${m.text()}`);
  });
  page.on("requestfailed", (r) => {
    if (r.url().startsWith(url)) errors.push(`requestfailed ${r.url()}`);
  });
  page.on("response", (r) => {
    if (r.url().startsWith(url) && r.status() >= 400) errors.push(`${r.status()} ${r.url()}`);
  });
  const cors = {
    "access-control-allow-origin": "*",
    "access-control-allow-headers": "content-type, accept",
    "access-control-allow-methods": "POST, OPTIONS",
  };
  await page.route("https://api.web3forms.com/**", (route) =>
    route.request().method() === "OPTIONS"
      ? route.fulfill({ status: 204, headers: cors })
      : route.fulfill({ status: 200, headers: cors, contentType: "application/json", body: JSON.stringify({ success: true }) }),
  );
  const cdp = engine === "chromium" || engine === "chrome" || engine === "msedge"
    ? await context.newCDPSession(page)
    : null;

  await page.goto(url, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400 * slow);

  // Layout invariants at rest.
  const rest = await page.evaluate(() => {
    const r = (s) => document.querySelector(s)?.getBoundingClientRect();
    const words = [r(".hero-visual"), r(".hero-designer")];
    const wordmark = document.querySelector(".header a").getBoundingClientRect();
    const nav = document.querySelector(".header nav").getBoundingClientRect();
    const links = [...document.querySelectorAll(".header nav a")].map((a) => a.getBoundingClientRect());
    const meta = r(".hero-bottom");
    const explore = r(".hero-work-link");
    const note = getComputedStyle(document.querySelector(".hero-side-note")).display !== "none" ? r(".hero-side-note") : null;
    const header = document.querySelector(".header").getBoundingClientRect();
    // Inked glyph extents (the box includes line-height padding).
    const ink = (el) => {
      const range = document.createRange();
      range.selectNodeContents(el);
      return range.getBoundingClientRect();
    };
    return {
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      vw: document.documentElement.clientWidth,
      vh: innerHeight,
      words: words.map((w) => ({ l: w.left, r: w.right, t: w.top, b: w.bottom })),
      designerInk: (() => { const b = ink(document.querySelector(".hero-designer")); return { t: b.top, b: b.bottom }; })(),
      visualInk: (() => { const b = ink(document.querySelector(".hero-visual")); return { t: b.top, b: b.bottom, l: b.left, r: b.right }; })(),
      wordmarkRight: wordmark.right,
      navLeft: nav.left,
      navRight: nav.right,
      linkGaps: links.slice(1).map((l, i) => l.left - links[i].right),
      headerBottom: header.bottom,
      metaTop: meta.top,
      metaBottom: meta.bottom,
      exploreRight: explore.right,
      note: note && { l: note.left, t: note.top, b: note.bottom },
      fields: [...document.querySelectorAll(".field-control")].map((f) => parseFloat(getComputedStyle(f).fontSize)),
    };
  });
  if (rest.overflow > 0) fail(where, `horizontal overflow ${rest.overflow}px`);
  if (rest.wordmarkRight + 8 > rest.navLeft) fail(where, `wordmark collides with nav (${rest.wordmarkRight} vs ${rest.navLeft})`);
  if (rest.navRight > rest.vw + 0.5) fail(where, "nav leaves viewport");
  if (rest.linkGaps.some((g) => g < 10)) fail(where, `nav links cramped ${rest.linkGaps}`);
  for (const w of rest.words) if (w.l < -1 || w.r > rest.vw + 1) fail(where, `hero word outside viewport ${JSON.stringify(w)}`);
  if (rest.visualInk.t < rest.headerBottom) fail(where, `hero type under header (${rest.visualInk.t} < ${rest.headerBottom})`);
  if (rest.designerInk.b > rest.metaTop + 2) fail(where, `hero type collides with metadata (${Math.round(rest.designerInk.b)} > ${Math.round(rest.metaTop)})`);
  if (rest.metaBottom > rest.vh) fail(where, "hero metadata below the fold");
  if (rest.exploreRight > rest.vw) fail(where, "Explore Work outside viewport");
  if (rest.note && rest.note.b > rest.words[1].t && rest.note.l < rest.words[1].r && rest.note.t < rest.words[1].b)
    fail(where, "side note overlaps Designer");
  if (rest.fields.some((s) => s < 16)) fail(where, `form controls under 16px: ${rest.fields}`);

  // Navigate to Work through the real header link.
  await page.locator('.header nav a[href="#work"]').click();
  await page.waitForTimeout(1800 * slow);
  const work = await page.evaluate(() => {
    const stage = document.querySelector(".experience");
    const card = document.querySelector('.project-card[aria-hidden="false"]').getBoundingClientRect();
    const next = document.querySelector('button[aria-label="Next project"]');
    const nr = next.getBoundingClientRect();
    const hit = document.elementFromPoint(nr.left + nr.width / 2, nr.top + nr.height / 2);
    return {
      enhanced: stage.hasAttribute("data-enhanced"),
      scene: stage.dataset.scene,
      workTop: document.getElementById("work").getBoundingClientRect().top,
      card: { t: card.top, b: card.bottom, l: card.left, r: card.right },
      nextReachable: next === hit || next.contains(hit),
      nextInView: nr.top >= 0 && nr.bottom <= innerHeight && nr.right <= document.documentElement.clientWidth,
      current: document.querySelector('.header nav a[aria-current]')?.textContent,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });
  if (work.current !== "Work") fail(where, `aria-current after Work nav: ${work.current}`);
  if (work.enhanced ? work.scene !== "work" : Math.abs(work.workTop) > 2) fail(where, `Work anchor not aligned (${JSON.stringify(work)})`);
  if (work.card.t < 0 || work.card.l > rest.vw) fail(where, `front card outside viewport ${JSON.stringify(work.card)}`);
  if (work.overflow > 0) fail(where, "overflow at Work");

  // Scroll the controls into view in flow layouts, then use them.
  await page.locator('button[aria-label="Next project"]').scrollIntoViewIfNeeded();
  const nextReachable = await page.evaluate(() => {
    const next = document.querySelector('button[aria-label="Next project"]');
    const nr = next.getBoundingClientRect();
    const hit = document.elementFromPoint(nr.left + nr.width / 2, nr.top + nr.height / 2);
    return next === hit || next.contains(hit);
  });
  if (!nextReachable) fail(where, "Next project button covered");
  const before = await activeTitle(page);
  await page.locator('button[aria-label="Next project"]').click();
  await page.waitForTimeout(900 * slow);
  const afterNext = await activeTitle(page);
  if (afterNext === before) fail(where, "Next project did nothing");
  await page.locator('button[aria-label="Previous project"]').click();
  await page.waitForTimeout(900 * slow);
  if ((await activeTitle(page)) !== before) fail(where, "Previous project did not return");

  // Touch: horizontal swipe advances, vertical swipe scrolls the page.
  if (touch && cdp) {
    const box = await page.locator('.project-card[aria-hidden="false"]').boundingBox();
    const y = box.y + box.height * 0.6;
    await swipe(page, cdp, [box.x + box.width * 0.8, y], [box.x + box.width * 0.15, y]);
    await page.waitForTimeout(1100 * slow);
    if ((await activeTitle(page)) === before) fail(where, "horizontal swipe did not advance");
    const scrollBefore = await page.evaluate(() => scrollY);
    const t0 = await activeTitle(page);
    await swipe(page, cdp, [box.x + box.width * 0.5, y + 40], [box.x + box.width * 0.52, y - 200]);
    await page.waitForTimeout(700 * slow);
    const scrollAfter = await page.evaluate(() => scrollY);
    if (scrollAfter - scrollBefore < 40) fail(where, `vertical swipe over deck was trapped (${scrollBefore}→${scrollAfter})`);
    if ((await activeTitle(page)) !== t0) fail(where, "vertical swipe changed project");
  }

  // About.
  await page.locator('.header nav a[href="#about"]').click();
  await page.waitForTimeout(1600 * slow);
  const about = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const section = document.getElementById("about");
    const outside = [...section.querySelectorAll("h2 .title-word, p, li, .micro, a")]
      .filter((el) => !el.closest("[aria-hidden=true]") || el.classList.contains("title-word"))
      .map((el) => [el.textContent.trim().slice(0, 20), el.getBoundingClientRect()])
      .filter(([, r]) => r.width && (r.left < -1 || r.right > vw + 1))
      .map(([t, r]) => `${t}:${Math.round(r.left)}-${Math.round(r.right)}`);
    const copy = section.querySelector(".about-copy").getBoundingClientRect();
    const serif = section.querySelector(".title-line-serif .title-word");
    const range = document.createRange();
    range.selectNodeContents(serif);
    const s = range.getBoundingClientRect();
    const overlap = getComputedStyle(section.querySelector(".about-copy")).position === "absolute" && copy.right > s.left + 4 && copy.bottom > s.top;
    return { top: section.getBoundingClientRect().top, outside, overlap, current: document.querySelector(".header nav a[aria-current]")?.textContent };
  });
  if (Math.abs(about.top) > 2) fail(where, `About anchor at ${about.top}`);
  if (about.outside.length) fail(where, `About text outside viewport ${about.outside}`);
  if (about.overlap) fail(where, "About copy overlaps the serif title");
  if (about.current !== "About") fail(where, `aria-current after About nav: ${about.current}`);

  // Contact.
  await page.locator('.header nav a[href="#contact"]').click();
  await page.waitForTimeout(1600 * slow);
  const contact = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const section = document.getElementById("contact");
    const outside = [...section.querySelectorAll(".title-word, p, label, button, .micro")]
      .map((el) => [el.textContent.trim().slice(0, 20), el.getBoundingClientRect()])
      .filter(([, r]) => r.width && (r.left < -1 || r.right > vw + 1))
      .map(([t, r]) => `${t}:${Math.round(r.left)}-${Math.round(r.right)}`);
    const intro = section.querySelector(".contact-intro")?.getBoundingClientRect();
    const form = section.querySelector(".contact-form").getBoundingClientRect();
    const sideBySide = intro && form.left > intro.left + 10 && form.top < intro.bottom;
    const words = [...section.querySelectorAll(".contact-intro .title-word")].map((w) => w.getBoundingClientRect().right);
    return { top: section.getBoundingClientRect().top, outside, formWidth: form.width, collide: sideBySide && Math.max(...words) > form.left - 8 };
  });
  if (Math.abs(contact.top) > 2) fail(where, `Contact anchor at ${contact.top}`);
  if (contact.outside.length) fail(where, `Contact text outside viewport ${contact.outside}`);
  if (contact.formWidth < Math.min(280, width - 40)) fail(where, `form too narrow (${contact.formWidth})`);
  if (contact.collide) fail(where, "Contact headline collides with the form");

  // Form: validation, dropdown, success.
  await page.getByRole("button", { name: "SEND MESSAGE" }).click();
  if ((await page.locator(".field-error").count()) !== 4) fail(where, "validation errors not shown");
  await page.getByLabel("YOUR NAME", { exact: true }).fill("Browser QA");
  await page.getByLabel("EMAIL ADDRESS", { exact: true }).fill("qa@example.com");
  try {
    await page.getByRole("combobox").click({ timeout: 8000 });
  } catch (error) {
    // Diagnose what keeps the control moving, then continue with a forced click.
    const samples = [];
    for (let i = 0; i < 8; i++) {
      samples.push(await page.evaluate(() => {
        const r = document.getElementById("projectType").getBoundingClientRect();
        const field = document.getElementById("projectType").closest(".form-field");
        return `${Math.round(scrollY)}/${Math.round(r.top)}/${getComputedStyle(field).transform}/${document.activeElement?.id}/${visualViewport?.height}`;
      }));
      await page.waitForTimeout(120);
    }
    fail(where, `combobox unstable: ${samples.join(" ")}`);
    await page.getByRole("combobox").click({ force: true });
  }
  const menu = await page.evaluate(() => {
    const list = document.getElementById("project-type-options")?.getBoundingClientRect();
    return list && { t: list.top, b: list.bottom, l: list.left, r: list.right };
  });
  if (!menu) fail(where, "dropdown did not open");
  else if (menu.t < 0 || menu.b > height + 1 || menu.r > rest.vw + 1) fail(where, `dropdown outside viewport ${JSON.stringify(menu)}`);
  await page.getByRole("option", { name: "Brand identity" }).click();
  await page.getByLabel("A LITTLE ABOUT YOUR PROJECT", { exact: true }).fill("Testing the enquiry flow without sending anything.");
  await page.getByRole("button", { name: "SEND MESSAGE" }).click();
  await page.waitForTimeout(1000 * slow);
  const success = await page.evaluate(() => {
    const el = document.querySelector(".contact-success");
    if (!el) return null;
    const vw = document.documentElement.clientWidth;
    const outside = [...el.querySelectorAll(".title-word, p, a, button")]
      .map((e) => e.getBoundingClientRect())
      .filter((r) => r.left < -1 || r.right > vw + 1).length;
    return { outside, focused: document.activeElement === el, top: el.closest("section").getBoundingClientRect().top };
  });
  if (!success) {
    const state = await page.evaluate(() => ({
      errors: [...document.querySelectorAll(".field-error")].map((e) => e.id),
      type: document.getElementById("projectType")?.textContent,
      message: document.getElementById("message")?.value.length,
      name: document.getElementById("name")?.value,
      feedback: document.querySelector(".form-feedback")?.textContent,
      button: document.querySelector(".send-button")?.textContent,
    }));
    fail(where, `success state not shown ${JSON.stringify(state)}`);
  }
  else {
    if (success.outside) fail(where, `${success.outside} success elements outside viewport`);
    await page.getByRole("button", { name: /Send another message/ }).click();
    await page.waitForTimeout(300 * slow);
    if ((await page.evaluate(() => document.activeElement?.id)) !== "name") fail(where, "reset did not focus the name field");
  }

  // Back home through the footer.
  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(500 * slow);
  await page.locator(".footer a").first().click();
  await page.waitForTimeout(1800 * slow);
  if ((await page.evaluate(() => scrollY)) > 2) fail(where, "footer home link did not return to the top");
  const overflowEnd = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  if (overflowEnd > 0) fail(where, "overflow after interaction");

  for (const e of errors) fail(where, e);
  await context.close();
}

(async () => {
  const browser = await launch();
  for (const viewport of viewports) {
    try {
      await checkViewport(browser, viewport);
    } catch (error) {
      const lines = error.message.split("\n").slice(0, process.env.VERBOSE ? 14 : 1);
      fail(`${engine} ${viewport.join("x")}`, `threw ${lines.join(" | ")}`);
    }
  }
  await browser.close();
  fs.mkdirSync(".qa", { recursive: true });
  fs.writeFileSync(`.qa/qa-${engine}.json`, JSON.stringify(failures, null, 2));
  console.log(failures.length ? `\n${failures.length} failure(s)` : "\nall checks passed");
  process.exit(failures.length ? 1 : 0);
})();
