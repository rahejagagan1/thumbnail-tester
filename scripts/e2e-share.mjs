// End-to-end check of sharing: publish a test, open it as a stranger, save a
// copy, update the link in place, revoke it — plus the abuse cases on the API.
//
// Requires `npm run dev` (or `npm start`) on :3000.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const BASE = 'http://localhost:3000';
const OUT = path.join(os.tmpdir(), 'thumbnail-tester-e2e-share');
fs.mkdirSync(OUT, { recursive: true });

const results = [];
const check = (name, pass, detail = '') => {
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
};

const TITLE = 'Shared test title 8891';
const EDITED = 'Edited after sharing 8891';

async function makePng(page, label) {
  const b64 = await page.evaluate((text) => {
    const c = document.createElement('canvas');
    c.width = 1280; c.height = 720;
    const x = c.getContext('2d');
    x.fillStyle = '#1d4ed8'; x.fillRect(0, 0, 1280, 720);
    x.fillStyle = '#fff'; x.font = 'bold 150px Arial'; x.textAlign = 'center';
    x.fillText(text, 640, 420);
    return c.toDataURL('image/png').split(',')[1];
  }, label);
  const file = path.join(OUT, 'share-upload.png');
  fs.writeFileSync(file, Buffer.from(b64, 'base64'));
  return file;
}

