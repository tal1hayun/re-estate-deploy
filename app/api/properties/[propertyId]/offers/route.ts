import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

type Params = { params: Promise<{ propertyId: string }> };

// GET — list offers for a property (RLS enforces privacy)
export async function GET(_req: NextRequest, { params }: Params) {
  const { propertyId } = await params;
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('offers')
    .select('*, agents(full_name)')
    .eq('property_id', propertyId)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// POST — create new offer
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

  if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 403 });

  const body = await req.json();
  const { amount, offer_date, buyer_description, status, notes, is_private } = body;

  const { data, error } = await supabase
    .from('offers')
    .insert({
      property_id: propertyId,
      agent_id: agent.id,
      amount,
      offer_date,
      buyer_description,
      status: status || 'negotiating',
      notes: notes || null,
      is_private: is_private ?? false,
    })
    .select('*, agents(full_name)')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}
