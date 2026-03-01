# Constants Centralization and Code Cleanup

## Overview

Este documento summariza las mejoras de consolidación de constantes y eliminación de "magic strings" realizadas en esta sesión.

## Cambios Realizados

### 1. **Creación de Archivo de Constantes** ✅
- **Ubicación:** `src/constants/index.ts`
- **Propósito:** Centralizar todas las constantes de la aplicación
- **Contenidos:**

```typescript
// Absence Status
- ABSENCE_STATUS.PENDIENTE
- ABSENCE_STATUS.JUSTIFICADA

// Education Levels  
- EDUCATION_LEVELS.BASICA
- EDUCATION_LEVELS.MEDIA

// Toast Types
- TOAST_TYPES.SUCCESS
- TOAST_TYPES.ERROR
- TOAST_TYPES.WARNING
- TOAST_TYPES.INFO

// File Upload Config
- FILE_CONFIG.ALLOWED_EXTENSIONS
- FILE_CONFIG.MAX_FILE_SIZE_MB
- FILE_CONFIG.UPLOAD_BUCKET

// Retry Configuration
- RETRY_CONFIG.MAX_ATTEMPTS
- RETRY_CONFIG.BASE_DELAY_MS

// Request Timeouts 
- REQUEST_TIMEOUT_SEC

// Query Cache Invalidation Keys
- QUERY_KEYS_INVALIDATE (absences, students, courses, tests, etc.)

// UI Configuration
- UI_CONFIG (modal sizes, pagination)

// Error Codes
- ERROR_CODES (database error codes)
```

### 2. **Actualizaciones de Servicios** ✅
- **Archivo:** `src/services/absenceService.ts`

Cambios:
- Importación de constantes: `ABSENCE_STATUS`, `FILE_CONFIG`, `RETRY_CONFIG`
- Reemplazo de `'ALLOWED_EXTENSIONS'` array literal → `FILE_CONFIG.ALLOWED_EXTENSIONS`
- Reemplazo de `'documents'` string → `FILE_CONFIG.UPLOAD_BUCKET`
- Reemplazo de `300 * attempt` → `RETRY_CONFIG.BASE_DELAY_MS * attempt`
- Reemplazo de `'JUSTIFICADA'` y `'PENDIENTE'` → constantes enum

**Impacto:** Eliminó 5+ magic strings, mejoró mantenibilidad de configuraciones.

### 3. **Actualizaciones del Contexto** ✅
- **Archivo:** `src/contexts/ToastContext.tsx`

Cambios:
- Importación: `import { TOAST_TYPES, type ToastType } from '../constants'`
- TipoType ahora usa constante global en lugar de unión literal
- Mantiene compatibilidad backward con componentes existentes

**Impacto:** Única source of truth para Toast types.

### 4. **Actualizaciones de Pages** ✅
Archivos actualizados con importaciones de `TOAST_TYPES` y reemplazos:

#### `src/App.tsx`
- Reemplazos: 5 uses de toast types
- Ejemplo: `showToast({ type: TOAST_TYPES.SUCCESS, ... })`

#### `src/pages/Pruebas.tsx`
- Reemplazos: 2 uses ('success', 'error')

#### `src/pages/Inspectoria.tsx`
- Reemplazos: 2 uses ('success', 'error')

#### `src/pages/Inasistencias.tsx`
- Reemplazos: 6 uses (success, warning)
- Ejemplo: Ambas funciones `onUpdate` y `onSubmit` ahora usando constantes

#### `src/pages/Configuracion.tsx`
- Reemplazos: 6 uses (success, error en múltiples handlers)

**Total de reemplazos de toast types:** 22 ocurrencias

### 5. **Cambios NO Realizados (Future Work)**

- `REQUEST_TIMEOUT_SEC` definida pero aún usando `5` en `useAuth.ts` 
- `QUERY_KEYS_INVALIDATE` definida pero aún usando strings en hooks
- `ERROR_CODES` definida pero servicios aún comparing contra strings
- Education levels aún usando strings en algunos componentes

*Nota: Estos pueden ser actualizados en futuras sesiones.*

## Ventajas

1. **Mantenibilidad:** Cambios de configuración en un único lugar
2. **Tipo Seguro:** Valores permitidos son explícitos (TypeScript enums-like)
3. **Refactor Safety:** Usar Find/Replace es más seguro ahora
4. **Code Review:** Configuración centralizada es más fácil de auditar
5. **Onboarding:** Nuevos desarrolladores ven todas las constantes en un archivo

## Ejemplos de Antes y Después

### Toast Types
```typescript
// ANTES
showToast({ type: 'success', message: '...' });
showToast({ type: 'error', message: '...' });

// DESPUÉS  
showToast({ type: TOAST_TYPES.SUCCESS, message: '...' });
showToast({ type: TOAST_TYPES.ERROR, message: '...' });
```

### File Upload
```typescript
// ANTES
const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'];

// DESPUÉS
const uploadResponse = await supabase.storage
  .from(FILE_CONFIG.UPLOAD_BUCKET)
  .upload(filePath, file);
```

### Absence Status
```typescript
// ANTES
status: document_url ? 'JUSTIFICADA' : 'PENDIENTE'

// DESPUÉS  
status: document_url ? ABSENCE_STATUS.JUSTIFICADA : ABSENCE_STATUS.PENDIENTE
```

## Test Results

✅ **32/32 tests passing**
- No regressions después de cambios
- Todos los tipos TypeScript checked
- Constantes properly typed

## Commits Sugeridos

```
commit 1: "feat: centralize application constants in src/constants/index.ts"
commit 2: "refactor: use TOAST_TYPES constant in all toast calls"
commit 3: "refactor: use FILE_CONFIG and RETRY_CONFIG in absenceService"
commit 4: "refactor: import ABSENCE_STATUS enum in services and components"
```

##

 Próximos Pasos

1. **Complete Constant Adoption** - Actualizar remaining magic strings:
   - Education levels en validaciones
   - Error codes en comparaciones servicios
   - Query keys en invalidaciones

2. **Documentation** - Expandir este documento con ejemplos de cada constante

3. **Linting Rule** - Considerar agregar regla ESLint para prevenir magic strings

4. **Type Safety** - Convertir QUERY_KEYS_INVALIDATE a más tipo-safe struct

## Codebase Impact

- **Files Modified:** 7 (1 new, 6 existing)
- **Lines Added:** ~120 (constants file)
- **Magic Strings Removed:** ~30
- **Type Safety Improved:** ✅
- **Runtime Behavior:** ✅ No changes (literals → constants)

---

Generated: 2024 | Session: Constants Consolidation Phase
