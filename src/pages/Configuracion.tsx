import React, { useState } from 'react';
import { Database, RefreshCw, CheckCircle2, AlertTriangle, Upload, FileSpreadsheet } from 'lucide-react';
import { useCourses, useBulkInsertCourses, useBulkInsertStudents, useSeedData } from '../hooks/queries';
import { useToast } from '../contexts/ToastContext';
import Papa from 'papaparse';
import { Course } from '../types';
import { cn } from '../utils';
import { PageHeader } from '../components/ui';

export const Configuracion: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [courses, setCourses] = useState<Course[]>([]);
  const [uploadLevel, setUploadLevel] = useState<'BASICA' | 'MEDIA'>('BASICA');
  const { showToast } = useToast();
  const coursesQ = useCourses();
  const bulkCoursesM = useBulkInsertCourses();
  const bulkStudentsM = useBulkInsertStudents();
  const seedM = useSeedData();

  React.useEffect(() => {
    if (coursesQ.data) setCourses(coursesQ.data);
  }, [coursesQ.data]);

  const handleSeed = async () => {
    if (!confirm('¿Desea cargar datos de prueba? Esto agregará cursos, estudiantes y pruebas de ejemplo.')) return;
    try {
      setLoading(true);
      setStatus('idle');
      await seedM.mutateAsync();
      setStatus('success');
      showToast({
        type: 'success',
        message: 'Datos cargados exitosamente. Recargue la página para ver los cambios.',
        duration: 5000
      });
    } catch (error: unknown) {
      console.error('Error seeding data:', error);
      setStatus('error');
      showToast({
        type: 'error',
        message: 'Error al cargar datos: ' + (error instanceof Error ? error.message : 'Verifique la conexión con Supabase y que las tablas existan.'),
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkCourses = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
          complete: async (results: Papa.ParseResult<Record<string, string>>) => {
        try {
          setLoading(true);
          const data = results.data as { name: string }[];
          if (!data.length) throw new Error('El archivo está vacío');
          
          const coursesWithLevel = data.map(c => ({ ...c, level: uploadLevel }));
              await bulkCoursesM.mutateAsync(coursesWithLevel);
              showToast({type: 'success', message: 'Cursos cargados exitosamente'});
              coursesQ.refetch();
        } catch (error: unknown) {
          showToast({type: 'error', message: 'Error al cargar cursos: ' + (error instanceof Error ? error.message : String(error))});
        } finally {
          setLoading(false);
          e.target.value = '';
        }
      }
    });
  };

  const handleBulkStudents = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
          complete: async (results: Papa.ParseResult<Record<string, string>>) => {
        try {
          setLoading(true);
          const data = results.data as { full_name: string; course_name: string; rut?: string }[];
          if (!data.length) throw new Error('El archivo está vacío');

          // Map course names to IDs
              const allCourses = coursesQ.data ? coursesQ.data.filter(c => c.level === uploadLevel) : [];
          const studentsToInsert = data.map(s => {
            const course = allCourses.find(c => c.name.toLowerCase() === s.course_name.toLowerCase());
            if (!course) throw new Error(`Curso no encontrado en ${uploadLevel}: ${s.course_name}`);
            return {
              full_name: s.full_name,
              course_id: course.id,
              rut: s.rut
            };
          });

              await bulkStudentsM.mutateAsync(studentsToInsert);
              showToast({type: 'success', message: 'Estudiantes cargados exitosamente'});
        } catch (error: unknown) {
          showToast({type: 'error', message: 'Error al cargar estudiantes: ' + (error instanceof Error ? error.message : String(error))});
        } finally {
          setLoading(false);
          e.target.value = '';
        }
      }
    });
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <PageHeader 
        title="Configuración del Sistema"
        description="Herramientas de administración, carga masiva de datos y estado de los servicios."
        breadcrumbs={[{ label: 'Configuración', active: true }]}
      />

      <div className="max-w-4xl mx-auto space-y-10">
        <div className="bg-white p-10 rounded-3xl border border-slate-200/60 shadow-sm shadow-slate-200/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center border border-indigo-100/50 shadow-sm shadow-indigo-500/5">
                <Database className="w-7 h-7" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">Gestión de Datos</h3>
                <p className="text-slate-500 text-sm font-medium">Administración inicial y carga de catálogos.</p>
              </div>
            </div>
            <div className="flex bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/50 backdrop-blur-sm">
              <button 
                onClick={() => setUploadLevel('BASICA')}
                className={cn(
                  "px-6 py-2.5 text-[11px] font-bold rounded-xl transition-all tracking-widest uppercase",
                  uploadLevel === 'BASICA' ? "bg-white text-indigo-600 shadow-sm border border-slate-200/50" : "text-slate-400 hover:text-slate-600"
                )}
              >
                BÁSICA
              </button>
              <button 
                onClick={() => setUploadLevel('MEDIA')}
                className={cn(
                  "px-6 py-2.5 text-[11px] font-bold rounded-xl transition-all tracking-widest uppercase",
                  uploadLevel === 'MEDIA' ? "bg-white text-indigo-600 shadow-sm border border-slate-200/50" : "text-slate-400 hover:text-slate-600"
                )}
              >
                MEDIA
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 bg-slate-50/50 rounded-3xl border border-slate-100 flex flex-col justify-between group hover:bg-slate-50 transition-colors">
              <div>
                <h4 className="font-bold text-slate-900 mb-2 tracking-tight">Carga Masiva de Cursos</h4>
                <p className="text-sm text-slate-500 mb-8 font-medium">
                  Suba un archivo CSV con la columna <code className="bg-slate-200/50 px-1.5 py-0.5 rounded text-indigo-600 font-mono text-xs">name</code>.
                </p>
              </div>
              <div className="relative">
                <input 
                  type="file" 
                  accept=".csv" 
                  onChange={handleBulkCourses}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                  disabled={loading}
                />
                <button className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10">
                  <FileSpreadsheet className="w-5 h-5" strokeWidth={1.5} />
                  Subir CSV Cursos
                </button>
              </div>
            </div>

            <div className="p-8 bg-slate-50/50 rounded-3xl border border-slate-100 flex flex-col justify-between group hover:bg-slate-50 transition-colors">
              <div>
                <h4 className="font-bold text-slate-900 mb-2 tracking-tight">Carga Masiva de Estudiantes</h4>
                <p className="text-sm text-slate-500 mb-8 font-medium">
                  Columnas: <code className="bg-slate-200/50 px-1.5 py-0.5 rounded text-indigo-600 font-mono text-xs">full_name</code>, <code className="bg-slate-200/50 px-1.5 py-0.5 rounded text-indigo-600 font-mono text-xs">course_name</code>.
                </p>
              </div>
              <div className="relative">
                <input 
                  type="file" 
                  accept=".csv" 
                  onChange={handleBulkStudents}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                  disabled={loading}
                />
                <button className="w-full flex items-center justify-center gap-3 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20">
                  <Upload className="w-5 h-5" strokeWidth={1.5} />
                  Subir CSV Estudiantes
                </button>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-10 border-t border-slate-100">
            <div className="p-8 bg-amber-50/50 rounded-3xl border border-amber-100/50 flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-2.5 text-amber-600 font-bold mb-2 tracking-tight">
                  <AlertTriangle className="w-5 h-5" strokeWidth={2} />
                  Datos de Demostración
                </div>
                <p className="text-sm text-amber-800/70 leading-relaxed font-medium">
                  Genera automáticamente cursos, estudiantes y un calendario de pruebas para probar las funcionalidades del sistema.
                </p>
              </div>
              <button 
                onClick={handleSeed}
                disabled={loading || seedM.isPending}
                className="flex items-center justify-center gap-3 bg-amber-500 text-white px-8 py-4 rounded-2xl font-bold hover:bg-amber-600 transition-all disabled:opacity-50 whitespace-nowrap shadow-lg shadow-amber-500/20"
              >
                {(loading || seedM.isPending) ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Database className="w-5 h-5" strokeWidth={1.5} />}
                Cargar Demo
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm shadow-slate-200/20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100/50">
              <CheckCircle2 className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Estado de la Conexión</h3>
              <p className="text-xs text-slate-500 font-medium">Sincronizado con Supabase Cloud</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full border border-emerald-100">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">En Línea</span>
          </div>
        </div>
      </div>
    </div>
  );
};
