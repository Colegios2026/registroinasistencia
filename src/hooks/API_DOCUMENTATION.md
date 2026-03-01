/**
 * Public API documentation for query hooks and services.
 * This file describes the contracts and expected behavior of data-fetching operations.
 *
 * ## Query Hooks  
 * All hooks use React Query (TanStack Query) for caching and automatic refetching.
 * 
 * ### useAbsences(level?, startDate?, endDate?)
 * Fetches absence records with nested student and course data.
 * - Returns: `AbsenceWithDetails[]` with `affected_tests` computed.
 * - Error: Throws if Supabase returns error; catches in handleError.
 * - Edge case: Empty arrays if no matches; null/undefined dates handled gracefully.
 *
 * ### useStudents(courseId?, level?)
 * Fetches student records; memoizes by id for stable array identity.
 * - Returns: `StudentRow[]` with course nested.
 * - Optimization: Memoizes array reference if id set hasn't changed.
 *
 * ### useInspectorate(level?, startDate?, endDate?)
 * Fetches inspectorate records with normalization to ensure consistent `student` property.
 * - Returns: Pre-normalized records with `student` top-level property.
 * - Normalization: Handles both `students` and `student` join results from Supabase.
 *
 * ### useCourses(level?)
 * Fetches course records filtered by level if specified.
 * - Returns: `CourseRow[]`
 *
 * ### useTests(courseId?, month?, year?, level?)
 * Fetches test records for a specific course and date range.
 * - Returns: `TestRow[]`
 *
 * ## Mutation Hooks
 *
 * ### useCreateAbsence()
 * Mutates to create an absence with optional file upload.
 * - File: Validated extensions (pdf, doc, docx, jpg, jpeg, png).
 * - Error: Throws on validation or upload failure.
 * - OnSuccess: Invalidates 'absences' cache.
 *
 * ### useUpdateAbsence()
 * Mutates to update an absence with optional file replacement.
 * - OnSuccess: Invalidates 'absences' cache.
 *
 * ## Services (Lower-level)
 *
 * ### absenceService.getAbsences(filters?)
 * Raw query to fetch absences with optional filtering.
 * - Returns: `AbsenceWithDetails[] | undefined`
 * - Error: Silently handled by handleError(); returns undefined or throws.
 *
 * ### absenceService.createAbsence(absence, file?)
 * Creates absence and uploads file if provided.
 * - File Upload: Retries up to 3 times with exponential backoff.
 * - Status Logic: Auto-sets to 'JUSTIFICADA' if document uploaded, 'PENDIENTE' otherwise.
 *
 * ## Error Handling Patterns
 *
 * - Hooks: Throw errors (caught by React Query's onError).
 * - Services: Call handleError() and may return undefined.
 * - Components: useToast() for user-facing messages.
 *
 * ## Data Contracts
 *
 * All date fields (start_date, end_date, date_time) should be ISO 8601 strings.
 * Validation: Use isValidDate() from utils/date before filtering.
 * 
 * Student/course relationships are deeply nested and may vary by query shape;
 * always use optional chaining (?.) and nullish coalesce (??) when accessing.
 */
export {};
