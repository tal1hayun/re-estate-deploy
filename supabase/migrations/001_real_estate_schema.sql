-- Real Estate Agent Platform - Database Schema
-- Tech: Supabase PostgreSQL + RLS
-- Two-tier access: Agents (org-based) + Clients (shared link)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ORGANIZATIONS (Agent Brokerages)
-- ============================================
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  logo_url TEXT,
  contact_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- ============================================
-- AGENTS (Professional Users)
-- ============================================
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  bio TEXT,
  role TEXT DEFAULT 'agent' CHECK (role IN ('admin', 'agent')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

-- ============================================
-- PROPERTIES (Main Asset)
-- ============================================
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  postal_code TEXT,
  country TEXT DEFAULT 'Israel',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  current_price DECIMAL(12, 2) NOT NULL,
  listing_date TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PROPERTY DETAILS
-- ============================================
CREATE TABLE property_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL UNIQUE REFERENCES properties(id) ON DELETE CASCADE,
  lot_size_sqm DECIMAL(10, 2),
  built_size_sqm DECIMAL(10, 2),
  house_age_years INTEGER,
  bedrooms INTEGER,
  bathrooms DECIMAL(3, 1),
  parking_spaces INTEGER,
  has_garden BOOLEAN DEFAULT FALSE,
  has_pool BOOLEAN DEFAULT FALSE,
  has_balcony BOOLEAN DEFAULT FALSE,
  heating_type TEXT,
  ac_type TEXT,
  last_renovation_year INTEGER,
  additional_features TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PRICE HISTORY
-- ============================================
CREATE TABLE price_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  old_price DECIMAL(12, 2) NOT NULL,
  new_price DECIMAL(12, 2) NOT NULL,
  changed_by UUID REFERENCES agents(id),
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PROPERTY IMAGES
-- ============================================
CREATE TABLE property_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_cover BOOLEAN DEFAULT FALSE,
  uploaded_by UUID REFERENCES agents(id),
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SHARED LINKS (Client Access Tokens)
-- ============================================
CREATE TABLE shared_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES agents(id),
  token TEXT UNIQUE NOT NULL,
  client_email TEXT,
  client_name TEXT,
  expires_at TIMESTAMPTZ,
  access_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES agents(id)
);

-- ============================================
-- MESSAGES (Agent <-> Client via Shared Link)
-- ============================================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  shared_link_id UUID REFERENCES shared_links(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('agent', 'client')),
  sender_id UUID REFERENCES auth.users(id),
  sender_name TEXT NOT NULL,
  sender_email TEXT,
  message_text TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES (Performance)
-- ============================================
CREATE INDEX idx_agents_org ON agents(organization_id);
CREATE INDEX idx_agents_user ON agents(user_id);
CREATE INDEX idx_properties_org ON properties(organization_id);
CREATE INDEX idx_properties_agent ON properties(agent_id);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_price_history_property ON price_history(property_id);
CREATE INDEX idx_property_images_property ON property_images(property_id);
CREATE INDEX idx_shared_links_property ON shared_links(property_id);
CREATE INDEX idx_shared_links_token ON shared_links(token);
CREATE INDEX idx_messages_property ON messages(property_id);
CREATE INDEX idx_messages_link ON messages(shared_link_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);

-- ============================================
-- RLS POLICIES
-- ============================================

-- HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION get_user_org_id()
RETURNS UUID AS $$
  SELECT organization_id FROM agents
  WHERE user_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION get_agent_id()
RETURNS UUID AS $$
  SELECT id FROM agents
  WHERE user_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_agent_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM agents
    WHERE user_id = auth.uid() AND role = 'admin' AND organization_id = get_user_org_id()
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ORGANIZATIONS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_select" ON organizations FOR SELECT
  USING (id IN (SELECT organization_id FROM agents WHERE user_id = auth.uid()));

-- AGENTS
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "agents_select" ON agents FOR SELECT
  USING (organization_id = get_user_org_id());
CREATE POLICY "agents_admin_modify" ON agents FOR ALL
  USING (organization_id = get_user_org_id() AND is_agent_admin());
