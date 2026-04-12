import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';

// GET /api/properties/public — public, no auth required
// Returns all active properties across all organizations
export async function GET() {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from('properties')
    .select(`
      id, title, address, city, current_price, organization_id,
      organizations(id, name),
      property_details(bedrooms, bathrooms, built_size_sqm, lot_size_sqm, has_garden, has_pool, has_balcony),
      property_images(id, storage_path, is_cover, display_order)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ properties: data || [] });
}
