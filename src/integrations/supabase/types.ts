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
      bookings: {
        Row: {
          check_in: string
          created_at: string
          duration_months: number
          id: string
          kos_id: string
          notes: string | null
          owner_id: string
          payment_proof_url: string | null
          status: Database["public"]["Enums"]["booking_status"]
          tenant_id: string
          total_price: number
          updated_at: string
        }
        Insert: {
          check_in: string
          created_at?: string
          duration_months?: number
          id?: string
          kos_id: string
          notes?: string | null
          owner_id: string
          payment_proof_url?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          tenant_id: string
          total_price: number
          updated_at?: string
        }
        Update: {
          check_in?: string
          created_at?: string
          duration_months?: number
          id?: string
          kos_id?: string
          notes?: string | null
          owner_id?: string
          payment_proof_url?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          tenant_id?: string
          total_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_kos_id_fkey"
            columns: ["kos_id"]
            isOneToOne: false
            referencedRelation: "kos"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          kos_id: string | null
          last_message_at: string
          owner_id: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          kos_id?: string | null
          last_message_at?: string
          owner_id: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          kos_id?: string | null
          last_message_at?: string
          owner_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_kos_id_fkey"
            columns: ["kos_id"]
            isOneToOne: false
            referencedRelation: "kos"
            referencedColumns: ["id"]
          },
        ]
      }
      kos: {
        Row: {
          address: string
          all_facilities: string[]
          area: string
          available: number
          created_at: string
          description: string
          facilities: string[]
          gallery: string[]
          id: string
          image: string | null
          name: string
          nearby: Json
          owner_id: string
          price: number
          rating: number
          reviews_count: number
          rules: string[]
          slug: string
          status: Database["public"]["Enums"]["kos_status"]
          type: Database["public"]["Enums"]["kos_type"]
          updated_at: string
          verified: boolean
        }
        Insert: {
          address: string
          all_facilities?: string[]
          area: string
          available?: number
          created_at?: string
          description?: string
          facilities?: string[]
          gallery?: string[]
          id?: string
          image?: string | null
          name: string
          nearby?: Json
          owner_id: string
          price: number
          rating?: number
          reviews_count?: number
          rules?: string[]
          slug: string
          status?: Database["public"]["Enums"]["kos_status"]
          type?: Database["public"]["Enums"]["kos_type"]
          updated_at?: string
          verified?: boolean
        }
        Update: {
          address?: string
          all_facilities?: string[]
          area?: string
          available?: number
          created_at?: string
          description?: string
          facilities?: string[]
          gallery?: string[]
          id?: string
          image?: string | null
          name?: string
          nearby?: Json
          owner_id?: string
          price?: number
          rating?: number
          reviews_count?: number
          rules?: string[]
          slug?: string
          status?: Database["public"]["Enums"]["kos_status"]
          type?: Database["public"]["Enums"]["kos_type"]
          updated_at?: string
          verified?: boolean
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          id: string
          reason: string
          reporter_id: string
          status: Database["public"]["Enums"]["report_status"]
          target_id: string
          target_type: Database["public"]["Enums"]["report_target"]
        }
        Insert: {
          created_at?: string
          id?: string
          reason: string
          reporter_id: string
          status?: Database["public"]["Enums"]["report_status"]
          target_id: string
          target_type: Database["public"]["Enums"]["report_target"]
        }
        Update: {
          created_at?: string
          id?: string
          reason?: string
          reporter_id?: string
          status?: Database["public"]["Enums"]["report_status"]
          target_id?: string
          target_type?: Database["public"]["Enums"]["report_target"]
        }
        Relationships: []
      }
      reviews: {
        Row: {
          booking_id: string | null
          created_at: string
          id: string
          kos_id: string
          rating: number
          status: Database["public"]["Enums"]["review_status"]
          tenant_id: string
          text: string
        }
        Insert: {
          booking_id?: string | null
          created_at?: string
          id?: string
          kos_id: string
          rating: number
          status?: Database["public"]["Enums"]["review_status"]
          tenant_id: string
          text: string
        }
        Update: {
          booking_id?: string | null
          created_at?: string
          id?: string
          kos_id?: string
          rating?: number
          status?: Database["public"]["Enums"]["review_status"]
          tenant_id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_kos_id_fkey"
            columns: ["kos_id"]
            isOneToOne: false
            referencedRelation: "kos"
            referencedColumns: ["id"]
          },
        ]
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
      view_history: {
        Row: {
          id: string
          kos_id: string
          tenant_id: string
          viewed_at: string
        }
        Insert: {
          id?: string
          kos_id: string
          tenant_id: string
          viewed_at?: string
        }
        Update: {
          id?: string
          kos_id?: string
          tenant_id?: string
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "view_history_kos_id_fkey"
            columns: ["kos_id"]
            isOneToOne: false
            referencedRelation: "kos"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlist: {
        Row: {
          created_at: string
          id: string
          kos_id: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          kos_id: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          kos_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_kos_id_fkey"
            columns: ["kos_id"]
            isOneToOne: false
            referencedRelation: "kos"
            referencedColumns: ["id"]
          },
        ]
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
      app_role: "tenant" | "owner" | "admin"
      booking_status:
        | "pending"
        | "awaiting_payment"
        | "awaiting_verification"
        | "confirmed"
        | "rejected"
        | "cancelled"
      kos_status: "pending" | "approved" | "rejected"
      kos_type: "Putra" | "Putri" | "Campur"
      report_status: "open" | "reviewing" | "resolved" | "dismissed"
      report_target: "kos" | "review" | "user"
      review_status: "visible" | "hidden"
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
      app_role: ["tenant", "owner", "admin"],
      booking_status: [
        "pending",
        "awaiting_payment",
        "awaiting_verification",
        "confirmed",
        "rejected",
        "cancelled",
      ],
      kos_status: ["pending", "approved", "rejected"],
      kos_type: ["Putra", "Putri", "Campur"],
      report_status: ["open", "reviewing", "resolved", "dismissed"],
      report_target: ["kos", "review", "user"],
      review_status: ["visible", "hidden"],
    },
  },
} as const
