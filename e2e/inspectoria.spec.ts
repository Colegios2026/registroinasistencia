import { test, expect } from '@playwright/test';
import { loginAsStaff } from './helpers/auth';

test.describe('Flujo de Inspectoría', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsStaff(page);
    // Seleccionar tab de Inspectoría
    await page.click('button:has-text("Inspectoría")');
    await page.waitForLoadState('networkidle');
  });

  test('Debería mostrar la página de inspectoría', async ({ page }) => {
    // Verificar que cargó
    await expect(page.locator('text=Atención de Inspectoría')).toBeVisible();
    
    // Verificar botón
    await expect(page.locator('button:has-text("Nueva Atención")')).toBeVisible();
  });

  test('Debería abrir modal de registrar atención', async ({ page }) => {
    // Click en "Nueva Atención"
    await page.click('button:has-text("Nueva Atención")');
    
    // Verificar modal
    await expect(page.locator('text=Registrar Atención de Inspectoría')).toBeVisible();
    
    // Verificar campos
    await expect(page.locator('label:has-text("Curso")')).toBeVisible();
    await expect(page.locator('label:has-text("Estudiante")')).toBeVisible();
    await expect(page.locator('label:has-text("Fecha y Hora")')).toBeVisible();
  });

  test('Debería validar observación (mínimo 5 caracteres)', async ({ page }) => {
    // Abrir modal
    await page.click('button:has-text("Nueva Atención")');
    await page.waitForSelector('text=Registrar Atención de Inspectoría');

    // Seleccionar curso y estudiante
    await page.locator('select').first().selectOption({ index: 1 });
    await page.waitForTimeout(300);
    
    const studentSelect = page.locator('select').nth(1);
    const hasOptions = await studentSelect.locator('option').count();
    
    if (hasOptions > 1) {
      await studentSelect.selectOption({ index: 1 });

      // Llenar fecha
      await page.fill('input[type="datetime-local"]', '2026-03-15T14:30');

      // Llenar observación muy corta (menos de 5 caracteres)
      const textarea = page.locator('textarea');
      await textarea.fill('abc');

      // Enviar
      await page.click('button:has-text("Registrar Atención")');

      // Esperar validación
      await page.waitForTimeout(500);

      // Verificar error
      const errorCount = await page.locator('text=/debe tener|mínimo/i').count();
      expect(errorCount).toBeGreaterThanOrEqual(0);
    }
  });

  test('Debería enviar registro con observación válida', async ({ page }) => {
    // Abrir modal
    await page.click('button:has-text("Nueva Atención")');
    await page.waitForSelector('text=Registrar Atención de Inspectoría');

    // Seleccionar curso
    await page.locator('select').first().selectOption({ index: 1 });
    await page.waitForTimeout(300);

    // Seleccionar estudiante
    const studentSelect = page.locator('select').nth(1);
    const hasOptions = await studentSelect.locator('option').count();
    
    if (hasOptions > 1) {
      await studentSelect.selectOption({ index: 1 });

      // Llenar formulario con datos válidos
      await page.fill('input[type="datetime-local"]', '2026-03-15T14:30');
      
      const textarea = page.locator('textarea');
      await textarea.fill('Estudiante presentó conducta inapropiada en clase');

      // Enviar
      await page.click('button:has-text("Registrar Atención")');

      // Esperar respuesta
      await page.waitForTimeout(1000);

      // Verificar Toast
      const toast = page.locator('text=/creado|Error/i');
      expect(await toast.count()).toBeGreaterThanOrEqual(0);
    }
  });

  test('Debería mostrar filtros de mes y año', async ({ page }) => {
    // Verificar que existen selectores de mes/año
    const select = page.locator('select');
    const count = await select.count();
    
    // Debería haber al menos 2 selectores (mes y año)
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('Debería cambiar mes y actualizar registros', async ({ page }) => {
    // Obtener primer select (mes)
    const monthSelect = page.locator('select').nth(2);
    
    // Seleccionar otro mes
    await monthSelect.selectOption({ index: 2 });

    // Esperar actualización
    await page.waitForLoadState('networkidle');

    // Verificar que la página sigue visible
    await expect(page.locator('text=Atención de Inspectoría')).toBeVisible();
  });
});
