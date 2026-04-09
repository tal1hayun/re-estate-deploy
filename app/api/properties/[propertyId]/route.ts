import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

type Params = { params: Promise<{ propertyId: string }> };

// GET /api/properties/[id]
export async function GET(_req: NextRequest, { params }: Params) {
  const { propertyId } = await params;
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('properties')
    .select(`
      *,
      agents(id, full_name, email, avatar_url, phone),
      property_details(*),
      property_images(id, storage_path, is_cover, display_order)
    `)
    .eq('id', propertyId)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ data });
}

// PATCH /api/properties/[id]
export async function PATCH(req: NextRequest, { params }: Params) {
  const { propertyId } = await params;
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { details, ...propertyFields } = body;

  // Update property (RLS enforces ownership)
  const { data, error } = await supabase
    .from('properties')
    .update(propertyFields)
    .eq('id', propertyId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Update details if provided
  if (details) {
    await supabase
      .from('property_details')
      .upsert({ property_id: propertyId, ...details });
  }

  return NextResponse.json({ data });
}

// DELETE /api/properties/[id]
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { propertyId } = await params;
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { error } = await supabase
    .from('properties')
    .delete()
    .eq('id', propertyId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
