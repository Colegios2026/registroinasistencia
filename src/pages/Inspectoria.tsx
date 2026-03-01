import React from 'react';
import { Plus, ShieldAlert, Search, Calendar, Clock, User, ChevronRight } from 'lucide-react';
import { useCreateInspectorateRecord } from '../hooks/queries';
import { useToast } from '../contexts/ToastContext';
import { Course, Student } from '../types';
import { useInspectorate, useCourses, useStudents } from '../hooks/queries';
import { formatDateTime } from '../utils';
import { Modal, Button, Badge, EmptyState, PageHeader, Input, Select, TableSkeleton, FormError } from '../components/ui';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { inspectorateRecordValidationSchema } from '../lib/validators';

interface InspectoriaProps {
  level: 'BASICA' | 'MEDIA';
}

type InspectorRowView = import('../types/db').Database['public']['Tables']['inspectorate_records']['Row'] & { student: Student & { course: Course } };

interface InspectoriaDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRecord: InspectorRowView | null;
}

const InspectoriaDetailModal: React.FC<InspectoriaDetailModalProps> = ({ isOpen, onClose, selectedRecord }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalle de Atención"
      size="lg"
    >
      {selectedRecord && (
        <div className="space-y-6">
          <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-slate-500 shadow-sm border border-slate-100">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">{selectedRecord.student.full_name}</h3>
              <Badge variant="secondary" className="mt-1">{selectedRecord.student.course.name}</Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="text-xs font-bold text-slate-400 uppercase mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Fecha
              </div>
              <div className="text-sm font-bold text-slate-700">{formatDateTime(selectedRecord.date_time).split(' ')[0]}</div>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="text-xs font-bold text-slate-400 uppercase mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Hora
              </div>
              <div className="text-sm font-bold text-slate-700">{new Date(selectedRecord.date_time).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5 ml-1">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-500" /> Observación Completa
            </p>
            <div className="p-5 bg-white border border-slate-200 rounded-2xl text-slate-700 text-sm leading-relaxed italic shadow-sm">
              "{selectedRecord.observation}"
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export const Inspectoria: React.FC<InspectoriaProps> = ({ level }) => {
  type InspectorRow = InspectorRowView;
  const [uiState, patchUiState] = React.useReducer(
    (
      state: {
        mutationLoading: boolean;
        isModalOpen: boolean;
        selectedRecord: InspectorRow | null;
        isDetailModalOpen: boolean;
        filters: { courseId: string; month: number; year: number; searchQuery: string };
      },
      patch: Partial<{
        mutationLoading: boolean;
        isModalOpen: boolean;
        selectedRecord: InspectorRow | null;
        isDetailModalOpen: boolean;
        filters: { courseId: string; month: number; year: number; searchQuery: string };
      }>
    ) => ({ ...state, ...patch }),
    {
      mutationLoading: false,
      isModalOpen: false,
      selectedRecord: null,
      isDetailModalOpen: false,
      filters: {
        courseId: '',
        month: new Date().getMonth(),
        year: new Date().getFullYear(),
        searchQuery: '',
      },
    }
  );
  const { mutationLoading, isModalOpen, selectedRecord, isDetailModalOpen, filters } = uiState;
  const { showToast } = useToast();

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<{ course_id?: string; student_id: string; date_time: string; observation: string }>({
    resolver: zodResolver(inspectorateRecordValidationSchema),
    mode: 'onBlur'
  });
  const watchCourse = watch('course_id');

  // Load all records for the selected level from Supabase and filter month/year client-side.
  // This avoids missing rows caused by strict timestamptz range filtering at query time.
  const { data: records = [], isLoading: recordsLoading } = useInspectorate(level);
  const { data: courses = [], isLoading: coursesLoading } = useCourses(level);
  const { data: students = [], isLoading: studentsLoading } = useStudents(watch('course_id') || undefined, level);

  const loading = recordsLoading || coursesLoading || studentsLoading;



  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ].map((m, i) => ({ value: i, label: m }));

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i)
    .map(y => ({ value: y, label: y.toString() }));

  const courseOptions = [
    { value: '', label: 'Todos los Cursos' },
    ...courses.map((c: Course) => ({ value: c.id, label: c.name }))
  ];

  // Normalize shape coming from hook (some joins return `students` property)
  const normalizedRecords = (records as unknown as Array<InspectorRow | Record<string, unknown>>).map((r) => {
    if ('students' in r && !(r as Record<string, unknown>).hasOwnProperty('student')) {
      const rObj = r as Record<string, unknown>;
      const studentsObj = rObj['students'] as unknown as { id: string; full_name: string; course_id?: string; rut?: string; courses?: Course | Course[] };
      const normalizedCourse = Array.isArray(studentsObj.courses) ? studentsObj.courses[0] : studentsObj.courses;
      const newRest = Object.fromEntries(Object.entries(rObj).filter(([k]) => k !== 'students')) as Record<string, unknown>;
      return {
        ...(newRest as Record<string, unknown>),
        student: {
          id: studentsObj.id,
          full_name: studentsObj.full_name,
          course_id: studentsObj.course_id ?? null,
          rut: studentsObj.rut ?? null,
          course: (normalizedCourse || { id: '', name: 'Sin curso', level: null }) as Course
        }
      } as InspectorRow;
    }
    return r as InspectorRow;
  });

  const filteredRecords = (normalizedRecords as InspectorRow[]).filter((rec: InspectorRow) => {
    const studentCourseId = rec.student?.course_id ?? ((rec.student as unknown as { course?: { id?: string } })?.course?.id) ?? '';
    const matchesCourse = filters.courseId === '' || studentCourseId === filters.courseId;
    const recDate = new Date(rec.date_time);
    const matchesPeriod = recDate.getMonth() === filters.month && recDate.getFullYear() === filters.year;
    const matchesSearch = (rec.student?.full_name ?? '').toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
                         (rec.observation ?? '').toLowerCase().includes(filters.searchQuery.toLowerCase());
    return matchesCourse && matchesPeriod && matchesSearch;
  });

  const createRecord = useCreateInspectorateRecord();

  const onSubmit = async (data: { student_id: string; date_time: string; observation: string }) => {
    try {
      patchUiState({ mutationLoading: true });
      console.log('Inspectoria.onSubmit - payload', data);
      const res = await createRecord.mutateAsync({ student_id: data.student_id, date_time: data.date_time, observation: data.observation });
      console.log('Inspectoria.onSubmit - mutate result', res);
      patchUiState({ isModalOpen: false });
      reset();
      showToast({ type: 'success', message: 'Registro de inspectoría creado exitosamente' });
    } catch (error) {
      console.error('Error creating record:', error);
      const msg = error instanceof Error ? error.message : String(error);
      showToast({ type: 'error', message: `Error al crear el registro: ${msg}` });
    } finally {
      patchUiState({ mutationLoading: false });
    }
  };

  const handleViewDetail = (rec: InspectorRow) => {
    patchUiState({ selectedRecord: rec, isDetailModalOpen: true });
  };

  return (
    <div className="space-y-10">
      <PageHeader
        title="Bitácora de Inspectoría"
        description={`Registro de atenciones y situaciones de convivencia para Educación ${level === 'BASICA' ? 'Básica' : 'Media'}.`}
        breadcrumbs={[{ label: 'Inspectoría', active: true }]}
        action={
          <Button onClick={() => patchUiState({ isModalOpen: true })} icon={Plus} variant="primary">
            Nueva Atención
          </Button>
        }
        filters={
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
            <div className="lg:col-span-5">
              <Input
                placeholder="Buscar por estudiante u observación..."
                icon={<Search className="w-4 h-4" />}
                value={filters.searchQuery}
                onChange={(e) => patchUiState({ filters: { ...filters, searchQuery: e.target.value } })}
              />
            </div>
            <div className="lg:col-span-2">
              <Select
                options={months}
                value={filters.month}
                onChange={(e) => patchUiState({ filters: { ...filters, month: parseInt(e.target.value) } })}
              />
            </div>
            <div className="lg:col-span-2">
              <Select
                options={years}
                value={filters.year}
                onChange={(e) => patchUiState({ filters: { ...filters, year: parseInt(e.target.value) } })}
              />
            </div>
            <div className="lg:col-span-3">
              <Select
                options={courseOptions}
                value={filters.courseId}
                onChange={(e) => patchUiState({ filters: { ...filters, courseId: e.target.value } })}
              />
            </div>
            {(filters.courseId || filters.searchQuery) && (
              <div className="lg:col-span-12 flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { patchUiState({ filters: { ...filters, courseId: '', searchQuery: '' } }); }}
                  className="font-bold text-slate-500 hover:text-indigo-600"
                >
                  Limpiar Filtros
                </Button>
              </div>
            )}
          </div>
        }
      />

      <div className="card overflow-hidden border border-slate-200/60 shadow-sm shadow-slate-200/20 rounded-3xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[11px] font-bold uppercase tracking-widest">
                <th className="px-6 py-4">Estudiante</th>
                <th className="px-6 py-4">Fecha y Hora</th>
                <th className="px-6 py-4">Observación</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-12"><TableSkeleton /></td></tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12">
                    <EmptyState 
                      title="No se encontraron registros" 
                      description="No hay atenciones registradas para el periodo o filtros seleccionados."
                    />
                  </td>
                </tr>
              ) : filteredRecords.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-200/60 shadow-sm group-hover:scale-110 transition-transform duration-200">
                        <User className="w-5 h-5" strokeWidth={1.5} />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">{rec.student.full_name}</div>
                        <div className="text-[11px] font-medium text-slate-400">{rec.student.course.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                      <Clock className="w-4 h-4 opacity-60" strokeWidth={1.5} />
                      {formatDateTime(rec.date_time)}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-sm text-slate-500 line-clamp-1 max-w-md italic font-medium">"{rec.observation}"</p>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleViewDetail(rec)} icon={ChevronRight} iconPosition="right" className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50">
                      Ver Detalle
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => patchUiState({ isModalOpen: false })} 
        title="Registrar Atención de Inspectoría"
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Select 
                label="Curso"
                options={[{ value: '', label: 'Seleccionar curso' }, ...(courses as Course[]).map((c: Course) => ({ value: c.id, label: c.name }))]}
                {...register('course_id', { required: 'El curso es requerido' })}
              />
            </div>
            <div>
              <Select 
                label="Estudiante"
                options={[{ value: '', label: 'Seleccionar estudiante' }, ...(students as Student[]).map((s: Student) => ({ value: s.id, label: s.full_name }))]}
                {...register('student_id', { required: 'El estudiante es requerido' })}
                disabled={!watchCourse}
              />
              <FormError error={errors.student_id} />
            </div>
          </div>

          <div>
            <Input 
              label="Fecha y Hora"
              type="datetime-local"
              {...register('date_time', { required: 'La fecha y hora son requeridas' })}
            />
            <FormError error={errors.date_time} />
          </div>

          <div className="space-y-2">
            <label htmlFor="inspectoria-observation" className="text-sm font-bold text-slate-700 ml-1">Observación / Detalle</label>
            <textarea 
              id="inspectoria-observation"
              {...register('observation', { required: 'La observación es requerida' })}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 min-h-[120px] text-slate-700"
              placeholder="Describa la situación o motivo de la atención..."
            />
            <FormError error={errors.observation} />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => patchUiState({ isModalOpen: false })}>
              Cancelar
            </Button>
            <Button type="submit" loading={loading || mutationLoading}>
              Registrar Atención
            </Button>
          </div>
        </form>
      </Modal>

      <InspectoriaDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => patchUiState({ isDetailModalOpen: false })}
        selectedRecord={selectedRecord}
      />
    </div>
  );
};
