// End-to-end check of card reactions: the Like and Comment options on a
// thumbnail's "3 dots" menu, and the round trip through a share — the author
// reacts, a stranger opens the link and reacts, and each sees the other's.
//
// Requires `npm run dev` (or `npm start`), which listens on :3011.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const BASE = process.env.BASE_URL ?? 'http://localhost:3011';
const OUT = path.join(os.tmpdir(), 'thumbnail-tester-e2e-feedback');
fs.mkdirSync(OUT, { recursive: true });

const results = [];
const check = (name, pass, detail = '') => {
  results.push({ name, pass });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
};

const TITLE = 'Feedback test 4417';

async function makePng(page, label, colour) {
  const b64 = await page.evaluate(([text, c]) => {
    const cv = document.createElement('canvas');
    cv.width = 1280; cv.height = 720;
    const x = cv.getContext('2d');
    x.fillStyle = c; x.fillRect(0, 0, 1280, 720);
    x.fillStyle = '#fff'; x.font = 'bold 320px Arial'; x.textAlign = 'center';
    x.fillText(text, 640, 500);
    return cv.toDataURL('image/png').split(',')[1];
  }, [label, colour]);
  const f = path.join(OUT, `fb-${label}.png`);
  fs.writeFileSync(f, Buffer.from(b64, 'base64'));
  return f;
}

/** Opens the kebab menu on the nth test card. */
async function openMenu(page, n = 0) {
  await page.locator('.yt-card[data-test="true"] .yt-card-menu').nth(n).click();
  await page.waitForTimeout(350);
}

