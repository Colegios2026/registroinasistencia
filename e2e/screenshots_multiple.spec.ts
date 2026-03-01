import { test } from '@playwright/test';
import { loginAsStaff } from './helpers/auth';

const sizes = [
  { name: 'desktop', width: 1280, height: 900 },
  { name: 'laptop', width: 1024, height: 768 },
  { name: 'tablet', width: 768, height: 1024 }
];

for (const s of sizes) {
  test(`screenshot-${s.name}`, async ({ page }) => {
    await loginAsStaff(page);
    await page.setViewportSize({ width: s.width, height: s.height });
    await page.goto('/pruebas', { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    await page.screenshot({ path: `e2e/screenshots/calendar-${s.name}.png`, fullPage: true });
  });
}
