import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

type Params = { params: Promise<{ propertyId: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  const { propertyId } = await params;
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: property, error } = await supabase
    .from('properties')
    .select('*, property_details(*)')
    .eq('id', propertyId)
    .single();

  if (error || !property) {
    return NextResponse.json({ error: 'Property not found' }, { status: 404 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'AI service not configured' }, { status: 500 });
  }

  const d = property.property_details;

  const lines: string[] = [];
  lines.push(`כותרת: ${property.title}`);
  lines.push(`עיר: ${property.city}${property.address ? ', ' + property.address : ''}`);
  lines.push(`מחיר: ₪${property.current_price.toLocaleString('he-IL')}`);
  if (d?.bedrooms) lines.push(`חדרים: ${d.bedrooms}`);
  if (d?.bathrooms) lines.push(`חדרי אמבטיה: ${d.bathrooms}`);
  if (d?.built_size_sqm) lines.push(`שטח בנוי: ${d.built_size_sqm} מ"ר`);
  if (d?.lot_size_sqm) lines.push(`שטח מגרש: ${d.lot_size_sqm} מ"ר`);
  if (d?.parking_spaces) lines.push(`חניות: ${d.parking_spaces}`);
  if (d?.house_age_years) lines.push(`גיל הנכס: ${d.house_age_years} שנים`);
  const extras: string[] = [];
  if (d?.has_garden) extras.push('גינה');
  if (d?.has_balcony) extras.push('מרפסת');
  if (d?.has_pool) extras.push('בריכה');
  if (extras.length) lines.push(`מאפיינים: ${extras.join(', ')}`);
  if (d?.additional_features) lines.push(`פרטים נוספים: ${d.additional_features}`);
  if (property.description) lines.push(`תיאור: ${property.description}`);

  const propertyInfo = lines.join('\n');

  const systemPrompt = `אתה סוכן נדל"ן מקצועי שכותב פוסטים לפייסבוק בעברית.
כללים:
- כתוב בעברית בלבד
- שורות קצרות ונקיות
- סגנון טבעי ומקצועי, לא צעקני
- בלי קלישאות, בלי הגזמות, מינימום סימני קריאה
- פתיחה מושכת אך טבעית
- הדגש יתרונות אמיתיים בלבד
- מחיר בשורה נפרדת וברורה
- סיום קצר ופשוט
- אורך: 6-12 שורות סה"כ`;

  const userPrompt = `כתוב פוסט פייסבוק עבור הנכס הבא:

${propertyInfo}`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error('Anthropic API error:', response.status, errText);
    return NextResponse.json({ error: 'שגיאה ביצירת הטקסט' }, { status: 500 });
  }

  const result = await response.json();
  const text: string = result.content?.[0]?.text ?? '';
  return NextResponse.json({ text });
}
