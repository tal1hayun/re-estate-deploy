import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, createAdminClient } from '@/lib/supabase-server';

// GET — fetch messages for a property (agent auth)
export async function GET(req: NextRequest) {
  const propertyId = req.nextUrl.searchParams.get('property_id');
  if (!propertyId) return NextResponse.json({ error: 'missing property_id' }, { status: 400 });

  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'לא מחובר' }, { status: 401 });

  const admin = createAdminClient();
  const { data } = await admin
    .from('messages')
    .select('*')
    .eq('property_id', propertyId)
    .order('created_at', { ascending: true });

  return NextResponse.json({ messages: data || [] });
}

// POST — agent sends reply
export async function POST(req: NextRequest) {
  const { property_id, message_text } = await req.json();

  if (!message_text?.trim()) {
    return NextResponse.json({ error: 'הודעה ריקה' }, { status: 400 });
  }

  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'לא מחובר' }, { status: 401 });

  const { data: agent } = await supabase
    .from('agents')
    .select('id, full_name')
    .eq('user_id', user.id)
    .single();

  if (!agent) return NextResponse.json({ error: 'סוכן לא נמצא' }, { status: 403 });

  const admin = createAdminClient();
  const { error } = await admin.from('messages').insert({
    property_id,
    sender_type: 'agent',
    sender_id: user.id,
    sender_name: agent.full_name,
    message_text: message_text.trim(),
    is_read: true,
  });

  if (error) {
    console.error('messages insert error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
