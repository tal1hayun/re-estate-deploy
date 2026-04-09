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
  const { data: agents } = await admin
    .from('agents')
    .select('id, full_name, email, role, user_id, created_at')
    .eq('organization_id', agent.organization_id)
    .order('created_at', { ascending: true });

  return NextResponse.json({ agents: agents || [] });
}
