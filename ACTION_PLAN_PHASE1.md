# Plan de Acción - Fase 1 (Críticos)
## Transformar Arquitectura a Enterprise-Grade

Duración Estimada: 8 horas  
Prioridad: 🔴 BLOQUEANTE para producción

---

## TAREA 1: Tipar Mutations Correctamente [2h]
### Ubicación: `src/hooks/queries.ts`

**Problema Actual:**
```typescript
// ❌ Casts injustificados
export const useCreateInspectorateRecord = () => {
  const qc = useQueryClient();
  const mutationFn = (...) => inspectorateService.createInspectorateRecord(...);
  return (useMutation as any)(mutationFn, { ... }); // ← any cast
};
```

**Solución:**
✅ Crear tipos genéricos reutilizables  
✅ Tipar `useMutation<TData, TError, TVariables>`  
✅ Eliminar casts injustificados  

**Archivos a Modificar:**
1. `src/hooks/queries.ts` (refactor completo)
2. `src/types.ts` (agregar tipos de mutación)

**Estimado:**
- Crear tipos: 30 min
- Refactor hooks: 60 min
- Testing/validación: 30 min

---

## TAREA 2: Implementar Toast/Error Center [3h]
### Ubicación: Nueva carpeta `src/contexts/` y `src/components/ui/Toast.tsx`

**Problema Actual:**
```typescript
// ❌ Alerts no profesionales
alert('Datos cargados exitosamente.');
alert('Error al cargar datos: ...');
```

**Solución:**
✅ Context centralizado para notificaciones  
✅ Toast UI profesional  
✅ Integración con mutaciones  

**Archivos a Crear:**
1. `src/contexts/ToastContext.tsx`
2. `src/components/ui/Toast.tsx`
3. `src/components/ui/ToastContainer.tsx`

**Estimado:**
- Contexto: 45 min
- Componentes: 75 min
- Integración en pages: 60 min

---

## TAREA 3: Eliminar Anti-patrones Data Fetching [1.5h]
### Ubicación: `src/App.tsx` y validaciones en hooks

**Problema Actual:**
```typescript
// ❌ Prefetch que ignora React Query cache
useEffect(() => {
  courseService.getCourses(level).catch(console.error);
}, [level]);
```

**Solución:**
✅ Eliminar prefetch manual  
✅ Dejar que React Query maneje caché  
✅ Opcional: agregar staleTime  

**Archivos a Modificar:**
1. `src/App.tsx` (eliminar useEffect)
2. `src/hooks/queries.ts` (ajustar staleTime si es necesario)

**Estimado:**
- Análisis: 20 min
- Modificación: 30 min
- Testing: 20 min

---

## TAREA 4: Validaciones con Zod [2h]
### Ubicación: `src/lib/` y actualizar páginas

**Problema Actual:**
```typescript
// ❌ Validación mínima
const { register } = useForm<Omit<Test, 'id' | 'created_at'>>();
// Solo 'required: true'
```

**Solución:**
✅ Schema Zod para cada tipo de forma  
✅ Validación serverside-ready  
✅ Mensajes de error localizados  

**Archivos a Crear:**
1. `src/lib/validators/test.ts`
2. `src/lib/validators/absence.ts`
3. `src/lib/validators/inspectorate.ts`

**Archivos a Actualizar:**
- `src/pages/Pruebas.tsx`
- `src/pages/Inasistencias.tsx`
- `src/pages/Inspectoria.tsx`

**Estimado:**
- Schemas: 45 min
- Integración: 45 min
- Testing: 30 min

---

## CHECKLIST DE EJECUCIÓN

### Día 1 - Mañana (4h)
- [ ] Crear tipos de mutación en `src/types.ts`
- [ ] Refactor `useCreateInspectorateRecord` con tipos
- [ ] Testing básico de tipage
- [ ] Commit: "refactor: type mutations correctly"

### Día 1 - Tarde (4h)
- [ ] Crear sistema de Toast
- [ ] Integrar en primeras 2 páginas
- [ ] Validaciones Zod en Pruebas.tsx
- [ ] Eliminar prefetch anti-patrón de App.tsx

### Validación Post-Ejecución
```bash
# Debe pasar sin errores:
npx tsc --noEmit

# Revisar que no quedan casts 'as any' injustificados:
grep -r "as any" src/ | wc -l  # Debe ser ≤ 2 (solo en interfaces externas)

# Tests básicos:
npm run dev
# Verificar que:
# - Toast aparece al crear registro
# - Sin errors en consola
# - Tabla se actualiza automáticamente
```

---

## MÉTRICAS DE ÉXITO

| Métrica | Antes | Después | ✅ |
|---------|-------|---------|-------|
| Ocurrencias `any` | 17 | ≤ 2 | |
| URLs de error | Nunca | Siempre | |
| TypeScript errors | 0 | 0 | |
| Mutation type safety | 0% | 100% | |

---

**Próximo: Fase 2 comienza después de validar Fase 1**
