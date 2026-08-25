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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      customer_categories: {
        Row: {
          created_at: string
          id: string
          label: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          label: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          sort_order?: number
        }
        Relationships: []
      }
      customer_contacts: {
        Row: {
          contact_date: string
          created_at: string
          created_by: string | null
          customer_id: string
          id: string
          memo: string
          method: string
        }
        Insert: {
          contact_date: string
          created_at?: string
          created_by?: string | null
          customer_id: string
          id?: string
          memo?: string
          method: string
        }
        Update: {
          contact_date?: string
          created_at?: string
          created_by?: string | null
          customer_id?: string
          id?: string
          memo?: string
          method?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          category: string
          company: string
          created_at: string
          email: string
          id: string
          memo: string
          name: string
          owner_id: string | null
          phone: string
          phone_normalized: string
          updated_at: string
        }
        Insert: {
          category: string
          company: string
          created_at?: string
          email?: string
          id?: string
          memo?: string
          name: string
          owner_id?: string | null
          phone: string
          phone_normalized: string
          updated_at?: string
        }
        Update: {
          category?: string
          company?: string
          created_at?: string
          email?: string
          id?: string
          memo?: string
          name?: string
          owner_id?: string | null
          phone?: string
          phone_normalized?: string
          updated_at?: string
        }
        Relationships: []
      }
      employees: {
        Row: {
          created_at: string
          department: string
          direct_line: string
          id: string
          job_title: string
          name: string
          phone: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          department: string
          direct_line?: string
          id?: string
          job_title?: string
          name: string
          phone?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          department?: string
          direct_line?: string
          id?: string
          job_title?: string
          name?: string
          phone?: string
          updated_at?: string
        }
        Relationships: []
      }
      field_trips: {
        Row: {
          author_name: string
          base_date: string
          created_at: string
          depart_time: string
          department: string
          destination: string
          id: string
          remark_1: string
          remark_2: string
          remark_3: string
          remark_4: string
          return_time: string
          trip_end: string
          trip_start: string
          updated_at: string
          user_id: string
        }
        Insert: {
          author_name: string
          base_date: string
          created_at?: string
          depart_time?: string
          department: string
          destination?: string
          id?: string
          remark_1?: string
          remark_2?: string
          remark_3?: string
          remark_4?: string
          return_time?: string
          trip_end: string
          trip_start: string
          updated_at?: string
          user_id: string
        }
        Update: {
          author_name?: string
          base_date?: string
          created_at?: string
          depart_time?: string
          department?: string
          destination?: string
          id?: string
          remark_1?: string
          remark_2?: string
          remark_3?: string
          remark_4?: string
          return_time?: string
          trip_end?: string
          trip_start?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      logs: {
        Row: {
          action: string
          actor_id: string | null
          actor_name: string
          created_at: string
          id: string
          level: string
          message: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_name?: string
          created_at?: string
          id?: string
          level: string
          message: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_name?: string
          created_at?: string
          id?: string
          level?: string
          message?: string
        }
        Relationships: []
      }
      report_boards: {
        Row: {
          created_at: string
          created_by: string | null
          department: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          department?: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          department?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      schedules: {
        Row: {
          base_date: string
          content: string
          created_at: string
          department: string
          id: string
          trip_end: string
          trip_start: string
          updated_at: string
          user_id: string
        }
        Insert: {
          base_date: string
          content: string
          created_at?: string
          department: string
          id?: string
          trip_end: string
          trip_start: string
          updated_at?: string
          user_id: string
        }
        Update: {
          base_date?: string
          content?: string
          created_at?: string
          department?: string
          id?: string
          trip_end?: string
          trip_start?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          department: string
          email: string
          id: string
          is_admin: boolean
          job_title: string
          name: string | null
          phone: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          department?: string
          email: string
          id: string
          is_admin?: boolean
          job_title?: string
          name?: string | null
          phone?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          department?: string
          email?: string
          id?: string
          is_admin?: boolean
          job_title?: string
          name?: string | null
          phone?: string
        }
        Relationships: []
      }
      work_reports: {
        Row: {
          created_at: string
          id: string
          report_date: string
          title: string
          today_work: string
          tomorrow_work: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          report_date: string
          title: string
          today_work?: string
          tomorrow_work?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          report_date?: string
          title?: string
          today_work?: string
          tomorrow_work?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
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

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
