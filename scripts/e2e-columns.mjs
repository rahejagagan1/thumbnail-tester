// Pins the desktop feed's column count to YouTube's own rich-grid metrics
// (326.8px minimum card + 16px margin), on both the tester and a shared link,
// with the left guide expanded and collapsed.
//
// The numbers below were taken from a live YouTube desktop feed; if this file
// starts failing, check whether YouTube moved before changing the expectations.
//
// Requires `npm run dev` (or `npm start`), which listens on :3011.
import { chromium } from 'playwright';

const BASE = process.env.BASE_URL ?? 'http://localhost:3011';

const results = [];
const check = (name, pass, detail = '') => {
  results.push({ name, pass });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
};

/** What the grid is actually showing, measured the way the app measures it. */
const probe = () => {
  const grid = document.querySelector('.yt-grid');
  if (!grid) return null;
  const cs = getComputedStyle(grid);
  const pad =
    (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0);
  const cards = Array.from(grid.children);
  const top = cards.length ? cards[0].getBoundingClientRect().top : 0;
  const guide = document.querySelector('.yt-guide');
  const mini = document.querySelector('.yt-mini-guide');
  return {
    railWidth: Math.round(
      (guide ?? mini)?.getBoundingClientRect().width ?? 0,
    ),
    railExpanded: Boolean(guide),
    contentWidth: Math.round(grid.clientWidth - pad),
    inFirstRow: cards.filter(
      (c) => Math.abs(c.getBoundingClientRect().top - top) < 4,
    ).length,
  };
};

/** The rule the app implements, restated here so the harness is independent. */
const expected = (w) => Math.max(1, Math.min(4, Math.floor((w + 16) / 342.8)));

