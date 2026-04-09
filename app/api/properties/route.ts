import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

// GET /api/properties — all org properties
export async function GET() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('properties')
    .select(`
      *,
      agents(id, full_name, email, avatar_url),
      property_details(*),
      property_images(id, storage_path, is_cover, display_order)
    `)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// POST /api/properties — create property (owned by current agent)
export async function POST(req: NextRequest) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Get agent row
  const { data: agent } = await supabase
    .from('agents')
    .select('id, organization_id')
    .eq('user_id', user.id)
    .single();

  if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 });

  const body = await req.json();
  const { title, description, address, city, current_price, details } = body;

  // Create property
  const { data: property, error } = await supabase
    .from('properties')
    .insert({
      title,
      description,
      address,
      city,
      current_price,
      agent_id: agent.id,
      organization_id: agent.organization_id,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Create property_details if provided
  if (details && property) {
    await supabase.from('property_details').insert({
      property_id: property.id,
      ...details,
    });
  }

  return NextResponse.json({ data: property }, { status: 201 });
}
