import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, createAdminClient } from '@/lib/supabase-server';

type Params = { params: Promise<{ propertyId: string }> };

// POST /api/properties/[id]/images — upload image
export async function POST(req: NextRequest, { params }: Params) {
  const { propertyId } = await params;
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: agent } = await supabase
    .from('agents')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 });

  const formData = await req.formData();
  const file = formData.get('file') as File;
  const isCover = formData.get('is_cover') === 'true';

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

  // Upload to Supabase Storage (use admin to bypass RLS on storage)
  const admin = createAdminClient();
  const ext = file.name.split('.').pop();
  const path = `${propertyId}/${Date.now()}.${ext}`;

  const { error: uploadError } = await admin.storage
    .from('property-images')
    .upload(path, file, { contentType: file.type });

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  // If cover, unset other covers first
  if (isCover) {
    await supabase
      .from('property_images')
      .update({ is_cover: false })
      .eq('property_id', propertyId);
  }

  // Save image record
  const { data, error } = await supabase
    .from('property_images')
    .insert({
      property_id: propertyId,
      storage_path: path,
      is_cover: isCover,
      uploaded_by: agent.id,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}

// DELETE /api/properties/[id]/images?imageId=xxx
export async function DELETE(req: NextRequest, { params }: Params) {
  const { propertyId } = await params;
  const imageId = req.nextUrl.searchParams.get('imageId');
  if (!imageId) return NextResponse.json({ error: 'imageId required' }, { status: 400 });

  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Get image path
  const { data: image } = await supabase
    .from('property_images')
    .select('storage_path')
    .eq('id', imageId)
    .eq('property_id', propertyId)
    .single();

  if (!image) return NextResponse.json({ error: 'Image not found' }, { status: 404 });

  // Delete from storage
  const admin = createAdminClient();
  await admin.storage.from('property-images').remove([image.storage_path]);

  // Delete record
  await supabase.from('property_images').delete().eq('id', imageId);

  return NextResponse.json({ success: true });
}
