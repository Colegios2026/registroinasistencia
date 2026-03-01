import { supabase } from '../lib/supabaseClient';
import { handleError } from '../utils/error-handler';
import { Database } from '../types/db';

export const adminService = {
  seedData: async () => {
    try {
      // 1. Create Courses
      console.log('adminService: Seeding courses...');
      const coursesInsert: Database['public']['Tables']['courses']['Insert'][] = [
        { name: '1° Básico A', level: 'BASICA' },
        { name: '2° Básico B', level: 'BASICA' },
        { name: '1° Medio A', level: 'MEDIA' },
        { name: '2° Medio B', level: 'MEDIA' }
      ];

      const { data: courses, error: cErr } = await supabase.from('courses').insert(coursesInsert).select();
      if (cErr) {
        console.error('adminService: course insert error', cErr);
        throw cErr;
      }
      console.log('adminService: courses seeded', courses?.length);

      // 2. Create Students
      console.log('adminService: Seeding students...');
      const studentsData: Database['public']['Tables']['students']['Insert'][] = [];
      for (const course of (courses as Database['public']['Tables']['courses']['Row'][])) {
        studentsData.push(
          { full_name: `Juan Pérez (${course.name})`, course_id: course.id, rut: '12.345.678-9' },
          { full_name: `María González (${course.name})`, course_id: course.id, rut: '23.456.789-0' },
          { full_name: `Diego Muñoz (${course.name})`, course_id: course.id, rut: '15.678.901-2' }
        );
      }
      const { data: students, error: sErr } = await supabase.from('students').insert(studentsData).select();
      if (sErr) {
        console.error('adminService: student insert error', sErr);
        throw sErr;
      }
      console.log('adminService: students seeded', students?.length);

      // 3. Create Tests
      console.log('adminService: Seeding tests...');
      const testsData: Database['public']['Tables']['tests']['Insert'][] = [];
      const subjects = ['Matemáticas', 'Lenguaje', 'Historia', 'Ciencias'];
      const types = ['Prueba Coeficiente 1', 'Control', 'Trabajo Práctico'];
      
      for (const course of (courses as Database['public']['Tables']['courses']['Row'][])) {
        for (let i = 0; i < 5; i++) {
          const date = new Date();
          date.setDate(date.getDate() + (i * 3) - 5); // Some past, some future
          testsData.push({
            course_id: course.id,
            date: String(date.toISOString().split('T')[0] ?? ''),
            subject: String(subjects[i % subjects.length]),
            type: String(types[i % types.length]),
            description: `Evaluación de contenidos unidad ${i + 1}`
          });
        }
      }
      const { error: tErr } = await supabase.from('tests').insert(testsData);
      if (tErr) {
        console.error('adminService: test insert error', tErr);
        throw tErr;
      }
      console.log('adminService: tests seeded');

      return { courses, students };
    } catch (error) {
      handleError(error);
    }
  }
};
