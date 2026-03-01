# Testing E2E con Playwright

## Configuración

Los tests E2E están configurados con Playwright y se encuentran en la carpeta `e2e/`.

### Scripts disponibles

```bash
# Ejecutar todos los tests
npm run test:e2e

# Ejecutar tests en modo UI interactivo
npm run test:e2e:ui

# Ejecutar tests en modo debug
npm run test:e2e:debug

# Ver último reporte de tests
npm run test:e2e:report
```

## Estructuración de Tests

### Archivos de Test

1. **pruebas.spec.ts** - Flujo completo de creación de evaluaciones
   - ✓ Carga de página
   - ✓ Apertura de modal
   - ✓ Validación de campos requeridos
   - ✓ Toast de éxito
   - ✓ Filtros por curso

2. **inasistencias.spec.ts** - Registro de ausencias
   - ✓ Carga de página
   - ✓ Modal de inasistencia
   - ✓ Validación de fechas
   - ✓ Envío de formulario
   - ✓ Validación de campos obligatorios

3. **inspectoria.spec.ts** - Atención de inspectoría
   - ✓ Carga de página
   - ✓ Modal de atención
   - ✓ Validación de longitud de observación
   - ✓ Envío de registro
   - ✓ Filtros de mes/año

4. **validaciones.spec.ts** - Validaciones y notificaciones globales
   - ✓ Toast de éxito
   - ✓ Validación de campos requeridos
   - ✓ Componente FormError
   - ✓ Auto-cierre de Toast
   - ✓ Validación en blur

5. **configuracion.spec.ts** - Sistema de configuración
   - ✓ Página de configuración
   - ✓ Secciones de carga
   - ✓ Botón Cargar Demo
   - ✓ Input de archivos
   - ✓ Toast en configuración

## Cobertura de Casos

### Flujos Principales
- ✅ Crear evaluación con validaciones
- ✅ Registrar inasistencia con rango de fechas
- ✅ Registrar atención de inspectoría
- ✅ Cargar datos masivos

### Validaciones
- ✅ Campos requeridos
- ✅ Formato de fecha
- ✅ Longitud de texto (mínimo/máximo)
- ✅ Rango de fechas (inicio < fin)

### UX
- ✅ Toast notificaciones
- ✅ Mensajes de error inline
- ✅ Comportamiento de modales
- ✅ Filtros y búsqueda

## Ejecución Local

### Prerequisitos
1. Dev server corriendo: `npm run dev`
2. Base de datos Supabase configurada
3. Credenciales en `.env`

### Pasos

```bash
# Terminal 1 - Dev server
npm run dev

# Terminal 2 - Tests E2E
npm run test:e2e

# Ver resultados interactivos
npm run test:e2e:ui
```

## CI/CD Integration

Los tests están configurados para ejecutarse en CI con:
- Reintento automático (2 veces)
- Screenshots en fallos
- Trazas para debugging
- Reporte HTML

Para CI, Playwright:
1. Instala automáticamente Chromium
2. Ejecuta en headless mode
3. Genera reportes
4. Guarda screenshots de fallos

## Troubleshooting

### "element not found"
- Esperar a que la página cargue: `page.waitForLoadState()`
- Usar selectores más específicos
- Timeout por defecto es 30s

### "connection refused"
- Verificar que dev server está corriendo en puerto 5173
- Revisar configuración en `playwright.config.ts`

### Tests flaky
- Agregar `waitForLoadState('networkidle')`
- Usar `page.waitForTimeout()` si es necesario
- Verificar selectores CSS

## Best Practices

1. **Esperas explícitas** - Siempre esperar después de acciones
2. **Selectores robustos** - Usar `text=`, `label:has-text()`
3. **Setup/Teardown** - Usar `beforeEach()` para preparar estado
4. **Legibilidad** - Nombres descriptivos de tests
5. **Aislamiento** - Cada test debe ser independiente

## Performance

Tests tipicamente tardan:
- Pruebas: ~3-4s c/u
- Inasistencias: ~3-4s c/u
- Inspectoría: ~3-4s c/u
- Validaciones: ~2-3s c/u
- Configuración: ~2-3s c/u

**Total**: ~15-20 segundos ejecutar suite completa

## Reporte HTML

Después de ejecutar tests, ver reporte:

```bash
npm run test:e2e:report
```

Muestra:
- ✅/❌ Tests pasados/fallidos
- Screenshots de fallos
- Timeline de cada test
- Video de ejecución (opcional)
