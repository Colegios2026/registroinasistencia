import { test, expect } from '@playwright/test';

test('create inspectorate record', async ({ page }) => {
  await page.goto('/inspectoria');
  await page.click('text=Nueva Atención');

  const form = page.locator('form');
  // select first non-empty course option
  const courseSelect = form.locator('select').nth(0);
  const courseOptions = await courseSelect.locator('option').allTextContents();
  if (courseOptions.length < 2) {
    test.skip();
    return;
  }
  // choose second option (first is placeholder '')
  await courseSelect.selectOption({ index: 1 });

  // wait for students to populate then choose first student
  const studentSelect = form.locator('select').nth(1);
  await expect(studentSelect).toBeEnabled();
  // give a short wait for options to update
  await page.waitForTimeout(500);
  await studentSelect.selectOption({ index: 1 });

  // fill datetime-local with current local datetime without seconds
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const local = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  await form.locator('input[type="datetime-local"]').fill(local);

  await form.locator('textarea').fill('Prueba e2e: creación de atención de inspectoría');

  await form.locator('button:has-text("Registrar Atención")').click();

  // wait for toast success or error
  const success = await page.locator('text=Registro de inspectoría creado exitosamente').first();
  await expect(success).toBeVisible({ timeout: 10000 });
});
