import { test } from '@playwright/test';
import { loginAsStaff } from './helpers/auth';

test('capture calendar screenshot', async ({ page }) => {
  await loginAsStaff(page);
  await page.goto('/pruebas', { waitUntil: 'networkidle' });
  // wait briefly for scripts/styles
  await page.waitForTimeout(1000);
  // try to wait for calendar header
  try {
    await page.waitForSelector('text=Calendario de Evaluaciones', { timeout: 5000 });
  } catch (e) {
    // ignore
  }
  await page.screenshot({ path: 'e2e/screenshots/calendar.png', fullPage: true });
});