CREATE POLICY "agents_update_self" ON agents FOR UPDATE
  USING (user_id = auth.uid());

-- PROPERTIES
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "properties_read" ON properties FOR SELECT
  USING (organization_id = get_user_org_id());
CREATE POLICY "properties_insert" ON properties FOR INSERT
  WITH CHECK (agent_id = get_agent_id() AND organization_id = get_user_org_id());
CREATE POLICY "properties_update_own" ON properties FOR UPDATE
  USING (agent_id = get_agent_id());
CREATE POLICY "properties_delete_own" ON properties FOR DELETE
  USING (agent_id = get_agent_id());

-- PROPERTY_DETAILS
ALTER TABLE property_details ENABLE ROW LEVEL SECURITY;
CREATE POLICY "details_select" ON property_details FOR SELECT
  USING (property_id IN (
    SELECT id FROM properties WHERE organization_id = get_user_org_id()
  ));
CREATE POLICY "details_modify" ON property_details FOR ALL
  USING (property_id IN (
    SELECT id FROM properties WHERE agent_id = get_agent_id()
  ));

-- PRICE_HISTORY
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "price_select" ON price_history FOR SELECT
  USING (property_id IN (
    SELECT id FROM properties WHERE organization_id = get_user_org_id()
  ));
CREATE POLICY "price_insert" ON price_history FOR INSERT
  WITH CHECK (property_id IN (
    SELECT id FROM properties WHERE agent_id = get_agent_id()
  ));

-- PROPERTY_IMAGES
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "images_select" ON property_images FOR SELECT
  USING (property_id IN (
    SELECT id FROM properties WHERE organization_id = get_user_org_id()
  ));
CREATE POLICY "images_modify" ON property_images FOR ALL
  USING (property_id IN (
    SELECT id FROM properties WHERE agent_id = get_agent_id()
  ));

-- SHARED_LINKS
ALTER TABLE shared_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "links_select_agent" ON shared_links FOR SELECT
  USING (property_id IN (
    SELECT id FROM properties WHERE organization_id = get_user_org_id()
  ));
CREATE POLICY "links_modify_agent" ON shared_links FOR ALL
  USING (agent_id = get_agent_id());

-- MESSAGES
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "messages_select_agent" ON messages FOR SELECT
  USING (property_id IN (
    SELECT id FROM properties WHERE organization_id = get_user_org_id()
  ));
CREATE POLICY "messages_insert_agent" ON messages FOR INSERT
  WITH CHECK (sender_type = 'agent' AND sender_id = auth.uid());

-- ============================================
-- TRIGGERS & FUNCTIONS
-- ============================================

-- Auto-create agent on signup
CREATE OR REPLACE FUNCTION handle_new_user_signup()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.raw_user_meta_data->>'org_name' IS NOT NULL THEN
    INSERT INTO organizations (name, created_by)
    VALUES (NEW.raw_user_meta_data->>'org_name', NEW.id);

    INSERT INTO agents (
      organization_id,
      user_id,
      full_name,
      email,
      role
    ) VALUES (
      (SELECT id FROM organizations WHERE created_by = NEW.id ORDER BY created_at DESC LIMIT 1),
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
      NEW.email,
      'admin'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user_signup();

-- Update property.updated_at on change
CREATE OR REPLACE FUNCTION update_property_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER property_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_property_timestamp();

-- Increment shared link access count
CREATE OR REPLACE FUNCTION increment_link_access()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE shared_links
  SET access_count = access_count + 1,
      last_accessed_at = NOW()
  WHERE id = NEW.shared_link_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER message_increment_link_access
  AFTER INSERT ON messages
  FOR EACH ROW
  WHEN (NEW.shared_link_id IS NOT NULL)
  EXECUTE FUNCTION increment_link_access();

-- ============================================
-- ENABLE REALTIME
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE properties;
ALTER PUBLICATION supabase_realtime ADD TABLE price_history;
ALTER PUBLICATION supabase_realtime ADD TABLE property_images;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
