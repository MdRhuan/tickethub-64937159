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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      albuns: {
        Row: {
          _ts: number
          capa: string
          created_at: string
          data: string
          fotos: Json
          id: string
          link: string
          nome: string
        }
        Insert: {
          _ts?: number
          capa?: string
          created_at?: string
          data?: string
          fotos?: Json
          id: string
          link?: string
          nome?: string
        }
        Update: {
          _ts?: number
          capa?: string
          created_at?: string
          data?: string
          fotos?: Json
          id?: string
          link?: string
          nome?: string
        }
        Relationships: []
      }
      eventos: {
        Row: {
          _ts: number
          atracoes: Json
          badge: string
          categoria: string
          classificacao: string
          corCal: string
          created_at: string
          data: string
          hora: string
          id: string
          imgBanner: string
          imgUrl: string
          ing1: Json | null
          ing2: Json | null
          ing3: Json | null
          local: string
          mapaUrl: string
          preco: string
          sobre: string
          tagCard: string
          titulo: string
        }
        Insert: {
          _ts?: number
          atracoes?: Json
          badge?: string
          categoria?: string
          classificacao?: string
          corCal?: string
          created_at?: string
          data?: string
          hora?: string
          id: string
          imgBanner?: string
          imgUrl?: string
          ing1?: Json | null
          ing2?: Json | null
          ing3?: Json | null
          local?: string
          mapaUrl?: string
          preco?: string
          sobre?: string
          tagCard?: string
          titulo?: string
        }
        Update: {
          _ts?: number
          atracoes?: Json
          badge?: string
          categoria?: string
          classificacao?: string
          corCal?: string
          created_at?: string
          data?: string
          hora?: string
          id?: string
          imgBanner?: string
          imgUrl?: string
          ing1?: Json | null
          ing2?: Json | null
          ing3?: Json | null
          local?: string
          mapaUrl?: string
          preco?: string
          sobre?: string
          tagCard?: string
          titulo?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          _ts: number
          created_at: string
          email: string
          id: string
          nascimento: string
          nome: string
          whatsapp: string
        }
        Insert: {
          _ts?: number
          created_at?: string
          email?: string
          id: string
          nascimento?: string
          nome?: string
          whatsapp?: string
        }
        Update: {
          _ts?: number
          created_at?: string
          email?: string
          id?: string
          nascimento?: string
          nome?: string
          whatsapp?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          _ts: number
          autor: string
          conteudo: string
          created_at: string
          data: string
          destaque: boolean
          id: string
          imgUrl: string
          subtitulo: string
          tag: string
          titulo: string
        }
        Insert: {
          _ts?: number
          autor?: string
          conteudo?: string
          created_at?: string
          data?: string
          destaque?: boolean
          id: string
          imgUrl?: string
          subtitulo?: string
          tag?: string
          titulo?: string
        }
        Update: {
          _ts?: number
          autor?: string
          conteudo?: string
          created_at?: string
          data?: string
          destaque?: boolean
          id?: string
          imgUrl?: string
          subtitulo?: string
          tag?: string
          titulo?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
