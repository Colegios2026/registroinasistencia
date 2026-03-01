export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      absences: {
        Row: {
          created_at: string | null
          document_url: string | null
          end_date: string
          id: string
          observation: string | null
          start_date: string
          status: string | null
          student_id: string | null
        }
        Insert: {
          created_at?: string | null
          document_url?: string | null
          end_date: string
          id?: string
          observation?: string | null
          start_date: string
          status?: string | null
          student_id?: string | null
        }
        Update: {
          created_at?: string | null
          document_url?: string | null
          end_date?: string
          id?: string
          observation?: string | null
          start_date?: string
          status?: string | null
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "absences_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          created_at: string | null
          id: string
          level: string | null
          name: string
          position: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          level?: string | null
          name: string
          position?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          level?: string | null
          name?: string
          position?: number | null
        }
        Relationships: []
      }
      feriados_chile: {
        Row: {
          descripcion: string
          es_irrenunciable: boolean
          fecha: string
        }
        Insert: {
          descripcion: string
          es_irrenunciable?: boolean
          fecha: string
        }
        Update: {
          descripcion?: string
          es_irrenunciable?: boolean
          fecha?: string
        }
        Relationships: []
      }
      inspectorate_records: {
        Row: {
          created_at: string | null
          date_time: string
          id: string
          observation: string
          student_id: string | null
        }
        Insert: {
          created_at?: string | null
          date_time: string
          id?: string
          observation: string
          student_id?: string | null
        }
        Update: {
          created_at?: string | null
          date_time?: string
          id?: string
          observation?: string
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inspectorate_records_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      students: {
        Row: {
          course_id: string | null
          created_at: string | null
          full_name: string
          id: string
          rut: string | null
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          full_name: string
          id?: string
          rut?: string | null
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          full_name?: string
          id?: string
          rut?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      tests: {
        Row: {
          course_id: string | null
          created_at: string | null
          date: string
          description: string | null
          id: string
          subject: string
          type: string
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          date: string
          description?: string | null
          id?: string
          subject: string
          type: string
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          date?: string
          description?: string | null
          id?: string
          subject?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "tests_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      teacher_public_view: {
        Row: {
          absence_id: string | null
          course_level: string | null
          course_name: string | null
          end_date: string | null
          observation: string | null
          start_date: string | null
          status: string | null
          student_name: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      app_role: { Args: never; Returns: string }
      clean_old_logs: { Args: { days_to_keep?: number }; Returns: string }
      count_affected_tests: {
        Args: { p_end: string; p_start: string; p_student_id: string }
        Returns: number
      }
      current_role: { Args: never; Returns: string }
      get_absence_stats: {
        Args: {
          p_course_id: string
          p_end_date: string
          p_level: string
          p_start_date: string
        }
        Returns: {
          justified: number
          pending: number
          total: number
          with_tests: number
          without_doc: number
        }[]
      }
      get_teacher_dashboard: {
        Args: never
        Returns: {
          absence_id: string
          affected_tests_count: number
          course_level: string
          course_name: string
          end_date: string
          observation: string
          start_date: string
          status: string
          student_name: string
        }[]
      }
      is_management: { Args: never; Returns: boolean }
      is_staff: { Args: never; Returns: boolean }
      is_superuser: { Args: never; Returns: boolean }
      teacher_get_public_absences: {
        Args: { p_level?: string; p_month: number; p_year: number }
        Returns: {
          absence_id: string
          affected_tests_count: number
          affected_tests_json: Json
          course_level: string
          course_name: string
          end_date: string
          observation: string
          start_date: string
          status: string
          student_name: string
        }[]
      }
    }
    Enums: {
      absence_status: "PENDIENTE" | "JUSTIFICADA"
      education_level: "BASICA" | "MEDIA"
      user_role: "inspector" | "coordinador" | "director" | "superuser"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

