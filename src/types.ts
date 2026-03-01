import { Database as DB } from './types/db';

export type Database = DB;

export type Course = DB['public']['Tables']['courses']['Row'];
export type Student = DB['public']['Tables']['students']['Row'];
export type Test = DB['public']['Tables']['tests']['Row'];
export type InspectorateRecord = DB['public']['Tables']['inspectorate_records']['Row'];
export type Absence = DB['public']['Tables']['absences']['Row'];

export type AbsenceWithDetails = Absence & {
  student: Student & { course: Course };
  affected_tests?: Test[];
};

// Database operation types
export type TestInsert = DB['public']['Tables']['tests']['Insert'];
