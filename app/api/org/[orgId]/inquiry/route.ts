import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';

// POST /api/org/[orgId]/inquiry — public client inquiry about a property
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { orgId } = await params;
  const body = await req.json();
  const { property_id, sender_name, message_text } = body;

  if (!message_text?.trim()) {
    return NextResponse.json({ error: 'הודעה ריקה' }, { status: 400 });
  }
  if (!property_id) {
    return NextResponse.json({ error: 'נכס לא צוין' }, { status: 400 });
  }

  const admin = createAdminClient();

  // Validate property belongs to this org and is active
  const { data: property } = await admin
    .from('properties')
    .select('id')
    .eq('id', property_id)
    .eq('organization_id', orgId)
    .eq('status', 'active')
    .single();

  if (!property) {
    return NextResponse.json({ error: 'נכס לא נמצא' }, { status: 404 });
  }

  const { error: msgErr } = await admin.from('messages').insert({
    property_id,
    shared_link_id: null,
    sender_type: 'client',
    sender_name: sender_name?.trim() || 'לקוח',
    message_text: message_text.trim(),
    is_read: false,
  });

  if (msgErr) return NextResponse.json({ error: msgErr.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
