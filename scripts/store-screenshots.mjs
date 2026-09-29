// Takes the RuStore listing screenshots from the real app: a fresh profile
// goes through the onboarding and starts a workout, and each screen worth
// showing is saved at 1080x1920. RuStore accepts only 9:16 or 16:9, which a
// modern phone screen is not, so the shots come from a browser rather than
// an emulator.
//
// Needs the client running: `npm run client:dev`.
//
// Usage: node scripts/store-screenshots.mjs [base url]

import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { chromium } from "playwright";

const BASE_URL = process.argv[2] ?? "http://localhost:5173/gym-tracker/";
const OUT_DIR = "design/store/screenshots";

// 360x640 CSS pixels at 3x is 1080x1920, a common Android phone size.
const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 360, height: 640 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
  locale: "ru-RU",
});
const page = await context.newPage();

await mkdir(OUT_DIR, { recursive: true });

async function shot(name) {
  // Transitions between onboarding steps and sheets settle in well under this.
  await page.waitForTimeout(800);
  await page.screenshot({ path: join(OUT_DIR, `${name}.png`) });
  console.log(`saved ${name}`);
}

const button = (name) => page.getByRole("button", { name }).last();

// A click during a step transition lands on the step that is leaving.
async function tap(name) {
  await button(name).click();
  await page.waitForTimeout(500);
}

try {
  await page.goto(BASE_URL);

  await tap("Начать");
  await shot("05-sex");
  await tap("Мужской");
  await shot("06-height");
  await tap("Дальше");
  await tap("Дальше");
  await tap(/Занимаюсь сейчас/);
  await shot("04-remembered-set");
  for (let i = 0; i < 4; i++) {
    await tap("Дальше");
  }
  await shot("03-starting-weights");
  await tap("К тренировкам");

  await tap("Начать тренировку");
  // An empty workout opens its overview first, the catalogue is one step on.
  await tap("Добавить упражнение");
  for (const exercise of [
    "Жим штанги лёжа",
    "Приседания со штангой на спине",
    "Тяга верхнего блока к груди широким хватом",
  ]) {
    await tap("Добавить упражнение");
    await page.getByText(exercise, { exact: true }).first().click();
    await page.waitForTimeout(500);
  }
  await page.getByText("Вернуться к подходу").click();

  // Recommendations are not written yet, so the weight is entered by hand.
  await page.getByText("–", { exact: true }).first().click();
  await page.getByText("Ввести вручную").click();
  await page.locator("input").last().fill("60");
  await tap("Готово");
  await shot("02-plates");

  await page.mouse.click(180, 100);
  await shot("01-set");
} finally {
  await browser.close();
}
