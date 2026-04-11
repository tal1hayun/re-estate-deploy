import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, createAdminClient } from '@/lib/supabase-server';

type Params = { params: Promise<{ agentId: string }> };

// DELETE /api/organization/agents/[agentId] — admin only
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { agentId } = await params;
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'לא מחובר' }, { status: 401 });

  const admin = createAdminClient();

  // Get caller's agent
  const { data: callerAgent } = await admin
    .from('agents')
    .select('id, role, organization_id')
    .eq('user_id', user.id)
    .single();

  if (!callerAgent || callerAgent.role !== 'admin') {
    return NextResponse.json({ error: 'הרשאת מנהל נדרשת' }, { status: 403 });
  }

  // Get target agent
  const { data: targetAgent } = await admin
    .from('agents')
    .select('id, role, organization_id')
    .eq('id', agentId)
    .single();

  if (!targetAgent) return NextResponse.json({ error: 'סוכן לא נמצא' }, { status: 404 });

  // Must be same org
  if (targetAgent.organization_id !== callerAgent.organization_id) {
    return NextResponse.json({ error: 'אין הרשאה' }, { status: 403 });
  }

  // Cannot remove self
  if (targetAgent.id === callerAgent.id) {
    return NextResponse.json({ error: 'לא ניתן להסיר את עצמך' }, { status: 400 });
  }

  // Cannot remove another admin
  if (targetAgent.role === 'admin') {
    return NextResponse.json({ error: 'לא ניתן להסיר מנהל' }, { status: 400 });
  }

  const { error } = await admin
    .from('agents')
    .delete()
    .eq('id', agentId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
