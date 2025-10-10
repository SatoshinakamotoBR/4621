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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      auto_posts: {
        Row: {
          bot_id: string
          channel_id: string
          created_at: string
          id: string
          message: string
          scheduled_at: string | null
          sent_at: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          bot_id: string
          channel_id: string
          created_at?: string
          id?: string
          message: string
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          bot_id?: string
          channel_id?: string
          created_at?: string
          id?: string
          message?: string
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "auto_posts_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "telegram_bots"
            referencedColumns: ["id"]
          },
        ]
      }
      bot_automation_config: {
        Row: {
          auto_remove_expired: boolean | null
          bot_id: string
          created_at: string
          expiration_reminder_days: number | null
          id: string
          send_expiration_reminder: boolean | null
          send_thank_you: boolean | null
          send_welcome: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_remove_expired?: boolean | null
          bot_id: string
          created_at?: string
          expiration_reminder_days?: number | null
          id?: string
          send_expiration_reminder?: boolean | null
          send_thank_you?: boolean | null
          send_welcome?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_remove_expired?: boolean | null
          bot_id?: string
          created_at?: string
          expiration_reminder_days?: number | null
          id?: string
          send_expiration_reminder?: boolean | null
          send_thank_you?: boolean | null
          send_welcome?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bot_automation_config_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: true
            referencedRelation: "telegram_bots"
            referencedColumns: ["id"]
          },
        ]
      }
      bot_channels: {
        Row: {
          bot_id: string
          channel_id: string
          channel_name: string | null
          channel_type: string
          created_at: string
          id: string
          is_active: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bot_id: string
          channel_id: string
          channel_name?: string | null
          channel_type: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bot_id?: string
          channel_id?: string
          channel_name?: string | null
          channel_type?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bot_channels_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "telegram_bots"
            referencedColumns: ["id"]
          },
        ]
      }
      bot_message_plans: {
        Row: {
          bot_message_id: string
          bot_plan_id: string
          created_at: string
          id: string
        }
        Insert: {
          bot_message_id: string
          bot_plan_id: string
          created_at?: string
          id?: string
        }
        Update: {
          bot_message_id?: string
          bot_plan_id?: string
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      bot_messages: {
        Row: {
          bot_id: string
          button_text: string | null
          button_url: string | null
          created_at: string
          id: string
          is_active: boolean | null
          media_type: string | null
          media_url: string | null
          message_text: string
          message_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          bot_id: string
          button_text?: string | null
          button_url?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          media_type?: string | null
          media_url?: string | null
          message_text: string
          message_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          bot_id?: string
          button_text?: string | null
          button_url?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          media_type?: string | null
          media_url?: string | null
          message_text?: string
          message_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bot_messages_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "telegram_bots"
            referencedColumns: ["id"]
          },
        ]
      }
      bot_plans: {
        Row: {
          bot_id: string
          created_at: string
          duration_days: number
          id: string
          is_active: boolean | null
          payment_link: string | null
          plan_description: string | null
          plan_name: string
          price: number
          updated_at: string
          user_id: string
        }
        Insert: {
          bot_id: string
          created_at?: string
          duration_days: number
          id?: string
          is_active?: boolean | null
          payment_link?: string | null
          plan_description?: string | null
          plan_name: string
          price: number
          updated_at?: string
          user_id: string
        }
        Update: {
          bot_id?: string
          created_at?: string
          duration_days?: number
          id?: string
          is_active?: boolean | null
          payment_link?: string | null
          plan_description?: string | null
          plan_name?: string
          price?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bot_plans_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "telegram_bots"
            referencedColumns: ["id"]
          },
        ]
      }
      message_queue: {
        Row: {
          bot_id: string
          chat_id: number
          created_at: string
          error_message: string | null
          id: string
          scheduled_for: string
          scheduled_message_id: string
          sent_at: string | null
          status: string | null
          telegram_user_id: number
        }
        Insert: {
          bot_id: string
          chat_id: number
          created_at?: string
          error_message?: string | null
          id?: string
          scheduled_for: string
          scheduled_message_id: string
          sent_at?: string | null
          status?: string | null
          telegram_user_id: number
        }
        Update: {
          bot_id?: string
          chat_id?: number
          created_at?: string
          error_message?: string | null
          id?: string
          scheduled_for?: string
          scheduled_message_id?: string
          sent_at?: string | null
          status?: string | null
          telegram_user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "message_queue_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "telegram_bots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_queue_scheduled_message_id_fkey"
            columns: ["scheduled_message_id"]
            isOneToOne: false
            referencedRelation: "scheduled_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_webhooks: {
        Row: {
          bot_id: string
          created_at: string
          id: string
          payment_data: Json | null
          payment_status: string
          plan_id: string | null
          processed: boolean | null
          telegram_user_id: number
        }
        Insert: {
          bot_id: string
          created_at?: string
          id?: string
          payment_data?: Json | null
          payment_status: string
          plan_id?: string | null
          processed?: boolean | null
          telegram_user_id: number
        }
        Update: {
          bot_id?: string
          created_at?: string
          id?: string
          payment_data?: Json | null
          payment_status?: string
          plan_id?: string | null
          processed?: boolean | null
          telegram_user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "payment_webhooks_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "telegram_bots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_webhooks_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "bot_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      received_messages: {
        Row: {
          bot_id: string
          chat_id: number
          created_at: string
          first_name: string | null
          id: string
          message_text: string | null
          message_type: string | null
          telegram_message_id: number
          user_id: number
          username: string | null
        }
        Insert: {
          bot_id: string
          chat_id: number
          created_at?: string
          first_name?: string | null
          id?: string
          message_text?: string | null
          message_type?: string | null
          telegram_message_id: number
          user_id: number
          username?: string | null
        }
        Update: {
          bot_id?: string
          chat_id?: number
          created_at?: string
          first_name?: string | null
          id?: string
          message_text?: string | null
          message_type?: string | null
          telegram_message_id?: number
          user_id?: number
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "received_messages_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "telegram_bots"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_message_plans: {
        Row: {
          bot_plan_id: string
          created_at: string
          discount_percentage: number | null
          id: string
          scheduled_message_id: string
        }
        Insert: {
          bot_plan_id: string
          created_at?: string
          discount_percentage?: number | null
          id?: string
          scheduled_message_id: string
        }
        Update: {
          bot_plan_id?: string
          created_at?: string
          discount_percentage?: number | null
          id?: string
          scheduled_message_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_message_plans_bot_plan_id_fkey"
            columns: ["bot_plan_id"]
            isOneToOne: false
            referencedRelation: "bot_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_message_plans_scheduled_message_id_fkey"
            columns: ["scheduled_message_id"]
            isOneToOne: false
            referencedRelation: "scheduled_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_messages: {
        Row: {
          bot_id: string
          button_text: string | null
          button_url: string | null
          created_at: string
          delay_minutes: number
          id: string
          is_active: boolean | null
          media_type: string | null
          media_url: string | null
          message_text: string
          updated_at: string
          user_id: string
        }
        Insert: {
          bot_id: string
          button_text?: string | null
          button_url?: string | null
          created_at?: string
          delay_minutes: number
          id?: string
          is_active?: boolean | null
          media_type?: string | null
          media_url?: string | null
          message_text: string
          updated_at?: string
          user_id: string
        }
        Update: {
          bot_id?: string
          button_text?: string | null
          button_url?: string | null
          created_at?: string
          delay_minutes?: number
          id?: string
          is_active?: boolean | null
          media_type?: string | null
          media_url?: string | null
          message_text?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_messages_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "telegram_bots"
            referencedColumns: ["id"]
          },
        ]
      }
      telegram_bots: {
        Row: {
          bot_name: string
          bot_token: string
          bot_username: string | null
          created_at: string
          id: string
          is_active: boolean | null
          pushinpay_active: boolean | null
          pushinpay_token: string | null
          pushinpay_token_preview: string | null
          pushinpay_updated_at: string | null
          support_channel_id: string | null
          updated_at: string
          user_id: string
          vip_channel_id: string | null
          webhook_secret: string | null
          welcome_image_url: string | null
        }
        Insert: {
          bot_name: string
          bot_token: string
          bot_username?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          pushinpay_active?: boolean | null
          pushinpay_token?: string | null
          pushinpay_token_preview?: string | null
          pushinpay_updated_at?: string | null
          support_channel_id?: string | null
          updated_at?: string
          user_id: string
          vip_channel_id?: string | null
          webhook_secret?: string | null
          welcome_image_url?: string | null
        }
        Update: {
          bot_name?: string
          bot_token?: string
          bot_username?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          pushinpay_active?: boolean | null
          pushinpay_token?: string | null
          pushinpay_token_preview?: string | null
          pushinpay_updated_at?: string | null
          support_channel_id?: string | null
          updated_at?: string
          user_id?: string
          vip_channel_id?: string | null
          webhook_secret?: string | null
          welcome_image_url?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          bot_id: string | null
          created_at: string
          description: string | null
          expires_at: string | null
          id: string
          paid_at: string | null
          payer_cpf: string | null
          payer_name: string | null
          platform_fee: number
          pushinpay_id: string | null
          qr_code: string | null
          qr_code_base64: string | null
          status: string
          updated_at: string
          user_id: string
          user_value: number
          value: number
        }
        Insert: {
          bot_id?: string | null
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          paid_at?: string | null
          payer_cpf?: string | null
          payer_name?: string | null
          platform_fee?: number
          pushinpay_id?: string | null
          qr_code?: string | null
          qr_code_base64?: string | null
          status?: string
          updated_at?: string
          user_id: string
          user_value: number
          value: number
        }
        Update: {
          bot_id?: string | null
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          paid_at?: string | null
          payer_cpf?: string | null
          payer_name?: string | null
          platform_fee?: number
          pushinpay_id?: string | null
          qr_code?: string | null
          qr_code_base64?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          user_value?: number
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "transactions_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "telegram_bots"
            referencedColumns: ["id"]
          },
        ]
      }
      user_interactions: {
        Row: {
          bot_id: string
          chat_id: number
          created_at: string
          id: string
          last_start_at: string | null
          telegram_user_id: number
          updated_at: string
        }
        Insert: {
          bot_id: string
          chat_id: number
          created_at?: string
          id?: string
          last_start_at?: string | null
          telegram_user_id: number
          updated_at?: string
        }
        Update: {
          bot_id?: string
          chat_id?: number
          created_at?: string
          id?: string
          last_start_at?: string | null
          telegram_user_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_interactions_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "telegram_bots"
            referencedColumns: ["id"]
          },
        ]
      }
      user_uploads: {
        Row: {
          bot_id: string
          created_at: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          sent_to_support: boolean | null
          telegram_user_id: number
        }
        Insert: {
          bot_id: string
          created_at?: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          sent_to_support?: boolean | null
          telegram_user_id: number
        }
        Update: {
          bot_id?: string
          created_at?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          sent_to_support?: boolean | null
          telegram_user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_uploads_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "telegram_bots"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_bot_token: {
        Args: { bot_id_param: string }
        Returns: string
      }
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
