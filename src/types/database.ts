/**
 * Enum Types
 */
export type SubscriptionPlan = 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
export type BookingStatus =
  | 'VISIT_SCHEDULED'
  | 'BUDGET_SENT'
  | 'CONTRACT_SIGNED'
  | 'DEPOSIT_PAID'
  | 'EVENT_CLOSED'
  | 'CANCELLED';
export type LeadStatus =
  | 'NEW'
  | 'QUALIFIED'
  | 'NURTURING'
  | 'VISIT_SCHEDULED'
  | 'CONVERTED'
  | 'LOST';
export type DateSlotStatus =
  | 'AVAILABLE'
  | 'SOFT_BLOCK'
  | 'RESERVED'
  | 'TECHNICAL_BLOCK'
  | 'MAINTENANCE';
export type PaymentStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'REFUNDED' | 'CANCELLED';
export type LeadSource =
  | 'WEB'
  | 'REFERRAL'
  | 'SOCIAL_MEDIA'
  | 'WHATSAPP'
  | 'PHONE'
  | 'EVENT'
  | 'OTHER';
export type ConversationChannel =
  | 'WHATSAPP'
  | 'WEB_CHAT'
  | 'EMAIL'
  | 'PHONE'
  | 'SMS';
export type MessageSenderType = 'AGENT' | 'LEAD' | 'AI_BOT' | 'SYSTEM';

/**
 * Provider - Venue provider/business account
 */
export interface Provider {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  subscription_plan: SubscriptionPlan;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Venue - Individual venue managed by a provider
 */
export interface Venue {
  id: string;
  provider_id: string;
  name: string;
  description: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  max_guests: number;
  base_price_clp: number; // in centavos
  currency: 'CLP';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * DateSlot - Available or blocked date for a venue
 */
export interface DateSlot {
  id: string;
  venue_id: string;
  date: string; // YYYY-MM-DD
  status: DateSlotStatus;
  booked_by_couple_id: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
}

/**
 * PricingRule - Dynamic pricing rules for venues
 */
export interface PricingRule {
  id: string;
  venue_id: string;
  name: string;
  guest_count_min: number;
  guest_count_max: number;
  price_per_guest_clp: number; // in centavos
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Couple - Engaged couple/client
 */
export interface Couple {
  id: string;
  partner_one_name: string;
  partner_two_name: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  wedding_date: string; // YYYY-MM-DD
  estimated_guests: number;
  budget_clp: number; // in centavos
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Lead - Sales lead (usually a Couple)
 */
export interface Lead {
  id: string;
  couple_id: string;
  provider_id: string;
  status: LeadStatus;
  source: LeadSource;
  assigned_to_agent_id: string | null;
  first_contact_date: string;
  last_contact_date: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

/**
 * Booking - Venue booking/reservation
 */
export interface Booking {
  id: string;
  couple_id: string;
  venue_id: string;
  lead_id: string | null;
  date: string; // YYYY-MM-DD
  status: BookingStatus;
  guest_count: number;
  total_price_clp: number; // in centavos
  notes: string;
  created_at: string;
  updated_at: string;
}

/**
 * Payment - Payment record for a booking
 */
export interface Payment {
  id: string;
  booking_id: string;
  amount_clp: number; // in centavos
  status: PaymentStatus;
  payment_date: string | null;
  due_date: string;
  payment_method: string;
  transaction_id: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
}

/**
 * SalesAgent - Agent managing leads and bookings
 */
export interface SalesAgent {
  id: string;
  provider_id: string;
  name: string;
  email: string;
  phone: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Conversation - Communication thread between agent and lead
 */
export interface Conversation {
  id: string;
  lead_id: string;
  agent_id: string | null;
  channel: ConversationChannel;
  subject: string;
  status: 'ACTIVE' | 'CLOSED' | 'ARCHIVED';
  started_at: string;
  ended_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Message - Individual message in a conversation
 */
export interface Message {
  id: string;
  conversation_id: string;
  sender_type: MessageSenderType;
  sender_id: string | null; // agent_id or lead_id or null for system
  content: string;
  attachments: string[]; // URLs
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Visit - Venue visit scheduled with a couple
 */
export interface Visit {
  id: string;
  booking_id: string | null;
  lead_id: string;
  venue_id: string;
  agent_id: string;
  scheduled_date: string; // ISO datetime
  notes: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  feedback: string;
  created_at: string;
  updated_at: string;
}

/**
 * Notification - System notification
 */
export interface Notification {
  id: string;
  recipient_id: string; // agent_id or couple_id
  recipient_type: 'AGENT' | 'COUPLE';
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  link: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Supabase Database Type
 */
export interface Database {
  public: {
    Tables: {
      providers: {
        Row: Provider;
        Insert: Omit<Provider, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Provider, 'id' | 'created_at' | 'updated_at'>>;
      };
      venues: {
        Row: Venue;
        Insert: Omit<Venue, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Venue, 'id' | 'created_at' | 'updated_at'>>;
      };
      date_slots: {
        Row: DateSlot;
        Insert: Omit<DateSlot, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<DateSlot, 'id' | 'created_at' | 'updated_at'>>;
      };
      pricing_rules: {
        Row: PricingRule;
        Insert: Omit<PricingRule, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<PricingRule, 'id' | 'created_at' | 'updated_at'>>;
      };
      couples: {
        Row: Couple;
        Insert: Omit<Couple, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Couple, 'id' | 'created_at' | 'updated_at'>>;
      };
      leads: {
        Row: Lead;
        Insert: Omit<Lead, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Lead, 'id' | 'created_at' | 'updated_at'>>;
      };
      bookings: {
        Row: Booking;
        Insert: Omit<Booking, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Booking, 'id' | 'created_at' | 'updated_at'>>;
      };
      payments: {
        Row: Payment;
        Insert: Omit<Payment, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Payment, 'id' | 'created_at' | 'updated_at'>>;
      };
      sales_agents: {
        Row: SalesAgent;
        Insert: Omit<SalesAgent, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<SalesAgent, 'id' | 'created_at' | 'updated_at'>>;
      };
      conversations: {
        Row: Conversation;
        Insert: Omit<Conversation, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Conversation, 'id' | 'created_at' | 'updated_at'>>;
      };
      messages: {
        Row: Message;
        Insert: Omit<Message, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Message, 'id' | 'created_at' | 'updated_at'>>;
      };
      visits: {
        Row: Visit;
        Insert: Omit<Visit, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Visit, 'id' | 'created_at' | 'updated_at'>>;
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Notification, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
