/**
 * Application-wide constants to avoid magic strings and centralize configuration.
 */

// Absence status values
export const ABSENCE_STATUS = {
  PENDIENTE: 'PENDIENTE',
  JUSTIFICADA: 'JUSTIFICADA'
} as const;

export type AbsenceStatus = typeof ABSENCE_STATUS[keyof typeof ABSENCE_STATUS];

// Education levels
export const EDUCATION_LEVELS = {
  BASICA: 'BASICA',
  MEDIA: 'MEDIA'
} as const;

export type EducationLevel = typeof EDUCATION_LEVELS[keyof typeof EDUCATION_LEVELS];

// Toast notification types
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
} as const;

export type ToastType = typeof TOAST_TYPES[keyof typeof TOAST_TYPES];

// File upload
export const FILE_CONFIG = {
  ALLOWED_EXTENSIONS: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'],
  MAX_FILE_SIZE_MB: 5,
  UPLOAD_BUCKET: 'documents'
} as const;

// API retry logic
export const RETRY_CONFIG = {
  MAX_ATTEMPTS: 3,
  BASE_DELAY_MS: 300
} as const;

// Request timeouts (seconds)
export const REQUEST_TIMEOUT_SEC = 5;

// Cache invalidation keys (React Query)
export const QUERY_KEYS_INVALIDATE = {
  ABSENCES: ['absences'],
  STUDENTS: ['students'],
  COURSES: ['courses'],
  TESTS: ['tests'],
  INSPECTORATE: ['inspectorate'],
  HOLIDAYS: ['holidays'],
  TEACHER_PUBLIC_ABSENCES: ['teacherPublicAbsences']
} as const;

// UI configuration
export const UI_CONFIG = {
  MODAL_SIZE_SM: 'sm',
  MODAL_SIZE_MD: 'md',
  MODAL_SIZE_LG: 'lg',
  PAGINATION_SIZE: 20
} as const;

// Error codes
export const ERROR_CODES = {
  DUPLICATE_RECORD: '23505',
  FOREIGN_KEY_VIOLATION: '23503',
  NOT_FOUND: 'PGRST116'
} as const;
