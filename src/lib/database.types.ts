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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      budgets: {
        Row: {
          cap: number
          category: Database["public"]["Enums"]["category"]
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cap: number
          category: Database["public"]["Enums"]["category"]
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cap?: number
          category?: Database["public"]["Enums"]["category"]
          created_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cards: {
        Row: {
          color: Database["public"]["Enums"]["card_color"]
          created_at: string
          credit_limit: number
          due_in_days: number
          fatura_base: number
          id: string
          last4: string
          nickname: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: Database["public"]["Enums"]["card_color"]
          created_at?: string
          credit_limit: number
          due_in_days?: number
          fatura_base?: number
          id?: string
          last4: string
          nickname: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: Database["public"]["Enums"]["card_color"]
          created_at?: string
          credit_limit?: number
          due_in_days?: number
          fatura_base?: number
          id?: string
          last4?: string
          nickname?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      goal_movements: {
        Row: {
          amount: number
          created_at: string
          date: string
          goal_id: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          date?: string
          goal_id: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          date?: string
          goal_id?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_movements_goal_fkey"
            columns: ["goal_id", "user_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      goals: {
        Row: {
          created_at: string
          due: string | null
          icon: Database["public"]["Enums"]["goal_icon"]
          id: string
          name: string
          saved: number
          target: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          due?: string | null
          icon?: Database["public"]["Enums"]["goal_icon"]
          id?: string
          name: string
          saved?: number
          target: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          due?: string | null
          icon?: Database["public"]["Enums"]["goal_icon"]
          id?: string
          name?: string
          saved?: number
          target?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      invoice_imports: {
        Row: {
          card_id: string | null
          created_at: string
          due_in_days: number | null
          error_message: string | null
          file_name: string
          file_path: string
          id: string
          items_count: number
          mime_type: string
          size_bytes: number
          status: Database["public"]["Enums"]["import_status"]
          total: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          card_id?: string | null
          created_at?: string
          due_in_days?: number | null
          error_message?: string | null
          file_name: string
          file_path: string
          id?: string
          items_count?: number
          mime_type: string
          size_bytes: number
          status?: Database["public"]["Enums"]["import_status"]
          total?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          card_id?: string | null
          created_at?: string
          due_in_days?: number | null
          error_message?: string | null
          file_name?: string
          file_path?: string
          id?: string
          items_count?: number
          mime_type?: string
          size_bytes?: number
          status?: Database["public"]["Enums"]["import_status"]
          total?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoice_imports_card_fkey"
            columns: ["card_id", "user_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          hide_balance: boolean
          id: string
          month_cap: number
          name: string
          opening_balance: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          hide_balance?: boolean
          id: string
          month_cap?: number
          name?: string
          opening_balance?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          hide_balance?: boolean
          id?: string
          month_cap?: number
          name?: string
          opening_balance?: number
          updated_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          card_id: string | null
          category: Database["public"]["Enums"]["category"]
          created_at: string
          date: string
          id: string
          import_id: string | null
          income: boolean
          method: Database["public"]["Enums"]["payment_method"]
          name: string
          source: Database["public"]["Enums"]["tx_source"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          card_id?: string | null
          category: Database["public"]["Enums"]["category"]
          created_at?: string
          date?: string
          id?: string
          import_id?: string | null
          income?: boolean
          method: Database["public"]["Enums"]["payment_method"]
          name: string
          source?: Database["public"]["Enums"]["tx_source"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          card_id?: string | null
          category?: Database["public"]["Enums"]["category"]
          created_at?: string
          date?: string
          id?: string
          import_id?: string | null
          income?: boolean
          method?: Database["public"]["Enums"]["payment_method"]
          name?: string
          source?: Database["public"]["Enums"]["tx_source"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_card_fkey"
            columns: ["card_id", "user_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "transactions_import_fkey"
            columns: ["import_id", "user_id"]
            isOneToOne: false
            referencedRelation: "invoice_imports"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_goal: { Args: { p_id: string }; Returns: number }
      delete_goal_movement: {
        Args: { p_id: string }
        Returns: {
          amount: number
          created_at: string
          date: string
          goal_id: string
          id: string
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "goal_movements"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      import_invoice: {
        Args: {
          p_card_id?: string
          p_date?: string
          p_import_id: string
          p_items: Json
        }
        Returns: number
      }
      save_goal_movement: {
        Args: {
          p_amount: number
          p_date?: string
          p_goal_id: string
          p_id?: string
        }
        Returns: {
          amount: number
          created_at: string
          date: string
          goal_id: string
          id: string
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "goal_movements"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      card_color: "ciano" | "lima" | "menta"
      category:
        | "moradia"
        | "alimentacao"
        | "transporte"
        | "lazer"
        | "assinaturas"
        | "outros"
      goal_icon: "plane" | "shield" | "book" | "car" | "target"
      import_status: "enviada" | "lida" | "importada" | "erro"
      payment_method: "pix" | "dinheiro" | "card"
      tx_source: "manual" | "fatura"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      card_color: ["ciano", "lima", "menta"],
      category: [
        "moradia",
        "alimentacao",
        "transporte",
        "lazer",
        "assinaturas",
        "outros",
      ],
      goal_icon: ["plane", "shield", "book", "car", "target"],
      import_status: ["enviada", "lida", "importada", "erro"],
      payment_method: ["pix", "dinheiro", "card"],
      tx_source: ["manual", "fatura"],
    },
  },
} as const
