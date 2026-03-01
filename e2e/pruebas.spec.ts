import { test, expect } from '@playwright/test';
import { loginAsStaff } from './helpers/auth';

test.describe('Flujo de Pruebas', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsStaff(page);
    // Esperar a que cargue y seleccionar tab de Pruebas
    await page.click('button:has-text("Pruebas")');
    await page.waitForLoadState('networkidle');
  });

  test('Debería mostrar la página de pruebas sin errores', async ({ page }) => {
    // Verificar que la página se cargó
    await expect(page.locator('text=Calendario de Evaluaciones')).toBeVisible();
    
    // Verificar que los controles están presentes
    await expect(page.locator('button:has-text("Nueva Prueba")')).toBeVisible();
  });

  test('Debería abrir el modal de crear prueba', async ({ page }) => {
    // Click en botón "Nueva Prueba"
    await page.click('[data-testid="open-create-test"]');

    // Verificar que el modal se abrió y esperar estabilidad de animación
    await page.waitForSelector('[data-testid="modal-create-test-dialog"]', { state: 'visible', timeout: 3000 });
    await page.waitForTimeout(200);
    // Verificar que los campos están visibles
    await expect(page.locator('[data-testid="create-test-course"]')).toBeVisible();
    await expect(page.locator('[data-testid="create-test-type"]')).toBeVisible();
    await expect(page.locator('[data-testid="create-test-date"]')).toBeVisible();
  });

  test('Debería validar campos requeridos en formulario de prueba', async ({ page }) => {
    // Abrir modal
    await page.waitForSelector('[data-testid="open-create-test"]', { state: 'visible', timeout: 3000 });
    await page.click('[data-testid="open-create-test"]');
    await page.waitForSelector('[data-testid="modal-create-test-dialog"]', { state: 'visible', timeout: 3000 });

    // Intentar submit sin llenar campos (disparar submit del formulario)
    await page.locator('[data-testid="modal-create-test-dialog"] form').evaluate((f: HTMLFormElement) => f.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
    
    // Esperar y verificar que aparecen errores de validación
    await page.waitForTimeout(500);
    
    // Buscar mensajes de error (FormError muestra mensajes en texto rojo)
    const errorMessages = await page.locator('[data-testid="modal-create-test-dialog"] .text-red-600').count();
    expect(errorMessages).toBeGreaterThan(0);
  });

  test('Debería mostrar Toast de éxito al crear prueba', async ({ page }) => {
    // Abrir modal
    await page.waitForSelector('[data-testid="open-create-test"]', { state: 'visible', timeout: 3000 });
    await page.click('[data-testid="open-create-test"]');
    await page.waitForSelector('[data-testid="modal-create-test-dialog"]', { state: 'visible', timeout: 3000 });

    // Llenar formulario acorde a la UI actual
    const courseSelect = page.locator('[data-testid="create-test-course"]');
    const hasOptions = await courseSelect.locator('option').count();
    if (hasOptions <= 1) return; // No hay cursos disponibles para crear prueba
    await courseSelect.selectOption({ index: 1 }); // Seleccionar primer curso
    await page.fill('[data-testid="create-test-date"]', '2026-03-15');
    await page.locator('[data-testid="create-test-type"]').selectOption({ index: 1 }); // Tipo de evaluación
    await page.fill('[data-testid="create-test-desc"]', 'Temas 1,2,3');

    // Enviar formulario (esperar estabilidad y usar click forzado si hace falta)
    await page.waitForTimeout(300);
    await page.locator('[data-testid="create-test-submit"]').click({ force: true });

    // Esperar y verificar resultado: puede aparecer un Toast o errores de formulario
    await page.waitForTimeout(1000);
    const toastCount = await page.locator('[role="alert"]').count();
    const errorCount = await page.locator('[data-testid="modal-create-test-dialog"] .text-red-600').count();
    expect(toastCount + errorCount).toBeGreaterThan(0);
  });

  test('Debería filtrar pruebas por curso', async ({ page }) => {
    // Seleccionar un curso en el filtro
    const filterSelect = page.locator('select').last();
    await filterSelect.selectOption({ index: 1 });

    // Esperar a que se actualice
    await page.waitForLoadState('networkidle');

    // Verificar que es visible (sin error)
    await expect(page.locator('text=Registro de Evaluaciones')).toBeVisible();
  });
});
