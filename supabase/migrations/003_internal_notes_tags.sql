-- Add internal notes and tags to properties table
-- These fields are agent-only and never exposed to clients

ALTER TABLE properties ADD COLUMN IF NOT EXISTS internal_notes TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
