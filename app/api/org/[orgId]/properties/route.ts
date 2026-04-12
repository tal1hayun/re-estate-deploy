import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';

// GET /api/org/[orgId]/properties — public, no auth required
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { orgId } = await params;
  const admin = createAdminClient();

  const { data: org } = await admin
    .from('organizations')
    .select('id, name, contact_email')
    .eq('id', orgId)
    .single();

  if (!org) return NextResponse.json({ error: 'משרד לא נמצא' }, { status: 404 });

  const { data: properties } = await admin
    .from('properties')
    .select(`
      id, title, address, city, current_price, status,
      property_details(bedrooms, bathrooms, built_size_sqm, lot_size_sqm, has_garden, has_pool, has_balcony),
      property_images(id, storage_path, is_cover, display_order)
    `)
    .eq('organization_id', orgId)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  return NextResponse.json({ org, properties: properties || [] });
}
