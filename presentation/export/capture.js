const puppeteer = require("puppeteer-core");
const path = require("path");
const fs = require("fs");

const outDir = "/workspace/presentation/export";
const html = "file:///workspace/presentation/index.html";

(async () => {
  const browser = await puppeteer.launch({
    executablePath: "/usr/local/bin/google-chrome",
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--hide-scrollbars",
      "--font-render-hinting=none",
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });

  for (let i = 1; i <= 5; i++) {
    await page.goto(`${html}?slide=${i}`, { waitUntil: "networkidle0", timeout: 30000 });
    await new Promise((r) => setTimeout(r, 400));
    const dest = path.join(outDir, `slide-0${i}.png`);
    await page.screenshot({ path: dest, type: "png" });
    console.log("wrote", dest);
  }

  await browser.close();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
