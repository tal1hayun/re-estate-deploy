import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, createAdminClient } from '@/lib/supabase-server';

type Params = { params: Promise<{ agentId: string }> };

// DELETE /api/organization/agents/[agentId]?deleteProperties=true|false — admin only
export async function DELETE(req: NextRequest, { params }: Params) {
  const { agentId } = await params;
  const deleteProperties = new URL(req.url).searchParams.get('deleteProperties') === 'true';

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

  if (deleteProperties) {
    // Delete the agent's properties (shared_links cascade from properties via FK)
    const { error: propErr } = await admin
      .from('properties')
      .delete()
      .eq('agent_id', agentId);
    if (propErr) return NextResponse.json({ error: propErr.message }, { status: 500 });
  } else {
    // Reassign properties to the calling admin
    const { error: reassignErr } = await admin
      .from('properties')
      .update({ agent_id: callerAgent.id })
      .eq('agent_id', agentId);
    if (reassignErr) return NextResponse.json({ error: reassignErr.message }, { status: 500 });
  }

  // Delete any remaining shared_links by this agent (no CASCADE on agent_id FK)
  const { error: linksErr } = await admin
    .from('shared_links')
    .delete()
    .eq('agent_id', agentId);
  if (linksErr) return NextResponse.json({ error: linksErr.message }, { status: 500 });

  const { error } = await admin
    .from('agents')
    .delete()
    .eq('id', agentId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
