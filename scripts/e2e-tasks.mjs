import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const BASE = 'http://localhost:3000';
const OUT = path.join(os.tmpdir(), 'thumbnail-tester-e2e');
fs.mkdirSync(OUT, { recursive: true });

const results = [];
const check = (name, pass, detail = '') => {
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
};

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

  // ---------- 1. home page, empty ----------
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  check('home renders', await page.locator('h1', { hasText: 'Your tests' }).isVisible());
  check('empty state shown', await page.getByText('No tests yet').isVisible());
  await page.screenshot({ path: path.join(OUT, '01-home-empty.png') });

  // ---------- 2. new test ----------
  await page.getByRole('link', { name: /Create your first test/i }).click();
  await page.waitForURL('**/app');
  await page.waitForTimeout(1200);
  check('tester loads', await page.locator('.tool-root').isVisible());
  check('feed rendered', (await page.locator('.yt-card').count()) > 5,
    `${await page.locator('.yt-card').count()} cards`);
  check('task chip says New test', (await page.locator('.tool-by button').first().innerText()).includes('New test'));

  // ---------- 3. upload a thumbnail ----------
  // Build a real PNG in-page and hand it to the file input.
  const pngBase64 = await page.evaluate(async () => {
    const c = document.createElement('canvas');
    c.width = 1280; c.height = 720;
    const x = c.getContext('2d');
    x.fillStyle = '#e11d48'; x.fillRect(0, 0, 1280, 720);
    x.fillStyle = '#fff'; x.font = 'bold 180px Arial'; x.textAlign = 'center';
    x.fillText('MY TEST', 640, 420);
    return c.toDataURL('image/png').split(',')[1];
  });
  const pngPath = path.join(OUT, 'upload.png');
  fs.writeFileSync(pngPath, Buffer.from(pngBase64, 'base64'));

  await page.locator('input[type=file]').first().setInputFiles(pngPath);
  await page.waitForTimeout(600);

  // ---------- 4. edit the title ----------
  const titleBox = page.locator('textarea').first();
  await titleBox.fill('Persistence check 12345');
  await page.waitForTimeout(2500); // debounce + write

  const saveLabel = await page.locator('.tool-by span').last().innerText();
  check('autosave reported Saved', saveLabel.trim() === 'Saved', `label="${saveLabel.trim()}"`);
  check('title reached the feed',
    (await page.locator('.yt-card[data-test=true] .yt-card-title').innerText()).includes('Persistence check'));
  await page.screenshot({ path: path.join(OUT, '02-tester-edited.png') });

  // ---------- 5. back to home, task should be listed ----------
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  const cardCount = await page.locator('.tool-card').count();
  check('task appears in library', cardCount === 1, `${cardCount} cards`);
  check('library shows the title', await page.getByText('Persistence check 12345').first().isVisible());
  const coverSrc = await page.locator('.tool-card img').first().getAttribute('src');
  check('cover is a stored blob', !!coverSrc && coverSrc.startsWith('blob:'), coverSrc?.slice(0, 24));
  await page.screenshot({ path: path.join(OUT, '03-home-with-task.png') });

  // ---------- 6. reopen and confirm state survived ----------
  await page.locator('.tool-card a').first().click();
  await page.waitForURL('**/app?task=*');
  await page.waitForTimeout(1800);
  const reopenedTitle = await page.locator('textarea').first().inputValue();
  check('title restored', reopenedTitle === 'Persistence check 12345', reopenedTitle);
  const testThumb = await page.locator('.yt-card[data-test=true] img').getAttribute('src');
  check('uploaded thumbnail restored', !!testThumb && testThumb.startsWith('blob:'), testThumb?.slice(0, 24));
  const chip = await page.locator('.tool-by button').first().innerText();
  check('task name in chip', chip.includes('Persistence check'), chip);
  await page.screenshot({ path: path.join(OUT, '04-reopened.png') });

  // ---------- 7. hard reload — data must survive a fresh page load ----------
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1800);
  const afterReload = await page.locator('textarea').first().inputValue();
  check('survives reload', afterReload === 'Persistence check 12345', afterReload);

  // ---------- 8. duplicate + delete ----------
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(900);
  await page.locator('button[aria-label^="Duplicate"]').first().click();
  await page.waitForTimeout(900);
  check('duplicate created', (await page.locator('.tool-card').count()) === 2,
    `${await page.locator('.tool-card').count()} cards`);

  const del = page.locator('button[aria-label^="Delete"]').first();
  await del.click();               // arms
  await page.waitForTimeout(200);
  await del.click();               // confirms
  await page.waitForTimeout(900);
  check('delete removed one', (await page.locator('.tool-card').count()) === 1,
    `${await page.locator('.tool-card').count()} cards`);
  await page.screenshot({ path: path.join(OUT, '05-after-duplicate-delete.png') });

  // ---------- 9. console cleanliness ----------
  const real = errors.filter(e => !/favicon|Download the React DevTools/i.test(e));
  check('no console/page errors', real.length === 0, real.slice(0, 2).join(' | '));

  await browser.close();

  const failed = results.filter(r => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
