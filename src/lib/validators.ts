import { z } from 'zod';

// Test validator
export const testValidationSchema = z.object({
  subject: z.string()
    .min(3, 'La asignatura debe tener al menos 3 caracteres')
    .max(100, 'La asignatura no puede exceder 100 caracteres'),
  type: z.string().min(1, 'Debe seleccionar un tipo de evaluación'),
  course_id: z.string().min(1, 'Debe seleccionar un curso'),
  date: z.string().refine(date => !isNaN(Date.parse(date)), 'Fecha inválida'),
  description: z.string().max(1000, 'La descripción no puede exceder 1000 caracteres').optional(),
});

// Absence validator
export const absenceValidationSchema = z.object({
  // IDs in the DB are strings (UUIDs or numeric strings). Match form field names.
  student_id: z.string().min(1, 'Debe seleccionar un estudiante'),
  course_id: z.string().min(1, 'Debe seleccionar un curso'),
  start_date: z.string().refine(date => !isNaN(Date.parse(date)), 'Fecha de inicio inválida'),
  end_date: z.string().refine(date => !isNaN(Date.parse(date)), 'Fecha de fin inválida'),
}).refine(
  data => new Date(data.end_date) >= new Date(data.start_date),
  {
    message: 'La fecha de fin no puede ser anterior a la fecha de inicio',
    path: ['end_date'],
  }
).extend({
  observation: z.string()
    .nullable()
    .optional()
    .refine(val => !val || val.length <= 500, 'La observación no puede exceder 500 caracteres'),
});

// Inspectorate record validator
export const inspectorateRecordValidationSchema = z.object({
  // IDs are strings in DB and the form provides string values from selects
  student_id: z.string().min(1, 'Debe seleccionar un estudiante'),
  date_time: z.string().refine(date => !isNaN(Date.parse(date)), 'Fecha y hora inválida'),
  observation: z.string()
    .min(5, 'La observación debe tener al menos 5 caracteres')
    .max(500, 'La observación no puede exceder 500 caracteres'),
  actions_taken: z.string()
    .min(5, 'Las acciones deben tener al menos 5 caracteres')
    .max(1000, 'Las acciones no pueden exceder 1000 caracteres')
    .optional(),
});

