import { NextResponse } from 'next/server';
import { createServerClient, createAdminClient } from '@/lib/supabase-server';

export async function GET() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'לא מחובר' }, { status: 401 });

  // Get agent's org
  const { data: agent } = await supabase
    .from('agents')
    .select('organization_id')
    .eq('user_id', user.id)
    .single();

  if (!agent) return NextResponse.json({ error: 'סוכן לא נמצא' }, { status: 403 });

  const admin = createAdminClient();

  // Get all properties in org with their messages
  const { data: properties } = await admin
    .from('properties')
    .select('id, title, city')
    .eq('organization_id', agent.organization_id);

  if (!properties?.length) return NextResponse.json({ groups: [] });

  const propertyIds = properties.map(p => p.id);

  // Get all messages for these properties
  const { data: messages } = await admin
    .from('messages')
    .select('*')
    .in('property_id', propertyIds)
    .order('created_at', { ascending: false });

  if (!messages?.length) return NextResponse.json({ groups: [] });

  // Group by property
  const propMap = Object.fromEntries(properties.map(p => [p.id, p]));
  const grouped: Record<string, { messages: typeof messages; unread: number }> = {};

  for (const msg of messages) {
    if (!grouped[msg.property_id]) {
      grouped[msg.property_id] = { messages: [], unread: 0 };
    }
    grouped[msg.property_id].messages.push(msg);
    if (msg.sender_type === 'client' && !msg.is_read) {
      grouped[msg.property_id].unread++;
    }
  }

  const groups = Object.entries(grouped)
    .map(([property_id, { messages, unread }]) => ({
      property_id,
      property_title: propMap[property_id]?.title || '',
      property_city: propMap[property_id]?.city || '',
      messages,
      unread,
      last_message: messages[0], // already sorted desc
    }))
    .sort((a, b) => new Date(b.last_message.created_at).getTime() - new Date(a.last_message.created_at).getTime());

  return NextResponse.json({ groups });
}
