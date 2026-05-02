export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "user" | "owner" | "admin";
export type OutletStatus = "pending" | "approved" | "rejected" | "archived";
export type ReviewStatus = "pending" | "approved" | "hidden" | "deleted";
export type ReportType = "wrong_location" | "wrong_hours" | "abusive_review" | "accessibility_issue" | "other";
export type ReportStatus = "open" | "in_review" | "resolved" | "rejected";
export type PhotoType = "outlet" | "product" | "menu" | "panorama";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          role: UserRole;
          avatar_url: string | null;
          accessibility_preferences: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          phone?: string | null;
          role?: UserRole;
          avatar_url?: string | null;
          accessibility_preferences?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string | null;
          role?: UserRole;
          avatar_url?: string | null;
          accessibility_preferences?: Json | null;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          icon: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          icon?: string | null;
        };
        Update: {
          name?: string;
          slug?: string;
          description?: string | null;
          icon?: string | null;
        };
      };
      outlets: {
        Row: {
          id: string;
          owner_id: string | null;
          name: string;
          slug: string;
          description: string;
          address: string;
          latitude: number;
          longitude: number;
          landmark_description: string;
          accessibility_description: string;
          whatsapp: string | null;
          opening_hours: Json;
          status: OutletStatus;
          is_accessibility_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id?: string | null;
          name: string;
          slug: string;
          description: string;
          address: string;
          latitude: number;
          longitude: number;
          landmark_description: string;
          accessibility_description: string;
          whatsapp?: string | null;
          opening_hours: Json;
          status?: OutletStatus;
          is_accessibility_verified?: boolean;
        };
        Update: {
          owner_id?: string | null;
          name?: string;
          slug?: string;
          description?: string;
          address?: string;
          latitude?: number;
          longitude?: number;
          landmark_description?: string;
          accessibility_description?: string;
          whatsapp?: string | null;
          opening_hours?: Json;
          status?: OutletStatus;
          is_accessibility_verified?: boolean;
          updated_at?: string;
        };
      };
      outlet_categories: {
        Row: {
          outlet_id: string;
          category_id: string;
        };
        Insert: {
          outlet_id: string;
          category_id: string;
        };
        Update: {
          outlet_id?: string;
          category_id?: string;
        };
      };
      products: {
        Row: {
          id: string;
          outlet_id: string;
          name: string;
          description: string;
          price: number;
          category: string | null;
          image_url: string | null;
          image_alt: string | null;
          is_available: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          outlet_id: string;
          name: string;
          description: string;
          price: number;
          category?: string | null;
          image_url?: string | null;
          image_alt?: string | null;
          is_available?: boolean;
        };
        Update: {
          name?: string;
          description?: string;
          price?: number;
          category?: string | null;
          image_url?: string | null;
          image_alt?: string | null;
          is_available?: boolean;
          updated_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          outlet_id: string;
          user_id: string;
          rating: number;
          accessibility_rating: number | null;
          comment: string;
          tags: string[] | null;
          status: ReviewStatus;
          owner_reply: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          outlet_id: string;
          user_id: string;
          rating: number;
          accessibility_rating?: number | null;
          comment: string;
          tags?: string[] | null;
          status?: ReviewStatus;
        };
        Update: {
          rating?: number;
          accessibility_rating?: number | null;
          comment?: string;
          tags?: string[] | null;
          status?: ReviewStatus;
          owner_reply?: string | null;
          updated_at?: string;
        };
      };
      photos: {
        Row: {
          id: string;
          outlet_id: string;
          product_id: string | null;
          url: string;
          alt_text: string;
          type: PhotoType;
          created_at: string;
        };
        Insert: {
          id?: string;
          outlet_id: string;
          product_id?: string | null;
          url: string;
          alt_text: string;
          type: PhotoType;
        };
        Update: {
          url?: string;
          alt_text?: string;
          type?: PhotoType;
        };
      };
      panoramas: {
        Row: {
          id: string;
          outlet_id: string;
          title: string;
          image_360_url: string;
          text_description: string;
          audio_description_url: string | null;
          latitude: number | null;
          longitude: number | null;
          heading: number | null;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          outlet_id: string;
          title: string;
          image_360_url: string;
          text_description: string;
          audio_description_url?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          heading?: number | null;
          order_index?: number;
        };
        Update: {
          title?: string;
          image_360_url?: string;
          text_description?: string;
          audio_description_url?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          heading?: number | null;
          order_index?: number;
        };
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          outlet_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          outlet_id: string;
        };
        Update: Record<string, never>;
      };
      reports: {
        Row: {
          id: string;
          user_id: string | null;
          outlet_id: string;
          type: ReportType;
          description: string;
          status: ReportStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          outlet_id: string;
          type: ReportType;
          description: string;
          status?: ReportStatus;
        };
        Update: {
          status?: ReportStatus;
          updated_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          actor_id: string;
          action: string;
          entity_type: string;
          entity_id: string;
          before: Json | null;
          after: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id: string;
          action: string;
          entity_type: string;
          entity_id: string;
          before?: Json | null;
          after?: Json | null;
        };
        Update: Record<string, never>;
      };
    };
    Enums: {
      user_role: UserRole;
      outlet_status: OutletStatus;
      review_status: ReviewStatus;
      report_type: ReportType;
      report_status: ReportStatus;
      photo_type: PhotoType;
    };
  };
}
