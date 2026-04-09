import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

type Params = { params: Promise<{ propertyId: string }> };

// GET price history
export async function GET(_req: NextRequest, { params }: Params) {
  const { propertyId } = await params;
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('price_history')
    .select('*, agents(full_name)')
    .eq('property_id', propertyId)
    .order('changed_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// POST — update price (creates history entry + updates property)
export async function POST(req: NextRequest, { params }: Params) {
  const { propertyId } = await params;
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: agent } = await supabase
    .from('agents')
    .select('id')
    .eq('user_id', user.id)
    .single();

  const { new_price, reason } = await req.json();

  // Get current price
  const { data: property } = await supabase
    .from('properties')
    .select('current_price')
    .eq('id', propertyId)
    .single();

  if (!property) return NextResponse.json({ error: 'Property not found' }, { status: 404 });

  // Insert history record
  await supabase.from('price_history').insert({
    property_id: propertyId,
    old_price: property.current_price,
    new_price,
    changed_by: agent?.id,
    reason: reason || null,
  });

  // Update current price
  const { data, error } = await supabase
    .from('properties')
    .update({ current_price: new_price })
    .eq('id', propertyId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
