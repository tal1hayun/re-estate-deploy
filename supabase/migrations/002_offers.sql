-- ============================================
-- OFFERS (Purchase Offers on Properties)
-- ============================================

CREATE TABLE offers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  amount NUMERIC(14, 2) NOT NULL,
  offer_date DATE NOT NULL DEFAULT CURRENT_DATE,
  buyer_description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'negotiating' CHECK (status IN ('negotiating', 'rejected')),
  notes TEXT,
  is_private BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_offers_property_id ON offers(property_id);
CREATE INDEX idx_offers_agent_id ON offers(agent_id);

-- RLS
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

-- SELECT: agents see all non-private offers in their org + own private offers
CREATE POLICY "offers_select" ON offers FOR SELECT
  USING (
    property_id IN (
      SELECT id FROM properties WHERE organization_id = get_user_org_id()
    )
    AND (is_private = false OR agent_id = get_agent_id())
  );

-- INSERT: agent must be in same org as property, and inserting as themselves
CREATE POLICY "offers_insert" ON offers FOR INSERT
  WITH CHECK (
    agent_id = get_agent_id()
    AND property_id IN (
      SELECT id FROM properties WHERE organization_id = get_user_org_id()
    )
  );

-- UPDATE: only own offers
CREATE POLICY "offers_update" ON offers FOR UPDATE
  USING (agent_id = get_agent_id());

-- DELETE: only own offers
CREATE POLICY "offers_delete" ON offers FOR DELETE
  USING (agent_id = get_agent_id());

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_offers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER offers_updated_at
  BEFORE UPDATE ON offers
  FOR EACH ROW EXECUTE FUNCTION update_offers_updated_at();
