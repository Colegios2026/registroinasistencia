import React from 'react';
import { Calendar, AlertCircle, Edit2, Check, FileText, Download } from 'lucide-react';
import { Modal, Button, Badge, FormError } from '../components/ui';
import { useForm } from 'react-hook-form';
import { AbsenceWithDetails, Course } from '../types';
import { formatDate } from '../utils';
import { Upload } from 'lucide-react';

interface InasistenciasDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAbsence: AbsenceWithDetails | null;
  courses: Course[];
  isEditing: boolean;
  onEditToggle: (editing: boolean) => void;
  file: File | null;
  onFileChange: (file: File | null) => void;
  loading: boolean;
  onUpdate: (data: any) => void;
}

export const InasistenciasDetailModal: React.FC<InasistenciasDetailModalProps> = ({
  isOpen,
  onClose,
  selectedAbsence,
  courses,
  isEditing,
  onEditToggle,
  file,
  onFileChange,
  loading,
  onUpdate,
}) => {
  const { 
    register: registerEdit, 
    handleSubmit: handleSubmitEdit,
    setValue: setValueEdit,
    reset: resetEdit,
    formState: { errors: errorsEdit }
  } = useForm<Partial<any>>({ mode: 'onBlur' });

  const handleClose = () => {
    onClose();
    onEditToggle(false);
    onFileChange(null);
  };

  const handleEdit = () => {
    if (selectedAbsence) {
      setValueEdit('observation', selectedAbsence.observation);
      onEditToggle(true);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? "Editar Inasistencia" : "Detalle de Inasistencia"}
      size="lg"
    >
      {selectedAbsence && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex-1">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold text-lg shadow-sm border border-slate-100">
                {selectedAbsence.student.full_name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-slate-900">{selectedAbsence.student.full_name}</h3>
                <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">{courses.find(c => c.id === selectedAbsence.student.course_id)?.name || 'N/A'} • RUT: {selectedAbsence.student.rut || 'N/A'}</p>
              </div>
            </div>
            {!isEditing && (
              <Button variant="outline" size="icon" onClick={handleEdit}>
                <Edit2 className="w-5 h-5" />
              </Button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmitEdit(onUpdate)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-xs font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Periodo
                  </div>
                  <div className="text-sm font-bold text-slate-700">{formatDate(selectedAbsence.start_date)} al {formatDate(selectedAbsence.end_date)}</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-xs font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Estado Actual
                  </div>
                  <Badge variant={selectedAbsence.status === 'JUSTIFICADA' ? 'success' : 'warning'} className="mt-1">
                    {selectedAbsence.status}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="edit-absence-observation" className="text-sm font-bold text-slate-700 ml-1">Observación</label>
                <textarea 
                  id="edit-absence-observation"
                  aria-label="Editar observación de la inasistencia"
                  {...registerEdit('observation')}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 min-h-[100px]"
                  placeholder="Actualizar observación..."
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="edit-absence-file" className="text-sm font-bold text-slate-700 ml-1">
                  {selectedAbsence.document_url ? 'Actualizar Documento' : 'Subir Documento de Justificación'}
                </label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer relative">
                  <Upload className="w-8 h-8 text-slate-400 mb-2" />
                  <p className="text-sm text-slate-500">{file ? file.name : 'Subir PDF, JPG o PNG'}</p>
                  <input 
                    id="edit-absence-file"
                    type="file" 
                    aria-label="Actualizar documento de justificación"
                    className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                    onChange={(e) => onFileChange(e.target.files?.[0] || null)}
                  />
                </div>
                {selectedAbsence.document_url && !file && (
                  <p className="text-xs text-slate-400 italic">Ya existe un documento cargado. Subir uno nuevo lo reemplazará.</p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="ghost" onClick={() => { onEditToggle(false); resetEdit(); }}>
                  Cancelar
                </Button>
                <Button type="submit" loading={loading} icon={Check}>
                  Guardar Cambios
                </Button>
              </div>
            </form>
          ) : (
            <>
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
                    {selectedAbsence.affected_tests.map(test => (
                      <div key={test.id} className="bg-rose-50 p-3 rounded-lg border border-rose-100 text-sm">
                        <div className="font-bold text-slate-800">{test.subject}</div>
                        <div className="text-rose-600 font-medium">{test.type} - {formatDate(test.date)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <Button onClick={handleClose}>
                  Cerrar
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </Modal>
  );
};
