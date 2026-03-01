import React from 'react';
import { Search, Calendar, ShieldAlert, ChevronRight, User } from 'lucide-react';
import { Course, Absence, InspectorateRecord, Student } from '../types';
import { useStudents, useCourses, useStudentDetails } from '../hooks/queries';
import { formatDate, cn } from '../utils';
import { Modal, Button, Badge, EmptyState, PageHeader, Input, Select, TableSkeleton } from '../components/ui';

interface EstudiantesProps {
  level: 'BASICA' | 'MEDIA';
}

export const Estudiantes: React.FC<EstudiantesProps> = ({ level }) => {

  const [uiState, patchUiState] = React.useReducer(
    (
      state: {
        selectedCourse: string;
        searchQuery: string;
        selectedStudent: Student | null;
        isModalOpen: boolean;
        activeTab: 'absences' | 'records';
      },
      patch: Partial<{
        selectedCourse: string;
        searchQuery: string;
        selectedStudent: Student | null;
        isModalOpen: boolean;
        activeTab: 'absences' | 'records';
      }>
    ) => ({ ...state, ...patch }),
    {
      selectedCourse: '',
      searchQuery: '',
      selectedStudent: null,
      isModalOpen: false,
      activeTab: 'absences',
    }
  );

  const { selectedCourse, searchQuery, selectedStudent, isModalOpen, activeTab } = uiState;

  // Use React Query hooks for data fetching
  const { data: studentsFromQuery = [], isLoading: studentsLoading } = useStudents(selectedCourse || undefined, level);
  const { data: coursesFromQuery = [], isLoading: coursesLoading } = useCourses(level);
  const loading = studentsLoading || coursesLoading;

  const students = studentsFromQuery as Student[];
  const courses = coursesFromQuery as Course[];

  const filteredStudents = students.filter(student => {
    const studentCourseId = student.course_id || '';
    const matchesCourse = selectedCourse === '' || studentCourseId === selectedCourse;
    const name = student.full_name || '';
    const rut = student.rut || '';
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         rut.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCourse && matchesSearch;
  });

  const handleViewDetails = (student: Student) => {
    patchUiState({ selectedStudent: student, isModalOpen: true });
  };

  const { data: studentDetailsFromQuery = { absences: [], records: [] }, isLoading: studentDetailsLoading } = useStudentDetails(selectedStudent?.id || undefined);

  const courseOptions = [
    { value: '', label: 'Todos los Cursos' },
    ...courses.map(c => ({ value: c.id, label: c.name }))
  ];

  return (
    <div className="space-y-10">
      <PageHeader 
        title="Gestión de Estudiantes"
        description={`Listado completo de alumnos para Educación ${level === 'BASICA' ? 'Básica' : 'Media'}.`}
        breadcrumbs={[{ label: 'Estudiantes', active: true }]}
        filters={
          <>
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar por nombre o RUT..." 
                value={searchQuery}
                onChange={(e) => patchUiState({ searchQuery: e.target.value })}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all"
              />
            </div>
            <Select 
              options={courseOptions}
              value={selectedCourse}
              onChange={(e) => patchUiState({ selectedCourse: e.target.value })}
              className="md:w-56"
            />
            {(selectedCourse || searchQuery) && (
              <Button variant="ghost" size="sm" onClick={() => { patchUiState({ selectedCourse: '', searchQuery: '' }); }} className="font-bold text-slate-400 hover:text-indigo-600">
                Limpiar
              </Button>
            )}
          </>
        }
      />

      <div className="card overflow-hidden border border-slate-200/60 shadow-sm shadow-slate-200/20 rounded-3xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[11px] font-bold uppercase tracking-widest">
                <th className="px-6 py-4">Estudiante</th>
                <th className="px-6 py-4">Curso</th>
                <th className="px-6 py-4">RUT</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12"><TableSkeleton /></td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12">
                    <EmptyState 
                      title="No se encontraron estudiantes" 
                      description="Intenta con otro término de búsqueda o curso."
                    />
                  </td>
                </tr>
              ) : filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-bold text-sm border border-indigo-100/50 shadow-sm shadow-indigo-500/5 group-hover:scale-110 transition-transform duration-200">
                        {student.full_name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">{student.full_name}</div>
                        <div className="text-[11px] font-medium text-slate-400">Alumno Regular</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm font-semibold text-slate-600 bg-slate-100/50 px-2 py-1 rounded-lg border border-slate-200/50">{courses.find(c => c.id === student.course_id)?.name || 'N/A'}</span>
                  </td>
                  <td className="px-6 py-5 text-sm font-medium text-slate-500">{student.rut || 'N/A'}</td>
                  <td className="px-6 py-5 text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleViewDetails(student)} icon={ChevronRight} iconPosition="right" className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50">
                      Ver Ficha
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
        title={`Ficha del Estudiante`}
        size="xl"
      >
        <div className="space-y-6">
          <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold text-3xl shadow-sm border border-slate-100">
              {selectedStudent?.full_name.charAt(0)}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900">{selectedStudent?.full_name}</h3>
                <div className="flex items-center gap-3 mt-1">
                <Badge variant="secondary">{courses.find(c => c.id === selectedStudent?.course_id)?.name || 'N/A'}</Badge>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500 font-medium">RUT: {selectedStudent?.rut || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="flex border-b border-slate-100">
            <button 
              onClick={() => patchUiState({ activeTab: 'absences' })}
              className={cn(
                "px-8 py-4 font-bold text-sm transition-all border-b-2",
                activeTab === 'absences' ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400 hover:text-slate-600"
              )}
            >
              Inasistencias
            </button>
            <button 
              onClick={() => patchUiState({ activeTab: 'records' })}
              className={cn(
                "px-8 py-4 font-bold text-sm transition-all border-b-2",
                activeTab === 'records' ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400 hover:text-slate-600"
              )}
            >
              Atenciones Inspectoría
            </button>
          </div>

          <div className="min-h-[300px] py-2">
            {studentDetailsLoading ? (
              <div className="px-6 py-12"><TableSkeleton /></div>
            ) : activeTab === 'absences' ? (
              <div className="space-y-4">
                {!studentDetailsFromQuery?.absences.length ? (
                  <EmptyState title="Sin inasistencias" description="El estudiante no registra faltas a la fecha." />
                ) : (
                  studentDetailsFromQuery.absences.map((abs: Absence) => (
                    <div key={abs.id} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center justify-between hover:border-blue-100 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">{formatDate(abs.start_date)} - {formatDate(abs.end_date)}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{abs.observation || 'Sin observación'}</div>
                        </div>
                      </div>
                      <Badge variant={abs.status === 'JUSTIFICADA' ? 'success' : 'warning'}>
                        {abs.status}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {!studentDetailsFromQuery?.records.length ? (
                  <EmptyState title="Sin atenciones" description="No hay registros de inspectoría para este alumno." />
                ) : (
                  studentDetailsFromQuery.records.map((rec: InspectorateRecord) => (
                    <div key={rec.id} className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-blue-100 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 text-slate-900 font-bold">
                          <ShieldAlert className="w-4 h-4 text-rose-500" />
                          {formatDate(rec.date_time)}
                        </div>
                        <Badge variant="secondary">
                          {new Date(rec.date_time).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                        </Badge>
                      </div>
                      <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 italic">"{rec.observation}"</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};
