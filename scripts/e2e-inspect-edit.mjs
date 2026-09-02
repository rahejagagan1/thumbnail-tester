// End-to-end check of editing a test card's title and channel from the inspect
// panel: the edit reaches the feed, the exportable card and the editor panel,
// it lands on the right title variant in multiple-titles mode, and a shared
// link stays read-only.
//
// Requires `npm run dev` (or `npm start`), which listens on :3011.
// Point BASE_URL elsewhere to run against another origin.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const BASE = process.env.BASE_URL ?? 'http://localhost:3011';
const OUT = path.join(os.tmpdir(), 'thumbnail-tester-e2e-inspect');
fs.mkdirSync(OUT, { recursive: true });

const results = [];
const check = (name, pass, detail = '') => {
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
};

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1500, height: 950 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

  await page.goto(`${BASE}/app`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);

  // ---------- 1. a thumbnail, so the test card stops being a placeholder ----------
  const pngBase64 = await page.evaluate(async () => {
    const c = document.createElement('canvas');
    c.width = 1280; c.height = 720;
    const x = c.getContext('2d');
    x.fillStyle = '#1d4ed8'; x.fillRect(0, 0, 1280, 720);
    x.fillStyle = '#fff'; x.font = 'bold 170px Arial'; x.textAlign = 'center';
    x.fillText('INSPECT', 640, 420);
    return c.toDataURL('image/png').split(',')[1];
  });
  const pngPath = path.join(OUT, 'upload.png');
  fs.writeFileSync(pngPath, Buffer.from(pngBase64, 'base64'));
  await page.locator('input[type=file]').first().setInputFiles(pngPath);
  await page.waitForTimeout(700);

  const openInspect = async () => {
    await page.locator('.yt-card[data-test=true]').first().click();
    await page.locator('.inspect-panel').waitFor({ state: 'visible' });
    await page.waitForTimeout(250);
  };
  const closeInspect = async () => {
    await page.locator('.inspect-close').click();
    await page.locator('.inspect-panel').waitFor({ state: 'hidden' });
    await page.waitForTimeout(200);
  };

  // ---------- 2. the edit affordances are there ----------
  await openInspect();
  check('inspect opens on the test card', await page.locator('.inspect-panel').isVisible());
  check('title has an edit button',
    await page.getByRole('button', { name: 'Edit title' }).isVisible());
  check('channel has an edit button',
    await page.getByRole('button', { name: 'Edit channel name' }).isVisible());
  await page.screenshot({ path: path.join(OUT, '01-inspect-affordances.png') });

  // ---------- 3. retitle from the panel ----------
  const TITLE = 'Retitled from the inspect panel';
  await page.getByRole('button', { name: 'Edit title' }).click();
  const titleField = page.getByRole('textbox', { name: 'Edit title' });
  check('title field opens focused', await titleField.evaluate(el => el === document.activeElement));
  await titleField.fill(TITLE);
  await page.waitForTimeout(200);
  check('exportable card follows the typing',
    (await page.locator('.inspect-panel .yt-card-title').innerText()).includes(TITLE));
  await titleField.press('Enter');
  await page.waitForTimeout(200);
  check('Enter closes the field', await titleField.count() === 0);
  check('panel heading shows the new title',
    (await page.locator('.inspect-right').innerText()).includes(TITLE));
  await page.screenshot({ path: path.join(OUT, '02-title-edited.png') });

  // ---------- 4. edit the channel ----------
  const CHANNEL = 'Panel Edited Channel';
  await page.getByRole('button', { name: 'Edit channel name' }).click();
  const channelField = page.getByRole('textbox', { name: 'Edit channel name' });
  await channelField.fill(CHANNEL);
  await channelField.press('Enter');
  await page.waitForTimeout(200);
  check('exportable card shows the new channel',
    (await page.locator('.inspect-panel .yt-card-channel').innerText()).includes(CHANNEL));
  await page.screenshot({ path: path.join(OUT, '03-channel-edited.png') });
  await closeInspect();

  // ---------- 5. both reached the feed and the editor ----------
  const feedCard = page.locator('.yt-card[data-test=true]').first();
  check('feed card retitled',
    (await feedCard.locator('.yt-card-title').innerText()).includes(TITLE));
  check('feed card channel changed',
    (await feedCard.locator('.yt-card-channel').innerText()).includes(CHANNEL));
  check('editor title box agrees',
    (await page.locator('textarea').first().inputValue()) === TITLE);
  const inputValues = await page.locator('.tool-editor input').evaluateAll(els => els.map(e => e.value));
  check('editor channel box agrees', inputValues.includes(CHANNEL),
    JSON.stringify(inputValues.slice(0, 6)));
  await page.screenshot({ path: path.join(OUT, '04-feed-updated.png') });

  // ---------- 6. multiple-titles mode edits the drawn variant ----------
  // The mode segs are matched by class: a Field wraps its control in a <label>,
  // which hands the field's own label to the first button as its accessible
  // name, so "Single" is not findable by role here.
  const titleMode = (label) => page.locator('.seg-btn', { hasText: label }).nth(1);
  await titleMode('Multiple').click();
  await page.waitForTimeout(300);
  await page.getByRole('button', { name: 'Add title' }).click();
  await page.waitForTimeout(200);
  const variantInputs = page.getByPlaceholder('Title variant');
  await variantInputs.first().fill('Variant one');
  await page.waitForTimeout(400);

  const drawn = (await page.locator('.yt-card[data-test=true] .yt-card-title').first().innerText()).trim();
  await openInspect();
  const VARIANT = 'Variant edited from the panel';
  await page.getByRole('button', { name: 'Edit title' }).click();
  await page.getByRole('textbox', { name: 'Edit title' }).fill(VARIANT);
  await page.getByRole('textbox', { name: 'Edit title' }).press('Enter');
  await page.waitForTimeout(300);
  await closeInspect();

  const variantValues = await variantInputs.evaluateAll(els => els.map(e => e.value));
  check('the edit landed on a title variant', variantValues.includes(VARIANT),
    `drawn="${drawn}" variants=${JSON.stringify(variantValues)}`);
  check('the feed shows the edited variant',
    (await page.locator('.yt-card[data-test=true] .yt-card-title').first().innerText()).includes(VARIANT));
  await page.screenshot({ path: path.join(OUT, '05-variant-edited.png') });

  // Back to a single title, so the shared link below is the simple case.
  await titleMode('Single').click();
  await page.waitForTimeout(300);
  check('the single title survived the variant edit',
    (await page.locator('textarea').first().inputValue()) === TITLE);

  // ---------- 7. a shared link is read-only ----------
  await page.locator('button[title="Create a link to this test"]').click();
  await page.waitForTimeout(400);
  await page.getByRole('button', { name: 'Create link' }).click();
  await page.waitForTimeout(2500);
  const link = await page.locator('.tmenu input[readonly]').inputValue();
  const viewer = await ctx.newPage();
  await viewer.goto(link, { waitUntil: 'networkidle' });
  await viewer.waitForTimeout(1500);
  await viewer.locator('.yt-card[data-test=true]').first().click();
  await viewer.locator('.inspect-panel').waitFor({ state: 'visible' });
  check('shared inspect has no title editor',
    await viewer.getByRole('button', { name: 'Edit title' }).count() === 0);
  check('shared inspect has no channel editor',
    await viewer.getByRole('button', { name: 'Edit channel name' }).count() === 0);
  await viewer.screenshot({ path: path.join(OUT, '06-shared-readonly.png') });

  check('no page errors', errors.length === 0, errors.slice(0, 3).join(' | '));

  await browser.close();
  const failed = results.filter(r => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} passed. Screenshots in ${OUT}`);
  process.exit(failed.length ? 1 : 0);
})();
