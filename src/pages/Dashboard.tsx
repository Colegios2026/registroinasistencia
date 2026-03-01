import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Download,
  Filter
} from 'lucide-react';
import { Course, AbsenceWithDetails, Test } from '../types';
import { useAbsences, useCourses } from '../hooks/queries';
import { formatDate } from '../utils';
import { Button, Badge, PageHeader, Select, StatCard, Modal } from '../components/ui';
import { DashboardAbsencesTable } from './DashboardAbsencesTable';
// jsPDF is large — dynamically import in exportToPDF to avoid bundling in main chunk

interface DashboardProps {
  level: 'BASICA' | 'MEDIA';
}

interface DashboardDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAbsence: AbsenceWithDetails | null;
  courses: Course[];
}

const DashboardDetailModal: React.FC<DashboardDetailModalProps> = ({ isOpen, onClose, selectedAbsence, courses }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalle de Inasistencia"
      size="lg"
    >
      {selectedAbsence && (
        <div className="space-y-6">
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold text-lg shadow-sm border border-slate-100">
              {selectedAbsence.student.full_name.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-slate-900">{selectedAbsence.student.full_name}</h3>
              <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">{courses.find(c => c.id === selectedAbsence.student.course_id)?.name || 'N/A'} • RUT: {selectedAbsence.student.rut || 'N/A'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-xs font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Periodo
              </div>
              <div className="text-sm font-bold text-slate-700">{formatDate(selectedAbsence.start_date)} al {formatDate(selectedAbsence.end_date)}</div>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-xs font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Estado
              </div>
              <Badge variant={selectedAbsence.status === 'JUSTIFICADA' ? 'success' : 'warning'} className="mt-1">
                {selectedAbsence.status}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase">Observación</p>
            <div className="p-4 bg-white border border-slate-200 rounded-xl text-slate-700 text-sm leading-relaxed italic">
              {selectedAbsence.observation || 'Sin observación registrada.'}
            </div>
          </div>

          {selectedAbsence.document_url && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-400 uppercase">Documento Adjunto</p>
              <a 
                href={selectedAbsence.document_url} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl text-blue-700 hover:bg-blue-100 transition-colors"
              >
                <FileText className="w-5 h-5" />
                <span className="font-bold text-sm">Ver Certificado / Justificativo</span>
                <Download className="w-4 h-4 ml-auto" />
              </a>
            </div>
          )}

          {selectedAbsence.affected_tests && selectedAbsence.affected_tests.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-400 uppercase">Pruebas Afectadas ({selectedAbsence.affected_tests.length})</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedAbsence.affected_tests.map((test: Test) => (
                  <div key={test.id} className="bg-rose-50 p-3 rounded-lg border border-rose-100 text-sm">
                    <div className="font-bold text-slate-800">{test.subject}</div>
                    <div className="text-rose-600 font-medium">{test.type} - {formatDate(test.date)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

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

export const Dashboard: React.FC<DashboardProps> = ({ level }) => {
  // use query results directly; avoid mirroring query data in local state
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedAbsence, setSelectedAbsence] = useState<AbsenceWithDetails | null>(null);
  const [filters, setFilters] = useState({
    courseId: '',
    status: '',
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
    onlyWithTests: false,
    onlyWithoutDoc: false
  });
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // derive date range for queries
  const startDate = new Date(filters.year, filters.month, 1).toISOString().split('T')[0];
  const endDate = new Date(filters.year, filters.month + 1, 0).toISOString().split('T')[0];

  const { data: absences = [], isLoading: loadingAbsences } = useAbsences(level, startDate, endDate);
  const { data: coursesFromQuery = [], isLoading: loadingCourses } = useCourses(level);

  const loading = loadingAbsences || loadingCourses;

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ].map((m, i) => ({ value: i, label: m }));

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i)
    .map(y => ({ value: y, label: y.toString() }));

  const courseOptions = [
    { value: '', label: 'Todos los Cursos' },
    ...coursesFromQuery.map(c => ({ value: c.id, label: c.name }))
  ];

  const statusOptions = [
    { value: '', label: 'Todos los Estados' },
    { value: 'PENDIENTE', label: 'Pendiente' },
    { value: 'JUSTIFICADA', label: 'Justificada' }
  ];

  const filteredAbsences = absences.filter((abs: AbsenceWithDetails) => {
    if (filters.courseId && abs.student.course_id !== filters.courseId) return false;
    if (filters.status && abs.status !== filters.status) return false;
    if (filters.onlyWithTests && (!abs.affected_tests || abs.affected_tests.length === 0)) return false;
    if (filters.onlyWithoutDoc && abs.document_url) return false;
    return true;
  });

  const stats = {
    total: absences.length,
    justified: absences.filter((a: AbsenceWithDetails) => a.status === 'JUSTIFICADA').length,
    pending: absences.filter((a: AbsenceWithDetails) => a.status === 'PENDIENTE').length,
    withTests: absences.filter((a: AbsenceWithDetails) => a.affected_tests && a.affected_tests.length > 0).length
  };

  const toggleRow = (id: string) => {
    const newSet = new Set(expandedRows);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedRows(newSet);
  };

  const handleViewDetail = (abs: AbsenceWithDetails) => {
    setSelectedAbsence(abs);
    setIsDetailModalOpen(true);
  };

  const exportToPDF = async () => {
    try {
      const [{ default: jsPDF }, autoTableModule] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable')
      ]);
      const maybeDefault = (autoTableModule as { default?: unknown }).default;
      const autoTableFn = (typeof maybeDefault === 'function'
        ? maybeDefault
        : typeof autoTableModule === 'function'
          ? autoTableModule
          : null) as ((doc: InstanceType<typeof jsPDF>, options: Record<string, unknown>) => void) | null;

      if (!autoTableFn) {
        throw new Error('No se pudo cargar jspdf-autotable correctamente');
      }

      const doc = new jsPDF();
      doc.text('Reporte de Inasistencias y Pruebas Afectadas', 14, 15);

      const tableData = filteredAbsences.map((abs: AbsenceWithDetails) => [
        abs.student.full_name,
        coursesFromQuery.find(c => c.id === abs.student.course_id)?.name || 'N/A',
        `${formatDate(abs.start_date)} - ${formatDate(abs.end_date)}`,
        abs.status,
        abs.affected_tests?.map((t: Test) => `${t.subject} (${formatDate(t.date)})`).join(', ') || 'Ninguna'
      ]);

      autoTableFn(doc, {
        head: [['Estudiante', 'Curso', 'Fechas', 'Estado', 'Pruebas Afectadas']],
        body: tableData,
        startY: 25,
      });

      doc.save('inasistencias_reporte.pdf');
    } catch (err) {
      console.error('Error generating PDF', err);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <PageHeader 
        title="Panel Informativo"
        description={`Resumen ejecutivo de inasistencias y evaluaciones para Educación ${level === 'BASICA' ? 'Básica' : 'Media'}.`}
        breadcrumbs={[{ label: 'Dashboard', active: true }]}
        action={
          <Button onClick={exportToPDF} icon={Download} variant="secondary">
            Exportar Reporte PDF
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard 
          title="Total Inasistencias" 
          value={stats.total} 
          icon={Users} 
          color="blue" 
        />
        <StatCard 
          title="Justificadas" 
          value={stats.justified} 
          icon={CheckCircle2} 
          color="emerald" 
        />
        <StatCard 
          title="Pendientes" 
          value={stats.pending} 
          icon={AlertCircle} 
          color="amber" 
        />
        <StatCard 
          title="Con Pruebas Afectadas" 
          value={stats.withTests} 
          icon={FileText} 
          color="rose" 
        />
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm shadow-slate-200/20 space-y-8">
        <div className="flex items-center gap-2.5 text-slate-400">
          <Filter className="w-4 h-4" />
          <span className="text-[11px] font-bold uppercase tracking-widest">Filtros Avanzados</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Select 
            options={months}
            value={filters.month}
            onChange={(e) => setFilters({...filters, month: parseInt(e.target.value)})}
          />
          <Select 
            options={years}
            value={filters.year}
            onChange={(e) => setFilters({...filters, year: parseInt(e.target.value)})}
          />
          <Select 
            options={courseOptions}
            value={filters.courseId}
            onChange={(e) => setFilters({...filters, courseId: e.target.value})}
          />
          <Select 
            options={statusOptions}
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
          />
        </div>

        <div className="flex flex-wrap gap-8 pt-2">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input 
              type="checkbox" 
              className="w-5 h-5 rounded-lg border-slate-300 text-indigo-600 focus:ring-indigo-500 transition-all cursor-pointer"
              checked={filters.onlyWithTests}
              onChange={(e) => setFilters({...filters, onlyWithTests: e.target.checked})}
            />
            <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Solo con pruebas afectadas</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer group">
            <input 
              type="checkbox" 
              className="w-5 h-5 rounded-lg border-slate-300 text-indigo-600 focus:ring-indigo-500 transition-all cursor-pointer"
              checked={filters.onlyWithoutDoc}
              onChange={(e) => setFilters({...filters, onlyWithoutDoc: e.target.checked})}
            />
            <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Sin documento adjunto</span>
          </label>
        </div>
      </div>

      <DashboardAbsencesTable
        absences={filteredAbsences}
        courses={coursesFromQuery}
        loading={loading}
        expandedRows={expandedRows}
        onToggleRow={toggleRow}
        onViewDetail={handleViewDetail}
      />

      <DashboardDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        selectedAbsence={selectedAbsence}
        courses={coursesFromQuery}
      />
    </div>
  );
};
