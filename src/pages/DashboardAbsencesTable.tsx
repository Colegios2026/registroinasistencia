import React from 'react';
import { Calendar, ChevronDown, ChevronUp, Eye, Download } from 'lucide-react';
import { AbsenceWithDetails, Course, Test } from '../types';
import { formatDate } from '../utils';
import { Button, Badge, TableSkeleton, EmptyState } from '../components/ui';

interface DashboardAbsencesTableProps {
  absences: AbsenceWithDetails[];
  courses: Course[];
  loading: boolean;
  expandedRows: Set<string>;
  onToggleRow: (id: string) => void;
  onViewDetail: (absence: AbsenceWithDetails) => void;
}

export const DashboardAbsencesTable: React.FC<DashboardAbsencesTableProps> = ({
  absences,
  courses,
  loading,
  expandedRows,
  onToggleRow,
  onViewDetail,
}) => {
  const toggleRow = (id: string) => {
    const newSet = new Set(expandedRows);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    onToggleRow(id);
  };

  return (
    <div className="card overflow-hidden border border-slate-200/60 shadow-sm shadow-slate-200/20 rounded-3xl">
      <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
        <h3 className="font-bold text-slate-900 tracking-tight text-lg">Inasistencias Recientes</h3>
        <Badge variant="secondary" className="bg-slate-100 text-slate-500 font-bold px-3 py-1">{absences.length} registros</Badge>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 text-slate-400 text-[11px] font-bold uppercase tracking-widest">
              <th className="px-6 py-4">Estudiante</th>
              <th className="px-6 py-4">Curso</th>
              <th className="px-6 py-4">Fechas</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4">Pruebas Afectadas</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12"><TableSkeleton /></td>
              </tr>
            ) : absences.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12">
                  <EmptyState 
                    title="No se encontraron inasistencias" 
                    description="Prueba ajustando los filtros para ver más resultados."
                  />
                </td>
              </tr>
            ) : absences.map((abs: AbsenceWithDetails) => (
              <React.Fragment key={abs.id}>
                <tr className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="font-bold text-slate-900 tracking-tight">{abs.student.full_name}</div>
                    <div className="text-[11px] font-medium text-slate-400">RUT: {abs.student.rut || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm font-semibold text-slate-600 bg-slate-100/50 px-2 py-1 rounded-lg border border-slate-200/50">{courses.find(c => c.id === abs.student.course_id)?.name || 'N/A'}</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                      <Calendar className="w-3.5 h-3.5 opacity-60" strokeWidth={1.5} />
                      {formatDate(abs.start_date)} - {formatDate(abs.end_date)}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <Badge variant={abs.status === 'JUSTIFICADA' ? 'success' : 'warning'}>
                      {abs.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-5">
                    {abs.affected_tests && abs.affected_tests.length > 0 ? (
                      <button 
                        onClick={() => toggleRow(abs.id)}
                        className="flex items-center gap-2 text-rose-600 font-bold text-xs hover:text-rose-700 transition-colors uppercase tracking-wider"
                      >
                        {abs.affected_tests.length} prueba(s)
                        {expandedRows.has(abs.id) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    ) : (
                      <span className="text-slate-300 text-xs font-medium italic">Ninguna</span>
                    )}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" icon={Eye} onClick={() => onViewDetail(abs)} className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50">
                        Ver
                      </Button>
                      {abs.document_url && (
                        <Button variant="ghost" size="sm" icon={Download} onClick={() => window.open(abs.document_url!, '_blank')} className="text-slate-400 hover:text-emerald-600 hover:bg-emerald-50">
                          Doc
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
                {expandedRows.has(abs.id) && (
                  <tr className="bg-rose-50/20">
                    <td colSpan={6} className="px-6 py-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {abs.affected_tests?.map((test: Test) => (
                          <div key={test.id} className="bg-white p-4 rounded-2xl border border-rose-100 shadow-sm shadow-rose-500/5">
                            <div className="text-[10px] font-bold text-rose-600 uppercase tracking-widest mb-1">{test.subject}</div>
                            <div className="text-sm font-bold text-slate-800 tracking-tight">{test.type}</div>
                            <div className="text-[11px] font-medium text-slate-400 mt-1.5 flex items-center gap-1.5">
                              <Calendar className="w-3 h-3" />
                              {formatDate(test.date)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
