import React, { useState, useEffect } from 'react';
import { Upload, AlertCircle } from 'lucide-react';
import { Modal, Button, Select, Input, FormError } from '../components/ui';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { absenceValidationSchema } from '../lib/validators';
import { Course, Student, Test } from '../types';
import { formatDate } from '../utils';
import { useTests } from '../hooks/queries';

interface InasistenciasCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: File | null;
  onFileChange: (file: File | null) => void;
  courses: Course[];
  students: Student[];
  loading: boolean;
  mutationLoading: boolean;
  onSubmit: (data: any) => void;
  level: 'BASICA' | 'MEDIA';
}

type AbsenceCreateForm = {
  course_id: string;
  student_id: string;
  start_date: string;
  end_date: string;
  observation?: string | null;
};

export const InasistenciasCreateModal: React.FC<InasistenciasCreateModalProps> = ({
  isOpen,
  onClose,
  file,
  onFileChange,
  courses,
  students,
  loading,
  mutationLoading,
  onSubmit,
  level,
}) => {
  const { 
    register, 
    handleSubmit, 
    watch, 
    reset,
    formState: { errors }
  } = useForm<AbsenceCreateForm>({
    resolver: zodResolver(absenceValidationSchema),
    mode: 'onBlur'
  });

  const handleClose = () => {
    onClose();
    onFileChange(null);
    reset();
  };

  const watchCourse = watch('course_id');
  const startDate = watch('start_date');
  const endDate = watch('end_date');
  const [affectedTests, setAffectedTests] = useState<Test[]>([]);

  const { data: testsForCourse = [] as Test[] } = useTests(watchCourse || undefined, undefined, undefined, level);

  useEffect(() => {
    const next: Test[] = (startDate && endDate && testsForCourse.length > 0)
      ? testsForCourse.filter((t: Test) => {
          const d = new Date(t.date);
          return d >= new Date(startDate) && d <= new Date(endDate);
        })
      : [];

    setAffectedTests((prev) => {
      if (prev.length === next.length && prev.every((p, i) => p.id === next[i]?.id)) {
        return prev;
      }
      return next;
    });
  }, [startDate, endDate, testsForCourse]);

  return (
    <Modal
      testId="modal-create-absence"
      isOpen={isOpen}
      onClose={handleClose}
      title="Registrar Nueva Inasistencia"
      size="lg"
    >
      <form data-testid="form-create-absence" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Select 
              data-testid="create-absence-course"
              label="Curso"
              options={[{ value: '', label: 'Seleccionar curso' }, ...courses.map(c => ({ value: c.id, label: c.name }))]}
              {...register('course_id', { required: 'El curso es requerido' })}
            />
            <FormError error={errors.course_id} />
          </div>
          <div>
            <Select 
              data-testid="create-absence-student"
              label="Estudiante"
              options={[{ value: '', label: 'Seleccionar estudiante' }, ...students.map(s => ({ value: s.id, label: s.full_name }))]}
              {...register('student_id', { required: 'El estudiante es requerido' })}
              disabled={!watchCourse}
            />
            <FormError error={errors.student_id} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Input 
              data-testid="create-absence-start"
              label="Fecha Inicio"
              type="date"
              {...register('start_date', { required: 'La fecha de inicio es requerida' })}
            />
            <FormError error={errors.start_date} />
          </div>
          <div>
            <Input 
              data-testid="create-absence-end"
              label="Fecha Fin"
              type="date"
              {...register('end_date', { required: 'La fecha de fin es requerida' })}
            />
            <FormError error={errors.end_date} />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="create-absence-observation" className="text-sm font-bold text-slate-700 ml-1">Observación (Opcional)</label>
          <textarea 
            id="create-absence-observation"
            data-testid="create-absence-observation"
            aria-label="Observación de la inasistencia"
            {...register('observation')}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 min-h-[100px]"
            placeholder="Motivo de la inasistencia..."
          />
          <FormError error={errors.observation} />
        </div>

        <div className="space-y-2">
          <label htmlFor="create-absence-file" className="text-sm font-bold text-slate-700 ml-1">Documento de Justificación (Opcional)</label>
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer relative">
            <Upload className="w-8 h-8 text-slate-400 mb-2" />
            <p className="text-sm text-slate-500">{file ? file.name : 'Subir PDF, JPG o PNG'}</p>
            <input 
              id="create-absence-file"
              type="file" 
              aria-label="Subir documento de justificación"
              className="absolute inset-0 opacity-0 cursor-pointer" 
              onChange={(e) => onFileChange(e.target.files?.[0] || null)}
            />
          </div>
        </div>

        {affectedTests.length > 0 && (
          <div className="bg-rose-50 border border-rose-100 rounded-xl p-4">
            <div className="flex items-center gap-2 text-rose-700 font-bold mb-3">
              <AlertCircle className="w-5 h-5" />
              Pruebas Afectadas Detectadas ({affectedTests.length})
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {affectedTests.map(test => (
                <div key={test.id} className="bg-white p-3 rounded-lg border border-rose-200 text-sm">
                  <div className="font-bold text-slate-800">{test.subject}</div>
                  <div className="text-slate-500">{test.type} - {formatDate(test.date)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="ghost" data-testid="create-absence-cancel" onClick={handleClose}>
            Cancelar
          </Button>
          <Button data-testid="create-absence-submit" type="submit" loading={loading || mutationLoading}>
            Guardar Inasistencia
          </Button>
        </div>
      </form>
    </Modal>
  );
};