(async () => {
  const browser = await chromium.launch();
  const errors = [];

  const page = await browser.newPage({ viewport: { width: 1526, height: 900 } });
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

  // ---------- tester ----------
  await page.goto(`${BASE}/app`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1800);
  await page.locator('textarea').first().fill('Column rule 5521');
  await page.waitForTimeout(2400);

  const withEditor = await page.evaluate(probe);
  check('tester: mini rail is 72px', withEditor.railWidth === 72 && !withEditor.railExpanded,
    `${withEditor.railWidth}px`);
  check('tester: columns follow the rule',
    withEditor.inFirstRow === expected(withEditor.contentWidth),
    `${withEditor.contentWidth}px -> ${withEditor.inFirstRow}`);

  // ---------- shared link ----------
  await page.locator('button[title="Create a link to this test"]').click();
  await page.waitForTimeout(400);
  await page.getByRole('button', { name: 'Create link' }).click();
  await page.waitForTimeout(2500);
  const link = await page.locator('.tmenu input[readonly]').inputValue();
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  const guest = await browser.newPage({ viewport: { width: 1526, height: 900 } });
  guest.on('pageerror', e => errors.push('guest: ' + e));
  guest.on('console', m => { if (m.type() === 'error') errors.push('guest: ' + m.text()); });
  await guest.goto(link, { waitUntil: 'networkidle' });
  await guest.waitForTimeout(2200);

  const shared = await guest.evaluate(probe);
  check('shared: guide is expanded at 240px',
    shared.railExpanded && shared.railWidth === 240, `${shared.railWidth}px`);
  check('shared: the guide takes width off the grid',
    shared.contentWidth < 1526 - 240, `${shared.contentWidth}px`);
  check('shared: 3 cards with the guide open', shared.inFirstRow === 3,
    `${shared.contentWidth}px -> ${shared.inFirstRow}`);
  check('shared: columns follow the rule',
    shared.inFirstRow === expected(shared.contentWidth));

  // ---------- the masthead menu button collapses the guide ----------
  await guest.locator('button[title="Collapse the guide"]').click();
  await guest.waitForTimeout(900);
  const collapsed = await guest.evaluate(probe);
  check('collapsing leaves the 72px mini rail',
    !collapsed.railExpanded && collapsed.railWidth === 72, `${collapsed.railWidth}px`);
  check('collapsing hands the 168px back to the grid',
    collapsed.contentWidth === shared.contentWidth + 168,
    `${shared.contentWidth} -> ${collapsed.contentWidth}`);
  check('4 cards with the guide hidden', collapsed.inFirstRow === 4,
    `${collapsed.contentWidth}px -> ${collapsed.inFirstRow}`);
  check('hiding the guide buys exactly one column',
    collapsed.inFirstRow === shared.inFirstRow + 1,
    `${shared.inFirstRow} -> ${collapsed.inFirstRow}`);

  await guest.locator('button[title="Expand the guide"]').click();
  await guest.waitForTimeout(900);
  const reopened = await guest.evaluate(probe);
  check('reopening the guide goes back to 3', reopened.inFirstRow === 3,
    `${reopened.contentWidth}px -> ${reopened.inFirstRow}`);

  // ---------- the rule holds as the window changes ----------
  for (const w of [1100, 1280, 1526, 1728, 1920, 2400]) {
    await guest.setViewportSize({ width: w, height: 900 });
    await guest.waitForTimeout(800);
    const r = await guest.evaluate(probe);
    check(`shared @${w}: ${r.inFirstRow} cards across ${r.contentWidth}px`,
      r.inFirstRow === expected(r.contentWidth));
  }

  // ---------- a pinned column count overrides everything, visibly ----------
  // This is the one way to get a count that does not match YouTube, so it has
  // to announce itself rather than looking like a layout bug.
  await page.setViewportSize({ width: 1596, height: 900 });
  await page.waitForTimeout(700);
  const autoAt1596 = await page.evaluate(probe);

  const colFour = page.locator('.seg-btn').filter({ hasText: /^4$/ }).first();
  await colFour.click();
  await page.waitForTimeout(800);
  const pinned = await page.evaluate(probe);
  check('pinning Columns to 4 overrides the width', pinned.inFirstRow === 4,
    `${pinned.contentWidth}px -> ${pinned.inFirstRow}`);
  check('pinning says so in the panel',
    (await page.locator('text=The feed is locked to').count()) === 1);
  check('the hint reads "pinned"',
    (await page.locator('text=pinned').count()) >= 1);

  const colAuto = page.locator('.seg-btn').filter({ hasText: /^Auto$/ }).first();
  await colAuto.click();
  await page.waitForTimeout(800);
  const backToAuto = await page.evaluate(probe);
  check('Auto restores the responsive count',
    backToAuto.inFirstRow === autoAt1596.inFirstRow &&
      backToAuto.inFirstRow === expected(backToAuto.contentWidth),
    `${backToAuto.contentWidth}px -> ${backToAuto.inFirstRow}`);
  check('the warning goes away with Auto',
    (await page.locator('text=The feed is locked to').count()) === 0);

  // ---------- Auto shows its working ----------
  // A count that will not move on a maximized window reads as broken, so Auto
  // states the width it measured and the number that falls out of it.
  const readout = async () => {
    const text = await page.locator('label', { hasText: 'Columns' }).first().innerText();
    const m = /(\d+)px\s*→\s*(\d+)/.exec(text);
    return m ? { width: Number(m[1]), cols: Number(m[2]) } : null;
  };
  const shown = await readout();
  check('Auto shows the width it measured', shown !== null, JSON.stringify(shown));
  check('the readout matches the grid',
    shown && shown.width === backToAuto.contentWidth && shown.cols === backToAuto.inFirstRow,
    `panel=${JSON.stringify(shown)} grid=${backToAuto.contentWidth}px -> ${backToAuto.inFirstRow}`);

  await page.setViewportSize({ width: 1920, height: 900 });
  await page.waitForTimeout(800);
  const widened = await readout();
  const widenedGrid = await page.evaluate(probe);
  check('the readout follows a resize',
    widened && widened.width === widenedGrid.contentWidth && widened.cols === widenedGrid.inFirstRow,
    `panel=${JSON.stringify(widened)} grid=${widenedGrid.contentWidth}px -> ${widenedGrid.inFirstRow}`);

  // ---------- four is the ceiling ----------
  // Wide enough for six by YouTube's own maths; the cap has to hold anyway,
  // and the pinned options must not offer a fifth.
  await page.setViewportSize({ width: 2560, height: 900 });
  await page.waitForTimeout(900);
  const widest = await page.evaluate(probe);
  check('never more than 4 cards, however wide', widest.inFirstRow === 4,
    `${widest.contentWidth}px -> ${widest.inFirstRow}`);
  const segLabels = await page.locator('label', { hasText: 'Columns' }).first()
    .locator('.seg-btn').allInnerTexts();
  check('the Columns options stop at 4',
    JSON.stringify(segLabels.map(t => t.trim())) === '["Auto","3","4"]',
    JSON.stringify(segLabels));

  const real = errors.filter(e => !/favicon|DevTools|404/i.test(e));
  check('no console/page errors', real.length === 0, real.slice(0, 2).join(' | '));

  await browser.close();
  const failed = results.filter(r => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
