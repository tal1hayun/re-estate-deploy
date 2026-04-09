import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';

// POST — client sends message via shared link token (no auth required)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { token, sender_name, message_text } = body;

  if (!message_text?.trim()) {
    return NextResponse.json({ error: 'הודעה ריקה' }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: link } = await admin
    .from('shared_links')
    .select('id, property_id, is_active')
    .eq('token', token)
    .eq('is_active', true)
    .single();

  if (!link) {
    return NextResponse.json({ error: 'קישור לא תקין' }, { status: 404 });
  }

  await admin.from('messages').insert({
    property_id: link.property_id,
    shared_link_id: link.id,
    sender_type: 'client',
    sender_name: sender_name?.trim() || 'לקוח',
    message_text: message_text.trim(),
    is_read: false,
  });

  return NextResponse.json({ ok: true });
}
