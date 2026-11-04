import puppeteer from "puppeteer-core";

const BASE = "http://localhost:3000";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const OUT = "/private/var/folders/wb/13s658hn6fs5q72ll8tqbzyr0000gn/T/opencode";

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  defaultViewport: { width: 1440, height: 1000 },
});

async function newPage() {
  const page = await browser.newPage();
  page.setDefaultTimeout(45000);
  return page;
}

async function signIn(page, email) {
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle2" });
  await page.type("#email", email);
  await page.type("#password", "LastPlate#2026");
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle2" }),
    page.click('button[type="submit"]'),
  ]);
}

try {
  const ngo = await newPage();
  await signIn(ngo, "meera@annapurnatrust.org");
  await ngo.waitForFunction(
    () => document.body.innerText.includes("Donations near your kitchen"),
    { timeout: 45000 },
  );
  await ngo.waitForSelector(".leaflet-container", { timeout: 30000 });
  await ngo.waitForSelector(".lp-map-pin", { timeout: 30000 });
  await new Promise((r) => setTimeout(r, 4000));
  const markers = await ngo.$$eval(".lp-map-pin__label", (els) =>
    els.map((el) => el.textContent),
  );
  console.log("markers", markers);
  const tiles = await ngo.$$eval(".leaflet-tile", (els) => els.length);
  console.log("tiles", tiles);
  await ngo.screenshot({ path: `${OUT}/ngo-map-light.png`, fullPage: true });

  await ngo.evaluate(() => {
    document.documentElement.classList.add("dark");
  });
  await new Promise((r) => setTimeout(r, 2500));
  await ngo.screenshot({ path: `${OUT}/ngo-map-dark.png`, fullPage: true });
  await ngo.evaluate(() => {
    document.documentElement.classList.remove("dark");
  });

  const firstMarker = await ngo.$(".lp-map-pin__label");
  if (firstMarker) {
    await Promise.all([
      ngo.waitForNavigation({ waitUntil: "networkidle2" }),
      firstMarker.click(),
    ]);
    console.log("marker navigated to", ngo.url());
  }

  const donor = await newPage();
  await signIn(donor, "ananya@saffronkitchen.in");
  await donor.goto(`${BASE}/donor/donations/new`, {
    waitUntil: "networkidle2",
  });
  await donor.waitForSelector(".lp-location-pin", { timeout: 30000 });
  await new Promise((r) => setTimeout(r, 3000));
  console.log("donation form picker", await donor.$eval(".lp-location-pin", (el) => Boolean(el)));
  await donor.screenshot({ path: `${OUT}/donation-form-map.png`, fullPage: true });

  await donor.goto(`${BASE}/donor/settings`, { waitUntil: "networkidle2" });
  await donor.waitForSelector(".lp-location-pin", { timeout: 30000 });
  await new Promise((r) => setTimeout(r, 2500));
  console.log("settings picker", await donor.$eval(".lp-location-pin", (el) => Boolean(el)));
  await donor.screenshot({ path: `${OUT}/settings-map.png`, fullPage: true });

  console.log("PASS map");
} catch (error) {
  console.error("FAIL", error);
  process.exitCode = 1;
} finally {
  await browser.close();
}
