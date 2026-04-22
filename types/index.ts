// Organization
export interface Organization {
  id: string;
  name: string;
  logo_url?: string;
  contact_email?: string;
  created_at: string;
  created_by: string;
}

// Agent (authenticated user)
export interface Agent {
  id: string;
  organization_id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  bio?: string;
  role: 'admin' | 'agent';
  created_at: string;
}

// Property
export interface Property {
  id: string;
  organization_id: string;
  agent_id: string;
  title: string;
  description?: string;
  address: string;
  city: string;
  postal_code?: string;
  country: string;
  latitude?: number;
  longitude?: number;
  current_price: number;
  listing_date: string;
  status: 'active' | 'sold' | 'inactive';
  internal_notes?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

// Property Details
export interface PropertyDetails {
  id: string;
  property_id: string;
  lot_size_sqm?: number;
  built_size_sqm?: number;
  house_age_years?: number;
  bedrooms?: number;
  bathrooms?: number;
  parking_spaces?: number;
  has_garden: boolean;
  has_pool: boolean;
  has_balcony: boolean;
  heating_type?: string;
  ac_type?: string;
  last_renovation_year?: number;
  additional_features?: string;
  created_at: string;
  updated_at: string;
}

// Price History
export interface PriceHistory {
  id: string;
  property_id: string;
  old_price: number;
  new_price: number;
  changed_by?: string;
  changed_at: string;
  reason?: string;
  created_at: string;
}

// Property Image
export interface PropertyImage {
  id: string;
  property_id: string;
  storage_path: string;
  display_order: number;
  is_cover: boolean;
  uploaded_by?: string;
  uploaded_at: string;
  created_at: string;
}

// Shared Link
export interface SharedLink {
  id: string;
  property_id: string;
  agent_id: string;
  token: string;
  client_email?: string;
  client_name?: string;
  expires_at?: string;
  access_count: number;
  last_accessed_at?: string;
  is_active: boolean;
  created_at: string;
  created_by: string;
}

// Message
export interface Message {
  id: string;
  property_id: string;
  shared_link_id?: string;
  sender_type: 'agent' | 'client';
  sender_id?: string;
  sender_name: string;
  sender_email?: string;
  message_text: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

// Offer (Purchase offer on a property)
export interface Offer {
  id: string;
  property_id: string;
  agent_id: string;
  amount: number;
  offer_date: string;
  buyer_description: string;
  status: 'negotiating' | 'rejected';
  notes: string | null;
  is_private: boolean;
  created_at: string;
  updated_at: string;
  agents?: { full_name: string };
}

// API Response
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Auth
export interface AuthUser {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    org_name?: string;
  };
}

export interface AuthContextType {
  user: AuthUser | null;
  agent: Agent | null;
  organization: Organization | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signUp: (email: string, password: string, orgName: string, fullName: string) => Promise<{ needsEmailConfirmation: boolean }>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}