(async () => {
  const browser = await chromium.launch();
  const errors = [];

  const authorCtx = await browser.newContext({ viewport: { width: 1600, height: 950 } });
  const author = await authorCtx.newPage();
  author.on('pageerror', e => errors.push('author: ' + e));
  author.on('console', m => { if (m.type() === 'error') errors.push('author: ' + m.text()); });

  // ---------- 1. a test with two variants ----------
  await author.goto(`${BASE}/app`, { waitUntil: 'networkidle' });
  await author.waitForTimeout(1500);
  await author.locator('button', { hasText: 'Multiple' }).first().click();
  await author.waitForTimeout(300);
  await author.locator('input[type=file]').first().setInputFiles([
    await makePng(author, 'A', '#c0392b'),
    await makePng(author, 'B', '#27ae60'),
  ]);
  await author.waitForTimeout(2000);
  await author.locator('textarea').first().fill(TITLE);
  await author.waitForTimeout(2200);

  check('two variants in the feed',
    (await author.locator('.yt-card[data-test="true"]').count()) === 2);

  // ---------- 2. the kebab now offers Like and Comment ----------
  await openMenu(author, 0);
  check('menu offers Like', await author.getByRole('button', { name: 'Like' }).isVisible());
  check('menu offers Comment', await author.getByRole('button', { name: 'Comment' }).isVisible());

  await author.getByRole('button', { name: 'Like' }).click();
  await author.waitForTimeout(300);
  check('like registers as Liked',
    await author.getByRole('button', { name: 'Liked' }).isVisible());

  await author.getByRole('button', { name: 'Comment' }).click();
  await author.waitForTimeout(300);
  await author.locator('.yt-card-popover textarea').fill('Text is too small on this one');
  await author.getByRole('button', { name: 'Post' }).click();
  await author.waitForTimeout(400);
  check('comment shows in the thread',
    (await author.locator('.yt-card-popover', { hasText: 'Text is too small' }).count()) === 1);
  check('comment is signed by the author',
    (await author.locator('.yt-card-popover', { hasText: 'You' }).count()) === 1);
  await author.screenshot({ path: path.join(OUT, '01-author-menu.png') });

  await author.keyboard.press('Escape');
  await author.waitForTimeout(400);
  check('card shows a like and comment count',
    (await author.locator('.yt-card[data-test="true"] .yt-feedback-badge').count()) >= 1);

  // Reactions survive a reload, so they are really saved with the test.
  await author.reload({ waitUntil: 'networkidle' });
  await author.waitForTimeout(2200);
  check('reactions survive a reload',
    (await author.locator('.yt-card[data-test="true"] .yt-feedback-badge').count()) >= 1);

  // ---------- 3. publish ----------
  await author.locator('button[title="Create a link to this test"]').click();
  await author.waitForTimeout(400);
  await author.getByRole('button', { name: 'Create link' }).click();
  await author.waitForTimeout(2500);
  const link = await author.locator('.tmenu input[readonly]').inputValue();
  check('link created', /\/s\/[a-z0-9]{12}$/.test(link), link);
  await author.keyboard.press('Escape');
  await author.waitForTimeout(400);

  // ---------- 4. a stranger reviews it ----------
  const guestCtx = await browser.newContext({ viewport: { width: 1600, height: 950 } });
  const guest = await guestCtx.newPage();
  guest.on('pageerror', e => errors.push('guest: ' + e));
  guest.on('console', m => { if (m.type() === 'error') errors.push('guest: ' + m.text()); });

  await guest.goto(link, { waitUntil: 'networkidle' });
  await guest.waitForTimeout(2200);

  check('guest sees the author\'s reactions',
    (await guest.locator('.yt-card[data-test="true"] .yt-feedback-badge').count()) >= 1);

  await guest.locator('input[placeholder="Your name"]').fill('Priya');
  await guest.waitForTimeout(300);

  // The guest likes the *other* variant and leaves a note on it.
  await openMenu(guest, 1);
  await guest.getByRole('button', { name: 'Like' }).click();
  await guest.waitForTimeout(300);
  await guest.getByRole('button', { name: 'Comment' }).click();
  await guest.waitForTimeout(300);
  await guest.locator('.yt-card-popover textarea').fill('B reads better at this size');
  await guest.getByRole('button', { name: 'Post' }).click();
  await guest.waitForTimeout(900);
  check('guest comment is signed with their name',
    (await guest.locator('.yt-card-popover', { hasText: 'Priya' }).count()) === 1);
  await guest.screenshot({ path: path.join(OUT, '02-guest-review.png') });
  await guest.keyboard.press('Escape');
  await guest.waitForTimeout(400);

  // ---------- 5. it reaches the author ----------
  await author.reload({ waitUntil: 'networkidle' });
  await author.waitForTimeout(2600);
  await openMenu(author, 1);
  const authorSees = await author.locator('.yt-card-popover').innerText();
  check('author sees the reviewer\'s comment',
    authorSees.includes('B reads better at this size'), authorSees.split('\n').slice(-1)[0]);
  check('author sees who left it', authorSees.includes('Priya'));
  check('the reviewer\'s like counted', /\b1\b/.test(authorSees));
  await author.screenshot({ path: path.join(OUT, '03-author-sees-review.png') });
  await author.keyboard.press('Escape');
  await author.waitForTimeout(300);

  // ---------- 6. a like can be taken back, and only your own ----------
  await openMenu(guest, 1);
  await guest.getByRole('button', { name: 'Liked' }).click();
  await guest.waitForTimeout(900);
  check('guest can take their own like back',
    await guest.getByRole('button', { name: 'Like' }).isVisible());
  await guest.keyboard.press('Escape');
  await guest.waitForTimeout(300);

  await author.reload({ waitUntil: 'networkidle' });
  await author.waitForTimeout(2600);
  await openMenu(author, 0);
  check('the author\'s own like is untouched',
    await author.getByRole('button', { name: 'Liked' }).isVisible());
  await author.keyboard.press('Escape');

  // ---------- 7. the API rejects junk ----------
  const id = link.split('/').pop();
  const post = async (body) =>
    (await fetch(`${BASE}/api/share/${id}/feedback`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })).status;
  check('feedback without a cardId is 400', (await post({ feedback: { likes: [], comments: [] } })) === 400);
  check('feedback on an unknown share is 404',
    (await (await fetch(`${BASE}/api/share/zzzzzzzzzzzz/feedback`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ cardId: 'x', feedback: { likes: ['a'], comments: [] } }),
    })).status) === 404);
  check('malformed body is 400',
    (await (await fetch(`${BASE}/api/share/${id}/feedback`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: 'not json',
    })).status) === 400);

  const real = errors.filter(e => !/favicon|DevTools|404 \(Not Found\)/i.test(e));
  check('no console/page errors', real.length === 0, real.slice(0, 2).join(' | '));

  await browser.close();
  const failed = results.filter(r => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
