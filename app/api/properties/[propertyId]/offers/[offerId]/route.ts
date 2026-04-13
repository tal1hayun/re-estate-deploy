import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

type Params = { params: Promise<{ propertyId: string; offerId: string }> };

// PATCH — update an offer (RLS: only own offers)
export async function PATCH(req: NextRequest, { params }: Params) {
  const { offerId } = await params;
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { amount, offer_date, buyer_description, status, notes, is_private } = body;

  const { data, error } = await supabase
    .from('offers')
    .update({
      ...(amount !== undefined && { amount }),
      ...(offer_date !== undefined && { offer_date }),
      ...(buyer_description !== undefined && { buyer_description }),
      ...(status !== undefined && { status }),
      ...(notes !== undefined && { notes: notes || null }),
      ...(is_private !== undefined && { is_private }),
    })
    .eq('id', offerId)
    .select('*, agents(full_name)')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// DELETE — delete an offer (RLS: only own offers)
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { offerId } = await params;
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { error } = await supabase
    .from('offers')
    .delete()
    .eq('id', offerId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
