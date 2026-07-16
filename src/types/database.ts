export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ClientStatus = "active" | "follow_up" | "archived";
export type WeddingStatus =
  | "inquiry"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled";
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskStatus = "todo" | "in_progress" | "done" | "cancelled";
export type FinancialRecordType = "revenue" | "expense" | "payment";
export type FinancialRecordStatus =
  | "pending"
  | "paid"
  | "outstanding"
  | "cancelled";

export type InviteRole =
  | "admin"
  | "coordinator"
  | "event_planner"
  | "finance"
  | "sales"
  | "designer"
  | "staff";

export type InvitationStatus = "pending" | "accepted" | "expired" | "revoked";

export type InvitationAuditAction =
  | "created"
  | "emailed"
  | "email_failed"
  | "accepted"
  | "expired"
  | "revoked"
  | "resent";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          display_name: string | null;
          avatar_url: string | null;
          company: string | null;
          role: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          company?: string | null;
          role?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          company?: string | null;
          role?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      clients: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          email: string | null;
          phone: string | null;
          status: ClientStatus;
          follow_up_at: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          status?: ClientStatus;
          follow_up_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          email?: string | null;
          phone?: string | null;
          status?: ClientStatus;
          follow_up_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      weddings: {
        Row: {
          id: string;
          user_id: string;
          client_id: string | null;
          name: string;
          wedding_date: string;
          venue: string | null;
          status: WeddingStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          client_id?: string | null;
          name: string;
          wedding_date: string;
          venue?: string | null;
          status?: WeddingStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          client_id?: string | null;
          name?: string;
          wedding_date?: string;
          venue?: string | null;
          status?: WeddingStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      meetings: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          starts_at: string;
          ends_at: string | null;
          client_id: string | null;
          wedding_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          starts_at: string;
          ends_at?: string | null;
          client_id?: string | null;
          wedding_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          starts_at?: string;
          ends_at?: string | null;
          client_id?: string | null;
          wedding_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          priority: TaskPriority;
          due_at: string | null;
          owner_id: string | null;
          status: TaskStatus;
          wedding_id: string | null;
          client_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          priority?: TaskPriority;
          due_at?: string | null;
          owner_id?: string | null;
          status?: TaskStatus;
          wedding_id?: string | null;
          client_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          priority?: TaskPriority;
          due_at?: string | null;
          owner_id?: string | null;
          status?: TaskStatus;
          wedding_id?: string | null;
          client_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      financial_records: {
        Row: {
          id: string;
          user_id: string;
          record_type: FinancialRecordType;
          amount: number;
          currency: string;
          status: FinancialRecordStatus;
          occurred_on: string;
          description: string | null;
          wedding_id: string | null;
          client_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          record_type: FinancialRecordType;
          amount: number;
          currency?: string;
          status?: FinancialRecordStatus;
          occurred_on?: string;
          description?: string | null;
          wedding_id?: string | null;
          client_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          record_type?: FinancialRecordType;
          amount?: number;
          currency?: string;
          status?: FinancialRecordStatus;
          occurred_on?: string;
          description?: string | null;
          wedding_id?: string | null;
          client_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      invitations: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          company: string;
          role: InviteRole;
          token_hash: string;
          status: InvitationStatus;
          invited_by: string;
          expires_at: string;
          accepted_at: string | null;
          accepted_user_id: string | null;
          last_sent_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          full_name: string;
          company: string;
          role: InviteRole;
          token_hash: string;
          status?: InvitationStatus;
          invited_by: string;
          expires_at: string;
          accepted_at?: string | null;
          accepted_user_id?: string | null;
          last_sent_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          company?: string;
          role?: InviteRole;
          token_hash?: string;
          status?: InvitationStatus;
          invited_by?: string;
          expires_at?: string;
          accepted_at?: string | null;
          accepted_user_id?: string | null;
          last_sent_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      invitation_audit_logs: {
        Row: {
          id: string;
          invitation_id: string | null;
          action: InvitationAuditAction;
          actor_id: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          invitation_id?: string | null;
          action: InvitationAuditAction;
          actor_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          invitation_id?: string | null;
          action?: InvitationAuditAction;
          actor_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      auth_user_exists_by_email: {
        Args: { p_email: string };
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
