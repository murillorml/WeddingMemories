export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      weddings: {
        Row: {
          id: string
          groom_name: string
          bride_name: string
          date: string
          location: string
          banner_image: string
          description: string | null
          password: string
          email: string
          pin: string
          created_at: string
        }
        Insert: {
          id?: string
          groom_name: string
          bride_name: string
          date: string
          location: string
          banner_image: string
          description?: string | null
          password: string
          email: string
          pin: string
          created_at?: string
        }
        Update: {
          id?: string
          groom_name?: string
          bride_name?: string
          date?: string
          location?: string
          banner_image?: string
          description?: string | null
          password?: string
          email?: string
          pin?: string
          created_at?: string
        }
      }
      guests: {
        Row: {
          id: string
          name: string
          wedding_id: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          wedding_id: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          wedding_id?: string
          created_at?: string
        }
      }
      photos: {
        Row: {
          id: string
          url: string
          guest_id: string
          wedding_id: string
          created_at: string
        }
        Insert: {
          id?: string
          url: string
          guest_id: string
          wedding_id: string
          created_at?: string
        }
        Update: {
          id?: string
          url?: string
          guest_id?: string
          wedding_id?: string
          created_at?: string
        }
      }
      videos: {
        Row: {
          id: string
          url: string
          guest_id: string
          wedding_id: string
          created_at: string
        }
        Insert: {
          id?: string
          url: string
          guest_id: string
          wedding_id: string
          created_at?: string
        }
        Update: {
          id?: string
          url?: string
          guest_id?: string
          wedding_id?: string
          created_at?: string
        }
      }
      audios: {
        Row: {
          id: string
          url: string
          duration: string | null
          guest_id: string
          wedding_id: string
          created_at: string
        }
        Insert: {
          id?: string
          url: string
          duration?: string | null
          guest_id: string
          wedding_id: string
          created_at?: string
        }
        Update: {
          id?: string
          url?: string
          duration?: string | null
          guest_id?: string
          wedding_id?: string
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          content: string
          guest_id: string
          wedding_id: string
          created_at: string
        }
        Insert: {
          id?: string
          content: string
          guest_id: string
          wedding_id: string
          created_at?: string
        }
        Update: {
          id?: string
          content?: string
          guest_id?: string
          wedding_id?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}