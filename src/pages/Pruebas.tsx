import React from 'react';
import { Plus, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { useTests, useCourses, useHolidays, Holiday, useCreateTest } from '../hooks/queries';
import CalendarioPlazosLegales from '../components/CalendarioPlazosLegales';
import { useToast } from '../contexts/ToastContext';
import { useQueryClient } from '@tanstack/react-query';
import { Course, Test, TestInsert } from '../types';
import { Modal, Button, PageHeader, Select, TableSkeleton, FormError, Input } from '../components/ui';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TOAST_TYPES, QUERY_KEYS_INVALIDATE } from '../constants';
import { testValidationSchema } from '../lib/validators';
import { createMutationGuard } from '../utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

type TestFormValues = {
  course_id: string;
  date: string;
  subject: string;
  type: string;
  description?: string;
};

interface PruebasProps {
  level: 'BASICA' | 'MEDIA';
}

export const Pruebas: React.FC<PruebasProps> = ({ level }) => {
  const [uiState, patchUiState] = React.useReducer(
    (
      state: {
        isModalOpen: boolean;
        viewMode: 'calendar' | 'table';
        currentDate: Date;
        filters: { courseId: string };
        selectedDate: string | null;
      },
      patch: Partial<{
        isModalOpen: boolean;
        viewMode: 'calendar' | 'table';
        currentDate: Date;
        filters: { courseId: string };
        selectedDate: string | null;
      }>
    ) => ({ ...state, ...patch }),
    {
      isModalOpen: false,
      viewMode: 'calendar',
      currentDate: new Date(),
      filters: { courseId: '' },
      selectedDate: null,
    }
  );
  const { isModalOpen, viewMode, currentDate, filters, selectedDate } = uiState;

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  const { data: tests = [] as Test[], isLoading: loadingTests } = useTests(filters.courseId || undefined, month, year, level);
  const testsWithCourse = tests as (Test & { courses?: Course | null })[];
  const { data: holidays = [] as Holiday[] } = useHolidays(month, year);
  const { data: courses = [] as Course[] } = useCourses(level);
  const loading = loadingTests;

  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const createTestM = useCreateTest();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<TestFormValues>({
    resolver: zodResolver(testValidationSchema),
    mode: 'onBlur'
  });

  const onSubmit = async (data: TestFormValues) => {
    if (!createMutationGuard(createTestM.isLoading, () => showToast({ type: TOAST_TYPES.WARNING, message: 'Ya se está procesando una creación de prueba' }))) {
      return;
    }
    try {
      const payload: TestInsert = {
        course_id: data.course_id,
        date: data.date,
        description: data.description && data.description.trim() !== '' ? data.description : null,
        subject: data.subject,
        type: data.type,
      };

      await createTestM.mutateAsync(payload);
      patchUiState({ isModalOpen: false });
      reset();
      showToast({ type: TOAST_TYPES.SUCCESS, message: 'Prueba creada exitosamente' });
      // Invalidar TODAS las queries de pruebas para asegurar actualización
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS_INVALIDATE.TESTS });
    } catch (error) {
      console.error(error);
      showToast({ type: TOAST_TYPES.ERROR, message: 'Error al crear la prueba' });
    }
  };

  const prevMonth = () => patchUiState({ currentDate: new Date(year, month - 1, 1) });
  const nextMonth = () => patchUiState({ currentDate: new Date(year, month + 1, 1) });

  const courseOptions = [
    { value: '', label: 'Todos los Cursos' },
    ...courses.map((c: Course) => ({ value: c.id, label: c.name }))
  ];

  const testTypes = [
    { value: 'Prueba Coeficiente 1', label: 'Prueba Coeficiente 1' },
    { value: 'Prueba Coeficiente 2', label: 'Prueba Coeficiente 2' },
    { value: 'Control', label: 'Control' },
    { value: 'Trabajo Práctico', label: 'Trabajo Práctico' },
    { value: 'Exposición', label: 'Exposición' }
  ];

  return (
    <div className="space-y-10">
      <PageHeader
        title="Calendario de Evaluaciones"
        description={`Planificación de pruebas y controles para Educación ${level === 'BASICA' ? 'Básica' : 'Media'}.`}
        breadcrumbs={[{ label: 'Evaluaciones', active: true }]}
        action={
          <div className="flex items-center gap-3">
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/50">
              <button
                onClick={() => patchUiState({ viewMode: 'calendar' })}
                className={`px-4 py-2 text-xs font-bold rounded-lg ${viewMode === 'calendar' ? 'bg-white text-indigo-600' : 'text-slate-500'}`}
                aria-pressed={viewMode === 'calendar'}
                aria-label="Ver evaluaciones en calendario"
              >
                Calendario
              </button>
              <button
                onClick={() => patchUiState({ viewMode: 'table' })}
                className={`px-4 py-2 text-xs font-bold rounded-lg ${viewMode === 'table' ? 'bg-white text-indigo-600' : 'text-slate-500'}`}
                aria-pressed={viewMode === 'table'}
                aria-label="Ver evaluaciones en tabla"
              >
                Lista
              </button>
            </div>
            <Button data-testid="open-create-test" onClick={() => patchUiState({ isModalOpen: true })} icon={Plus}>Nueva Prueba</Button>
          </div>
        }
        filters={
          <>
            <div className="flex items-center gap-4">
              <Button variant="secondary" size="icon" onClick={prevMonth} className="rounded-xl" aria-label="Mes anterior"><ChevronLeft className="w-5 h-5" /></Button>
              <div className="text-2xl font-bold text-slate-900 min-w-[150px] text-center capitalize">{format(currentDate, 'MMMM yyyy', { locale: es })}</div>
              <Button variant="secondary" size="icon" onClick={nextMonth} className="rounded-xl" aria-label="Mes siguiente"><ChevronRight className="w-5 h-5" /></Button>
            </div>
            <div className="flex-1" />
            <Select aria-label="Filtrar evaluaciones por curso" options={courseOptions} value={filters.courseId} onChange={(e) => patchUiState({ filters: { ...filters, courseId: e.target.value } })} className="md:w-64" />
          </>
        }
      />

      {courses.length === 0 && !loading && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-center gap-4 text-amber-800">
            <Info className="w-6 h-6 text-amber-500" />
            <div>
              <p className="font-bold">No se encontraron cursos para el nivel {level === 'BASICA' ? 'Básica' : 'Media'}.</p>
              <p className="text-sm">Por favor, verifique la configuración o cargue los datos de demostración en la sección de Configuración.</p>
            </div>
            {loadingTests && (
              <div className="absolute inset-0 bg-white/70 rounded-[2.5rem] flex items-center justify-center z-40">
                <div className="text-center">
                  <svg className="animate-spin h-10 w-10 mx-auto text-indigo-600" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <div className="mt-3 text-sm font-semibold text-slate-700">Cargando pruebas...</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Calendar */}
      <div className={`${viewMode === 'table' ? 'hidden' : ''} sm:block`}> 
        {viewMode === 'calendar' && (
          <div className="max-w-7xl mx-auto">
            <CalendarioPlazosLegales
              tests={testsWithCourse}
              holidays={holidays}
              currentDate={currentDate}
              selectedDate={selectedDate}
              setSelectedDate={(date) => patchUiState({ selectedDate: date })}
              onPrev={() => patchUiState({ currentDate: new Date(year, month - 1, 1) })}
              onNext={() => patchUiState({ currentDate: new Date(year, month + 1, 1) })}
            />
          </div>
        )}
      </div>

      {/* Table view for small screens */}
      <div className={viewMode === 'table' ? 'block' : 'hidden'}>
        <div className="card overflow-hidden border border-slate-200/60 shadow-sm rounded-3xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[11px] font-bold uppercase tracking-widest">
                  <th className="px-6 py-4">Asignatura</th>
                  <th className="px-6 py-4">Curso</th>
                  <th className="px-6 py-4">Fecha</th>
                  <th className="px-6 py-4">Tipo</th>
                  <th className="px-6 py-4">Descripción</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12"><TableSkeleton /></td>
                  </tr>
                ) : (
                  testsWithCourse.map((t) => (
                    <tr key={t.id}>
                      <td className="px-6 py-4">{t.subject}</td>
                      <td className="px-6 py-4">{t.courses?.name ?? '-'}</td>
                      <td className="px-6 py-4">{format(new Date(t.date), 'dd/MM/yyyy')}</td>
                      <td className="px-6 py-4">{t.type}</td>
                      <td className="px-6 py-4">{t.description ?? ''}</td>
                      <td className="px-6 py-4 text-right">-</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal testId="modal-create-test" isOpen={isModalOpen} onClose={() => patchUiState({ isModalOpen: false })} title="Programar Nueva Prueba">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Select data-testid="create-test-course" label="Curso" options={courseOptions} {...register('course_id', { required: 'Curso requerido' })} />
              <FormError error={errors.course_id} />
            </div>

            <div>
              <input data-testid="create-test-date" type="date" {...register('date', { required: 'La fecha es requerida' })} className="w-full" />
              <FormError error={errors.date} />
            </div>
          </div>

          <div>
            <Input data-testid="create-test-subject" label="Asignatura" {...register('subject', { required: 'Asignatura requerida' })} />
            <FormError error={errors.subject} />
          </div>

          <div>
            <Select data-testid="create-test-type" label="Tipo de Evaluación" options={testTypes} {...register('type', { required: 'El tipo de evaluación es requerido' })} />
            <FormError error={errors.type} />
          </div>

          <div className="space-y-2">
            {/* TODO: Re-enable IA-assisted description suggestion button when Gemini integration is approved again. */}
            <label htmlFor="create-test-description" className="text-sm font-bold text-slate-700 ml-1">Descripción / Contenidos (Opcional)</label>
            <textarea id="create-test-description" data-testid="create-test-desc" {...register('description')} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 min-h-[100px]" placeholder="Contenidos a evaluar..." />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" data-testid="create-test-cancel" onClick={() => patchUiState({ isModalOpen: false })}>Cancelar</Button>
            <Button data-testid="create-test-submit" type="submit" loading={loading}>Programar Prueba</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
