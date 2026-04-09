import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const supabase = createAdminClient();

  // Validate the token
  const { data: link } = await supabase
    .from('shared_links')
    .select('*')
    .eq('token', token)
    .eq('is_active', true)
    .single();

  if (!link) {
    return NextResponse.json({ error: 'קישור לא תקין או לא פעיל' }, { status: 404 });
  }

  if (link.expires_at && new Date(link.expires_at) < new Date()) {
    return NextResponse.json({ error: 'הקישור פג תוקף' }, { status: 410 });
  }

  // Increment access count
  await supabase
    .from('shared_links')
    .update({ access_count: link.access_count + 1, last_accessed_at: new Date().toISOString() })
    .eq('id', link.id);

  // Fetch property (with details and images, but NO price history)
  const { data: property } = await supabase
    .from('properties')
    .select(`
      id, title, address, city, description, current_price, status,
      property_details(*),
      property_images(id, storage_path, is_cover, display_order)
    `)
    .eq('id', link.property_id)
    .single();

  if (!property) {
    return NextResponse.json({ error: 'נכס לא נמצא' }, { status: 404 });
  }

  return NextResponse.json({ property, link: { id: link.id, client_name: link.client_name } });
}