(async () => {
  const browser = await chromium.launch();

  // The author and the recipient are separate contexts: separate IndexedDB,
  // separate everything. That is the whole point of the feature.
  const authorCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const author = await authorCtx.newPage();
  const errors = [];
  author.on('pageerror', e => errors.push('author: ' + e));
  author.on('console', m => { if (m.type() === 'error') errors.push('author: ' + m.text()); });

  // ---------- 1. author builds a test ----------
  await author.goto(`${BASE}/app`, { waitUntil: 'networkidle' });
  await author.waitForTimeout(1200);
  await author.locator('input[type=file]').first().setInputFiles(await makePng(author, 'SHARED'));
  await author.locator('textarea').first().fill(TITLE);
  await author.waitForTimeout(2500);
  check('author test saved', (await author.locator('[data-save-state]').innerText()).trim() === 'Saved');
  check('url carries the task id', /\?task=/.test(author.url()), author.url());

  // ---------- 2. publish ----------
  // Selected by title: the rename button next to it carries the test's name,
  // which happens to contain the word "Share".
  const shareBtn = author.locator('button[title="Create a link to this test"]');
  check('share button enabled once saved', await shareBtn.isEnabled());
  await shareBtn.click();
  await author.waitForTimeout(400);
  await author.getByRole('button', { name: 'Create link' }).click();
  await author.waitForTimeout(2500);

  const link = await author.locator('.tmenu input[readonly]').inputValue();
  check('link looks right', /^http:\/\/localhost:3000\/s\/[a-z0-9]{12}$/.test(link), link);
  await author.screenshot({ path: path.join(OUT, '01-share-created.png') });
  await author.keyboard.press('Escape');
  await author.waitForTimeout(300);

  // ---------- 3. a stranger opens it ----------
  const guestCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const guest = await guestCtx.newPage();
  guest.on('pageerror', e => errors.push('guest: ' + e));
  guest.on('console', m => { if (m.type() === 'error') errors.push('guest: ' + m.text()); });

  await guest.goto(link, { waitUntil: 'networkidle' });
  await guest.waitForTimeout(2000);
  check('shared page renders', await guest.locator('.tool-root').isVisible());
  check('marked read-only', await guest.getByText('Shared · read-only').isVisible());
  check('no editor panel', (await guest.locator('.tool-editor').count()) === 0);

  const guestTitle = await guest.locator('.yt-card[data-test=true] .yt-card-title').innerText();
  check('shared title visible to guest', guestTitle.includes(TITLE), guestTitle);

  const thumb = guest.locator('.yt-card[data-test=true] img').first();
  const thumbSrc = await thumb.getAttribute('src');
  check('thumbnail served from the share', /^\/api\/share\/[a-z0-9]{12}\/asset\//.test(thumbSrc ?? ''), thumbSrc ?? '');
  check('thumbnail actually decoded',
    await thumb.evaluate(el => el.complete && el.naturalWidth > 100));
  await guest.screenshot({ path: path.join(OUT, '02-guest-view.png') });

  // The guest can change how they look at it, but not what it is.
  await guest.locator('.tseg-btn', { hasText: 'Mobile' }).click();
  await guest.waitForTimeout(1200);
  check('guest can switch surface', (await guest.locator('.ytm-card').count()) > 0,
    `${await guest.locator('.ytm-card').count()} mobile cards`);
  await guest.locator('.tseg-btn', { hasText: 'Desktop' }).click();
  await guest.waitForTimeout(800);

  // ---------- 4. guest saves a copy ----------
  await guest.getByRole('button', { name: 'Save a copy' }).click();
  await guest.waitForURL('**/app?task=*', { timeout: 15000 });
  await guest.waitForTimeout(2200);
  const copiedTitle = await guest.locator('textarea').first().inputValue();
  check('copy opens in the guest tester', copiedTitle === TITLE, copiedTitle);

  await guest.goto(BASE, { waitUntil: 'networkidle' });
  await guest.waitForTimeout(1000);
  check('copy lands in the guest library', (await guest.locator('.tool-card').count()) === 1,
    `${await guest.locator('.tool-card').count()} cards`);
  const copyCover = await guest.locator('.tool-card img').first().getAttribute('src');
  check('copied image is local, not remote', (copyCover ?? '').startsWith('blob:'), copyCover?.slice(0, 24));

  // ---------- 5. author edits, then refreshes the same link ----------
  await author.locator('textarea').first().fill(EDITED);
  await author.waitForTimeout(2500);
  await author.locator('button[title="Manage the share link"]').click();
  await author.waitForTimeout(700);
  check('staleness surfaced', await author.getByText('Edited since you shared').isVisible());
  await author.getByRole('button', { name: 'Update link' }).click();
  await author.waitForTimeout(2500);
  check('staleness clears after update',
    (await author.getByText('Edited since you shared').count()) === 0);
  await author.keyboard.press('Escape');
  await author.waitForTimeout(300);
  check('escape closes the panel', (await author.locator('.tmenu').count()) === 0);

  await guest.goto(link, { waitUntil: 'networkidle' });
  await guest.waitForTimeout(1800);
  const updated = await guest.locator('.yt-card[data-test=true] .yt-card-title').innerText();
  check('same link now shows the edit', updated.includes(EDITED), updated);

  // ---------- 6. API abuse ----------
  const id = link.split('/').pop();
  const status = async (u, init) => (await fetch(u, init)).status;
  check('unknown share 404s', await status(`${BASE}/api/share/zzzzzzzzzzzz`) === 404);
  check('malformed id 404s', await status(`${BASE}/api/share/nope`) === 404);
  check('owner secret is not an asset', await status(`${BASE}/api/share/${id}/asset/owner.json`) === 404);
  check('traversal in asset id 404s',
    await status(`${BASE}/api/share/${id}/asset/..%2F..%2Fowner.json`) === 404);
  check('delete without a secret is 401',
    await status(`${BASE}/api/share/${id}`, { method: 'DELETE' }) === 401);
  check('delete with a wrong secret is 403',
    await status(`${BASE}/api/share/${id}`, {
      method: 'DELETE', headers: { 'x-share-secret': 'not-the-secret' },
    }) === 403);
  check('update with a wrong secret is rejected',
    [401, 403].includes(await status(`${BASE}/api/share/${id}`, {
      method: 'PUT', headers: { 'x-share-secret': 'not-the-secret' },
      body: new FormData(),
    })));
  check('share still readable after failed attacks', await status(`${BASE}/api/share/${id}`) === 200);

  // ---------- 7. revoke ----------
  await author.locator('button[title="Manage the share link"]').click();
  await author.waitForTimeout(600);
  await author.getByRole('button', { name: 'Revoke link' }).click();
  await author.waitForTimeout(2000);
  check('share is gone from the server', await status(`${BASE}/api/share/${id}`) === 404);

  await guest.goto(link, { waitUntil: 'networkidle' });
  await guest.waitForTimeout(900);
  check('revoked link explains itself',
    await guest.getByText('This link is no longer available').isVisible());
  await guest.screenshot({ path: path.join(OUT, '03-revoked.png') });

  check('guest copy survives revocation', await (async () => {
    await guest.goto(BASE, { waitUntil: 'networkidle' });
    await guest.waitForTimeout(900);
    return (await guest.locator('.tool-card').count()) === 1;
  })());

  // ---------- 8. console cleanliness ----------
  const real = errors.filter(e => !/favicon|Download the React DevTools|404 \(Not Found\)/i.test(e));
  check('no console/page errors', real.length === 0, real.slice(0, 2).join(' | '));

  await browser.close();

  const failed = results.filter(r => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
