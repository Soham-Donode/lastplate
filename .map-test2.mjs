import puppeteer from "puppeteer-core";

const BASE = "http://localhost:3000";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const OUT = "/private/var/folders/wb/13s658hn6fs5q72ll8tqbzyr0000gn/T/opencode";

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  defaultViewport: { width: 1440, height: 1000 },
});

async function newContextPage() {
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  page.setDefaultTimeout(45000);
  return { context, page };
}

async function signIn(page, email) {
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle2" });
  await page.waitForSelector("#email");
  await page.type("#email", email);
  await page.type("#password", "LastPlate#2026");
  await page.click('button[type="submit"]');
  await page.waitForFunction(
    () => !window.location.pathname.startsWith("/login"),
    { timeout: 45000 },
  );
  await page.waitForFunction(
    () => document.body.innerText.includes("Dashboard"),
    { timeout: 45000 },
  );
}

try {
  const ngoContext = await browser.createBrowserContext();
  const ngo = await ngoContext.newPage();
  ngo.setDefaultTimeout(45000);
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
  console.log(
    "tiles",
    await ngo.$$eval(".leaflet-tile", (els) => els.length),
  );

  await ngo.evaluate(() => {
    localStorage.setItem("lastplate-theme", "light");
    document.documentElement.classList.remove("dark");
  });
  await new Promise((r) => setTimeout(r, 2000));
  await ngo.screenshot({ path: `${OUT}/ngo-map-light.png`, fullPage: true });

  await ngo.evaluate(() => {
    localStorage.setItem("lastplate-theme", "dark");
    document.documentElement.classList.add("dark");
  });
  await new Promise((r) => setTimeout(r, 2000));
  await ngo.screenshot({ path: `${OUT}/ngo-map-dark.png`, fullPage: true });

  const firstMarker = await ngo.$(".lp-map-pin__label");
  if (firstMarker) {
    await firstMarker.click();
    await ngo.waitForFunction(
      () => window.location.pathname.startsWith("/ngo/donations/"),
      { timeout: 30000 },
    );
    console.log("marker navigated to", ngo.url());
  }
  await ngoContext.close();

  const donorContext = await browser.createBrowserContext();
  const donor = await donorContext.newPage();
  donor.setDefaultTimeout(45000);
  await signIn(donor, "ananya@saffronkitchen.in");

  await donor.goto(`${BASE}/donor/donations/new`, {
    waitUntil: "networkidle2",
  });
  await donor.waitForSelector(".lp-location-pin", { timeout: 30000 });
  await new Promise((r) => setTimeout(r, 3000));

  const before = await donor.evaluate(() => ({
    lat: document.querySelector('input[name="latitude"]')?.value,
    lng: document.querySelector('input[name="longitude"]')?.value,
  }));

  const map = await donor.$(".leaflet-container");
  if (map) {
    await map.evaluate((element) => element.scrollIntoView({ block: "center" }));
    await new Promise((r) => setTimeout(r, 500));
  }
  const box = await map?.boundingBox();
  if (box) {
    await donor.mouse.click(box.x + box.width * 0.68, box.y + box.height * 0.4);
    await new Promise((r) => setTimeout(r, 800));
  }

  const after = await donor.evaluate(() => ({
    lat: document.querySelector('input[name="latitude"]')?.value,
    lng: document.querySelector('input[name="longitude"]')?.value,
  }));

  console.log("picker coordinates before", before);
  console.log("picker coordinates after", after);
  await donor.screenshot({
    path: `${OUT}/donation-form-map.png`,
    fullPage: true,
  });

  await donor.goto(`${BASE}/donor/settings`, { waitUntil: "networkidle2" });
  await donor.waitForSelector(".lp-location-pin", { timeout: 30000 });
  await new Promise((r) => setTimeout(r, 2500));
  await donor.screenshot({ path: `${OUT}/settings-map.png`, fullPage: true });
  console.log("settings picker rendered");
  await donorContext.close();

  console.log("PASS map");
} catch (error) {
  console.error("FAIL", error);
  process.exitCode = 1;
} finally {
  await browser.close();
}
