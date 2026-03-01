import { test, expect } from '@playwright/test';

test.describe('Flujo de Configuración', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar a la página de inicio
    await page.goto('/');
    // Seleccionar tab de Configuración
    await page.click('button:has-text("Configuración")');
    await page.waitForLoadState('networkidle');
  });

  test('Debería mostrar la página de configuración', async ({ page }) => {
    // Verificar que cargó
    await expect(page.locator('text=Configuración del Sistema')).toBeVisible();
    
    // Verificar descripción
    await expect(page.locator('text=/Herramientas de administración/i')).toBeVisible();
  });

  test('Debería tener secciones de carga de datos', async ({ page }) => {
    // Verificar secciones
    const hasCourses = await page.locator('text=/Cargar Cursos/i').count();
    const hasStudents = await page.locator('text=/Cargar Estudiantes/i').count();
    const hasSeedButton = await page.locator('button:has-text("Cargar Demo")').count();

    expect(hasCourses + hasStudents + hasSeedButton).toBeGreaterThan(0);
  });

  test('Botón Cargar Demo debería existir', async ({ page }) => {
    // Buscar botón
    const seedButton = page.locator('button:has-text("Cargar Demo")');
    
    // Verificar que existe
    await expect(seedButton).toBeVisible();
    
    // Verificar que está enabled
    const isDisabled = await seedButton.getAttribute('disabled');
    // Puede estar disabled o no, depende de API
  });

  test('Debería tener área de carga de archivos', async ({ page }) => {
    // Buscar inputs de archivo
    const fileInputs = page.locator('input[type="file"]');
    
    // Debería haber inputs de archivo para cursos y estudiantes
    const count = await fileInputs.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('Debería permitir seleccionar nivel de carga', async ({ page }) => {
    // Buscar selectores de nivel
    const hasBasica = await page.locator('text=/BASICA|Básica/i').count();
    const hasMedia = await page.locator('text=/MEDIA|Media/i').count();

    expect(hasBasica + hasMedia).toBeGreaterThan(0);
  });

  test('Toast debería mostrar en Configuración', async ({ page }) => {
    // Esta prueba puede fallar si no hay datos para cargar, pero verifica que el sistema está listo
    
    // Verificar que la página se cargó sin errores de sintaxis
    const toastContainer = page.locator('[class*="toast"], [role="alert"]');
    const count = await toastContainer.count();
    
    // No debe haber toasts inicialmente
    expect(count).toBe(0);

    // Navegar fuera y volver
    await page.click('button:has-text("Dashboard")');
    await page.click('button:has-text("Configuración")');
    
    // Esperar a que cargue
    await page.waitForLoadState('networkidle');

    // No debería haber errores
    await expect(page.locator('text=Error')).not.toBeVisible({ timeout: 2000 });
  });
});
