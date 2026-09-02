// End-to-end check of multi-variant testing and drag-to-place:
// four thumbnails in one feed, badged and re-lettered as they are toggled,
// then a test card dragged onto another card's slot and released.
//
// Requires `npm run dev` (or `npm start`), which listens on :3011.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const BASE = process.env.BASE_URL ?? 'http://localhost:3011';
const OUT = path.join(os.tmpdir(), "claude-shots");
fs.mkdirSync(OUT, { recursive: true });

const results = [];
const check = (name, pass, detail = "") => {
  results.push({ name, pass });
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`);
};

async function makePng(page, label, color) {
  const b64 = await page.evaluate(([text, c]) => {
    const cv = document.createElement("canvas");
    cv.width = 1280; cv.height = 720;
    const x = cv.getContext("2d");
    x.fillStyle = c; x.fillRect(0, 0, 1280, 720);
    x.fillStyle = "#fff"; x.font = "bold 320px Arial"; x.textAlign = "center";
    x.fillText(text, 640, 500);
    return cv.toDataURL("image/png").split(",")[1];
  }, [label, color]);
  const f = path.join(OUT, `variant-${label}.png`);
  fs.writeFileSync(f, Buffer.from(b64, "base64"));
  return f;
}

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 2032, height: 950 } });
  const errors = [];
  p.on("pageerror", (e) => errors.push(String(e)));
  p.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });

  await p.goto(`${BASE}/app`, { waitUntil: "networkidle" });
  await p.waitForTimeout(1800);

  // Switch THUMBNAIL mode to Multiple and add four variants at once.
  await p.locator(".tseg-btn, .seg-btn, button", { hasText: "Multiple" }).first().click();
  await p.waitForTimeout(400);

  const files = [];
  const colors = ["#c0392b", "#27ae60", "#2980b9", "#8e44ad"];
  for (let i = 0; i < 4; i++) files.push(await makePng(p, "ABCD"[i], colors[i]));

  await p.locator('input[type=file]').first().setInputFiles(files);
  await p.waitForTimeout(2200);

  const testCards = p.locator('.yt-card[data-test="true"]');
  check("four variants become four cards", (await testCards.count()) === 4,
    `${await testCards.count()} test cards`);

  const badges = p.locator(".yt-variant-badge");
  const badgeText = (await badges.allInnerTexts()).join("");
  check("cards are badged A-D", badgeText === "ABCD", badgeText);

  const sidebarCount = await p.locator("text=/4\/4 in feed/").count();
  check("sidebar reports 4/4 in feed", sidebarCount === 1);

  await p.screenshot({ path: path.join(OUT, "variants-4up.png") });

  // Disabling one variant drops its card and re-letters the rest.
  await p.locator('[title="Click to hide from feed"]').nth(3).click();
  await p.waitForTimeout(900);
  check("hiding a variant removes its card", (await testCards.count()) === 3,
    `${await testCards.count()} test cards`);
  check("badges re-letter to A-C",
    (await p.locator(".yt-variant-badge").allInnerTexts()).join("") === "ABC");
  await p.locator('[title="Click to show in feed"]').first().click();
  await p.waitForTimeout(900);

  // --- drag a test card to another card's position ---
  const idxOf = async () =>
    p.evaluate(() =>
      Array.from(document.querySelectorAll(".yt-card")).findIndex(
        (c) => c.dataset.test === "true",
      ),
    );
  const firstTestIdx = await idxOf();
  check("test cards start at the front", firstTestIdx === 0, `index ${firstTestIdx}`);

  const cards = p.locator(".yt-card");
  const src = cards.nth(0);
  const dst = cards.nth(7);
  const dstTitleBefore = await dst.locator(".yt-card-title").innerText();

  await src.hover();
  await p.mouse.down();
  await dst.hover();
  await p.mouse.move(10, 10);
  await dst.hover();
  await p.waitForTimeout(300);
  await p.mouse.up();
  await p.waitForTimeout(900);

  const movedIdx = await p.evaluate((label) => {
    const all = Array.from(document.querySelectorAll(".yt-card"));
    return all.findIndex(
      (c) => c.querySelector(".yt-variant-badge")?.textContent === label,
    );
  }, "A");
  check("dragged card moved to the drop slot", movedIdx === 7, `now at index ${movedIdx}`);
  check("placement switched to Manual",
    (await p.locator('[data-active="true"]', { hasText: "Manual" }).count()) > 0 ||
      (await p.locator("text=Drag your card onto any card").count()) > 0);
  check("the card it displaced is still in the feed",
    (await p.locator(".yt-card-title", { hasText: dstTitleBefore }).count()) > 0);

  await p.screenshot({ path: path.join(OUT, "variants-dragged.png") });

  // Going back to First clears the arrangement.
  await p.locator("button", { hasText: "First" }).first().click();
  await p.waitForTimeout(900);
  check("First restores the front", (await idxOf()) === 0);

  const real = errors.filter((e) => !/favicon|DevTools|404/i.test(e));
  check("no console errors", real.length === 0, real.slice(0, 2).join(" | "));

  await b.close();
  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
})().catch((e) => { console.error("HARNESS ERROR", e); process.exit(2); });
