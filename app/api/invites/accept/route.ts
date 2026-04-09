import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';
import crypto from 'crypto';

function verifyToken(token: string): { org_id: string } | null {
  try {
    const [payload, sig] = token.split('.');
    if (!payload || !sig) return null;

    const expected = crypto
      .createHmac('sha256', process.env.SUPABASE_SERVICE_ROLE_KEY!)
      .update(payload)
      .digest('base64url');

    if (sig !== expected) return null;

    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (Date.now() > data.exp) return null;

    return { org_id: data.org_id };
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const { token, email, password, full_name } = await req.json();

  if (!token || !email || !password || !full_name) {
    return NextResponse.json({ error: 'נתונים חסרים' }, { status: 400 });
  }

  const parsed = verifyToken(token);
  if (!parsed) {
    return NextResponse.json({ error: 'קישור לא תקין או פג תוקף' }, { status: 400 });
  }

  const admin = createAdminClient();

  // Create user — no org_name in metadata so the trigger does nothing
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name },
  });

  if (createErr) {
    const msg = createErr.message.includes('already registered')
      ? 'כתובת המייל כבר רשומה במערכת'
      : createErr.message;
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  // Create agent record in the org
  const { error: agentErr } = await admin.from('agents').insert({
    organization_id: parsed.org_id,
    user_id: created.user.id,
    full_name,
    email,
    role: 'agent',
  });

  if (agentErr) {
    // Rollback user creation
    await admin.auth.admin.deleteUser(created.user.id);
    return NextResponse.json({ error: 'שגיאה ביצירת הסוכן: ' + agentErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (!token) return NextResponse.json({ valid: false });

  const parsed = verifyToken(token);
  if (!parsed) return NextResponse.json({ valid: false, error: 'קישור לא תקין או פג תוקף' });

  // Get org name
  const admin = createAdminClient();
  const { data: org } = await admin
    .from('organizations')
    .select('name')
    .eq('id', parsed.org_id)
    .single();

  return NextResponse.json({ valid: true, org_name: org?.name || '' });
}
