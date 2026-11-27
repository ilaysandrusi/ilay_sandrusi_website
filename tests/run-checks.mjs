// Runs the browser checks in tests/redesign-checks.js against a running dev server, on desktop and phone sizes.
// Usage: npm run dev (in another terminal), then: npm run test:browser
// Another address: SITE_URL=http://localhost:4322/ilay_sandrusi_website/ npm run test:browser
// First time only: npx playwright install chromium
import { chromium } from "playwright";
import { readFileSync } from "node:fs";

const SITE_URL = process.env.SITE_URL || "http://localhost:4321/ilay_sandrusi_website/";
const checksSource = readFileSync(new URL("./redesign-checks.js", import.meta.url), "utf8");

const sizes = {
  desktop: { width: 1366, height: 820 },
  phone: { width: 375, height: 812 },
};

// Some checks need a step before them; each one runs on a freshly loaded page.
const setups = {
  // drag on a wide screen, then shrink: to 1024 in the desktop pass, to phone width in the phone pass
  dragResize: async (page, viewport) => {
    const target = viewport.width < 960 ? viewport : { width: 1024, height: 820 };
    await page.setViewportSize({ width: 1366, height: 820 });
    const problems = await page.evaluate(async () => {
      await window.__redesignChecks._wait(400);
      return window.__redesignChecks.drag();
    });
    if (problems.length) throw new Error(`drag before dragResize failed: ${problems.join("; ")}`);
    await page.setViewportSize(target);
  },
  maxAfterResize: async (page) => {
    await page.evaluate(async () => {
      await window.__redesignChecks._wait(1500);
      document.querySelector('.dot[data-act="max"]').click();
      await window.__redesignChecks._wait(700);
    });
    await page.setViewportSize({ width: 900, height: 820 });
  },
};

const browser = await chromium.launch();
let failed = 0;
try {
  for (const [sizeName, viewport] of Object.entries(sizes)) {
    const probe = await browser.newPage({ viewport });
    await probe.goto(SITE_URL, { waitUntil: "load" });
    await probe.addScriptTag({ content: checksSource });
    const names = await probe.evaluate(() => Object.keys(window.__redesignChecks).filter((n) => !n.startsWith("_")));
    await probe.close();

    for (const name of names) {
      const page = await browser.newPage({ viewport });
      const errors = [];
      page.on("pageerror", (e) => errors.push(String(e)));
      await page.goto(SITE_URL, { waitUntil: "load" });
      await page.addScriptTag({ content: checksSource });
      let result;
      try {
        if (setups[name]) await setups[name](page, viewport);
        result = await page.evaluate((n) => window.__redesignChecks[n](), name);
      } catch (e) {
        result = [`check crashed: ${String(e).split("\n")[0]}`];
      }
      const problems = [...(result || []), ...errors.map((e) => `page error: ${e}`)];
      if (problems.length) failed++;
      console.log(`${problems.length ? "FAIL" : "ok  "}  ${sizeName.padEnd(7)} ${name}${problems.length ? "\n        " + problems.join("\n        ") : ""}`);
      await page.close();
    }
  }
} finally {
  await browser.close();
}
console.log(failed ? `\n${failed} check(s) failed` : "\nall checks passed");
process.exit(failed ? 1 : 0);
