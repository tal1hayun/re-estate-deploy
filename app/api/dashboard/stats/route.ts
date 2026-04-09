import { NextResponse } from 'next/server';
import { createServerClient, createAdminClient } from '@/lib/supabase-server';

export async function GET() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'לא מחובר' }, { status: 401 });

  const { data: agent } = await supabase
    .from('agents')
    .select('organization_id')
    .eq('user_id', user.id)
    .single();

  if (!agent) return NextResponse.json({ error: 'סוכן לא נמצא' }, { status: 403 });

  const admin = createAdminClient();
  const orgId = agent.organization_id;

  // Get all property IDs in the org
  const { data: properties } = await admin
    .from('properties')
    .select('id, status')
    .eq('organization_id', orgId);

  const propertyIds = (properties || []).map(p => p.id);
  const activeProperties = (properties || []).filter(p => p.status === 'active').length;

  if (propertyIds.length === 0) {
    return NextResponse.json({ activeProperties, unreadMessages: 0, activeLinks: 0 });
  }

  const [messagesRes, linksRes] = await Promise.all([
    admin
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .in('property_id', propertyIds)
      .eq('sender_type', 'client')
      .eq('is_read', false),
    admin
      .from('shared_links')
      .select('id', { count: 'exact', head: true })
      .in('property_id', propertyIds)
      .eq('is_active', true),
  ]);

  return NextResponse.json({
    activeProperties,
    unreadMessages: messagesRes.count ?? 0,
    activeLinks: linksRes.count ?? 0,
  });
}
