// End-to-end check of the review stages on a saved test: the chip on a library
// card, moving a test through the stages, that the stage survives a reload and
// a later edit, that a duplicate carries it, and the stage filter above the
// grid.
//
// Requires `npm run dev` (or `npm start`), which listens on :3011.
// Point BASE_URL elsewhere to run against another origin.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const BASE = process.env.BASE_URL ?? 'http://localhost:3011';
const OUT = path.join(os.tmpdir(), 'thumbnail-tester-e2e-status');
fs.mkdirSync(OUT, { recursive: true });

const results = [];
const check = (name, pass, detail = '') => {
  results.push({ name, pass });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
};

/** Builds a test in the tester and comes back to the library. */
async function makeTest(page, label) {
  await page.goto(`${BASE}/app`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  const b64 = await page.evaluate(async (text) => {
    const c = document.createElement('canvas');
    c.width = 1280; c.height = 720;
    const x = c.getContext('2d');
    x.fillStyle = '#334155'; x.fillRect(0, 0, 1280, 720);
    x.fillStyle = '#fff'; x.font = 'bold 150px Arial'; x.textAlign = 'center';
    x.fillText(text, 640, 420);
    return c.toDataURL('image/png').split(',')[1];
  }, label);
  const p = path.join(OUT, `${label}.png`);
  fs.writeFileSync(p, Buffer.from(b64, 'base64'));
  await page.locator('input[type=file]').first().setInputFiles(p);
  await page.locator('textarea').first().fill(`Status test ${label}`);
  await page.waitForTimeout(2500); // autosave debounce + write
}

/** The status chip on the nth library card. */
const chip = (page, n = 0) =>
  page.locator('.tool-card').nth(n).getByRole('button', { name: /^Stage:/ });

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

  // ---------- 1. a new test starts as a first draft ----------
  await makeTest(page, 'A');
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  check('a new test is a first draft',
    (await chip(page).innerText()).includes('First draft'),
    await chip(page).innerText());
  await page.screenshot({ path: path.join(OUT, '01-draft.png') });

  // ---------- 2. move it through the stages ----------
  const stages = ['For approval', 'Changes needed', 'Final approval', 'Completed'];
  for (const stage of stages) {
    await chip(page).click();
    await page.getByRole('menuitemradio', { name: new RegExp(stage) }).click();
    await page.waitForTimeout(500);
    check(`moved to ${stage}`, (await chip(page).innerText()).includes(stage),
      await chip(page).innerText());
  }
  await page.screenshot({ path: path.join(OUT, '02-completed.png') });

  // ---------- 3. it survives a reload ----------
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(900);
  check('the stage survives a reload',
    (await chip(page).innerText()).includes('Completed'));

  // ---------- 4. editing the test does not un-approve it ----------
  // The autosave writes the whole record; the stage has to come through it.
  await page.locator('.tool-card a').first().click();
  await page.waitForURL('**/app?task=*');
  await page.waitForTimeout(1200);
  await page.locator('textarea').first().fill('Edited after approval');
  await page.waitForTimeout(2600);
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(900);
  check('editing keeps the stage', (await chip(page).innerText()).includes('Completed'),
    await chip(page).innerText());

  // ---------- 5. ordering is not disturbed by a stage change ----------
  // The library is ordered by last edit, newest first, so the second test is
  // now on top and the approved one sits behind it. Restaging the older test
  // must not pull it forward — ticking something off is not an edit.
  await makeTest(page, 'B');
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(900);
  const setStage = async (n, stage) => {
    await chip(page, n).click();
    await page.getByRole('menuitemradio', { name: new RegExp(stage) }).click();
    await page.waitForTimeout(600);
  };
  const firstBefore = (await page.locator('.tool-card').first().innerText()).split('\n')[0];
  await setStage(1, 'Final approval');
  const firstAfter = (await page.locator('.tool-card').first().innerText()).split('\n')[0];
  check('a stage change does not reorder the library', firstBefore === firstAfter,
    `${firstBefore} vs ${firstAfter}`);
  check('the older test really did move stage',
    (await chip(page, 1).innerText()).includes('Final approval'));

  // One test per stage, so the filter below has something to separate.
  await setStage(1, 'Completed');
  await setStage(0, 'For approval');

  // ---------- 6. the filter ----------
  const cards = () => page.locator('.tool-card').count();
  check('two tests are listed', (await cards()) === 2, String(await cards()));
  await page.getByRole('button', { name: /^Completed 1$/ }).click();
  await page.waitForTimeout(400);
  check('filtering to Completed shows one', (await cards()) === 1, String(await cards()));
  check('and it is the completed one',
    (await chip(page).innerText()).includes('Completed'));
  await page.getByRole('button', { name: /^For approval 1$/ }).click();
  await page.waitForTimeout(400);
  check('filtering to For approval shows the other',
    (await cards()) === 1 && (await chip(page).innerText()).includes('For approval'));
  await page.getByRole('button', { name: /^All 2$/ }).click();
  await page.waitForTimeout(400);
  check('All brings both back', (await cards()) === 2, String(await cards()));
  await page.screenshot({ path: path.join(OUT, '03-filter.png') });

  // ---------- 7. a duplicate carries the stage ----------
  await page.locator('.tool-card').first().getByRole('button', { name: /^Duplicate/ }).click();
  await page.waitForTimeout(900);
  check('duplicating keeps the stage',
    (await chip(page).innerText()) === (await chip(page, 1).innerText()),
    `${await chip(page).innerText()} / ${await chip(page, 1).innerText()}`);

  // ---------- 8. the same chip in the tester's toolbar ----------
  // The stage belongs to the saved record, so the toolbar reads it from the
  // database rather than the feed store, and writes back to the same place.
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(900);
  await page.locator('.tool-card a').first().click();
  await page.waitForURL('**/app?task=*');
  await page.waitForTimeout(1500);
  const bar = page.locator('.tool-by').getByRole('button', { name: /^Stage:/ });
  check('the toolbar shows the stage', (await bar.innerText()).includes('For approval'),
    await bar.innerText());
  await bar.click();
  await page.getByRole('menuitemradio', { name: /Changes needed/ }).click();
  await page.waitForTimeout(600);
  check('restaging from the toolbar sticks', (await bar.innerText()).includes('Changes needed'),
    await bar.innerText());
  await page.screenshot({ path: path.join(OUT, '04-toolbar.png') });

  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(900);
  check('the library agrees with the toolbar',
    (await chip(page).innerText()).includes('Changes needed'),
    await chip(page).innerText());

  // A test with no saved record yet has nothing to write a stage to.
  await page.goto(`${BASE}/app`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1400);
  check('no chip on an unsaved test',
    (await page.locator('.tool-by').getByRole('button', { name: /^Stage:/ }).count()) === 0);

  check('no page errors', errors.length === 0, errors.slice(0, 3).join(' | '));

  await browser.close();
  const failed = results.filter(r => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} passed. Screenshots in ${OUT}`);
  process.exit(failed.length ? 1 : 0);
})();
