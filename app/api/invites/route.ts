import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import crypto from 'crypto';

function generateToken(orgId: string): string {
  const payload = Buffer.from(
    JSON.stringify({ org_id: orgId, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 })
  ).toString('base64url');
  const sig = crypto
    .createHmac('sha256', process.env.SUPABASE_SERVICE_ROLE_KEY!)
    .update(payload)
    .digest('base64url');
  return `${payload}.${sig}`;
}

export async function POST(req: NextRequest) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'לא מחובר' }, { status: 401 });

  const { data: agent } = await supabase
    .from('agents')
    .select('organization_id, role')
    .eq('user_id', user.id)
    .single();

  if (!agent) return NextResponse.json({ error: 'סוכן לא נמצא' }, { status: 403 });
  if (agent.role !== 'admin') return NextResponse.json({ error: 'נדרשות הרשאות מנהל' }, { status: 403 });

  const token = generateToken(agent.organization_id);
  const baseUrl = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || '';
  const inviteUrl = `${baseUrl}/invite/${token}`;

  return NextResponse.json({ inviteUrl, token });
}
