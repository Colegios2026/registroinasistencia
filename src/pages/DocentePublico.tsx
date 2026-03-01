import React from 'react';
import { Calendar, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { useTeacherPublicAbsences, TeacherPublicAbsence, useTeacherPublicAbsenceDetail } from '../hooks/queries';
import { useCourses } from '../hooks/queries';
import { Modal, Button, Badge, EmptyState, PageHeader, Select, TableSkeleton } from '../components/ui';
import { formatDate } from '../utils';
import { MONTHS, getYearOptions, getCourseOptions } from '../utils/filterOptions';

interface DocentePublicoProps {
  level: 'BASICA' | 'MEDIA';
}

export const DocentePublico: React.FC<DocentePublicoProps> = ({ level }) => {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [selectedCourseId, setSelectedCourseId] = React.useState('');
  const [selected, setSelected] = React.useState<TeacherPublicAbsence | null>(null);
  const [isOpen, setIsOpen] = React.useState(false);

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  const { data = [], isLoading, isFetching } = useTeacherPublicAbsences(month, year, level, selectedCourseId || undefined);
  const { data: selectedTests = [], isLoading: selectedTestsLoading } = useTeacherPublicAbsenceDetail(selected?.absence_id);
  const { data: courses = [], isLoading: coursesLoading } = useCourses(level);

  React.useEffect(() => {
    setSelectedCourseId('');
  }, [level]);

  const loading = isLoading || coursesLoading;
  const showInitialSkeleton = loading && data.length === 0;
  const courseOptions = React.useMemo(() => getCourseOptions(courses), [courses]);

  return (
    <div className="space-y-10">
      <PageHeader
        title="Vista Docente"
        description={`Lectura pública de inasistencias y pruebas afectadas (${level === 'BASICA' ? 'Básica' : 'Media'}).`}
        breadcrumbs={[{ label: 'Vista Docente', active: true }]}
        action={
          <div className="flex items-center gap-3">
            <Button variant="secondary" size="icon" onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="secondary" size="icon" onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        }
        filters={
          <>
            <Select options={MONTHS} value={month} onChange={(e) => setCurrentDate(new Date(year, Number(e.target.value), 1))} className="md:w-44" />
            <Select options={getYearOptions()} value={year} onChange={(e) => setCurrentDate(new Date(Number(e.target.value), month, 1))} className="md:w-36" />
            <Select
              options={courseOptions}
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="md:w-64"
            />
          </>
        }
      />
      {isFetching && data.length > 0 ? (
        <p className="text-xs font-medium text-slate-400 -mt-6">Actualizando resultados...</p>
      ) : null}

      <div className="card overflow-hidden border border-slate-200/60 shadow-sm shadow-slate-200/20 rounded-3xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[11px] font-bold uppercase tracking-widest">
                <th className="px-6 py-4">Estudiante</th>
                <th className="px-6 py-4">Curso</th>
                <th className="px-6 py-4">Fechas</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Pruebas Afectadas</th>
                <th className="px-6 py-4 text-right">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {showInitialSkeleton ? (
                <tr><td colSpan={6} className="px-6 py-12"><TableSkeleton /></td></tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12">
                    <EmptyState title="Sin resultados" description="No hay inasistencias públicas para el período seleccionado." />
                  </td>
                </tr>
              ) : data.map((row) => (
                <tr key={row.absence_id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-5 font-bold text-slate-900">{row.student_name}</td>
                  <td className="px-6 py-5 text-sm font-semibold text-slate-600">{row.course_name}</td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                      <Calendar className="w-3.5 h-3.5 opacity-60" />
                      {formatDate(row.start_date)} - {formatDate(row.end_date)}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <Badge variant={row.status === 'JUSTIFICADA' ? 'success' : 'warning'}>{row.status}</Badge>
                  </td>
                  <td className="px-6 py-5 text-sm font-bold text-rose-600">{row.affected_tests_count}</td>
                  <td className="px-6 py-5 text-right">
                    <Button variant="ghost" size="sm" icon={Eye} onClick={() => { setSelected(row); setIsOpen(true); }}>
                      Ver
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Detalle de Inasistencia" size="lg">
        {!selected ? null : (
          <div className="space-y-5">
            <div className="text-sm text-slate-500">
              <p><span className="font-bold text-slate-700">Estudiante:</span> {selected.student_name}</p>
              <p><span className="font-bold text-slate-700">Curso:</span> {selected.course_name}</p>
              <p><span className="font-bold text-slate-700">Fechas:</span> {formatDate(selected.start_date)} - {formatDate(selected.end_date)}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase mb-2">Observación</p>
              <div className="p-4 bg-white border border-slate-200 rounded-xl text-slate-700 text-sm">
                {selected.observation || 'Sin observación registrada.'}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase mb-2">Pruebas Afectadas ({selected.affected_tests_count})</p>
              {selectedTestsLoading ? (
                <p className="text-sm text-slate-400">Cargando detalle...</p>
              ) : selectedTests.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedTests.map((test) => (
                    <div key={test.id} className="bg-rose-50 p-3 rounded-lg border border-rose-100 text-sm">
                      <div className="font-bold text-slate-800">{test.subject}</div>
                      <div className="text-rose-600 font-medium">{test.type} - {formatDate(test.date)}</div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-slate-400">No hay pruebas afectadas.</p>}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
