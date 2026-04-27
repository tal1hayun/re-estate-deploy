import type { Metadata } from 'next';
import { createAdminClient } from '@/lib/supabase-server';
import ClientPropertyView from './ClientPropertyView';

const siteUrl = 'https://talestate.vercel.app';
const ogImageUrl = `${siteUrl}/og-image.png`;

type Props = { params: Promise<{ token: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;

  try {
    const supabase = createAdminClient();

    const { data: link } = await supabase
      .from('shared_links')
      .select('property_id, is_active, expires_at')
      .eq('token', token)
      .eq('is_active', true)
      .single();

    if (!link || (link.expires_at && new Date(link.expires_at) < new Date())) {
      return fallbackMetadata(token);
    }

    const { data: property } = await supabase
      .from('properties')
      .select('title, city, address, current_price, description')
      .eq('id', link.property_id)
      .single();

    if (!property) {
      return fallbackMetadata(token);
    }

    const price = '₪' + property.current_price.toLocaleString('he-IL');
    const title = `${property.title} — ${property.city} | T ESTATE`;
    const description = property.description
      ? `${property.description.slice(0, 120)}…`
      : `${property.title} · ${property.city}, ${property.address} · ${price}`;
    const pageUrl = `${siteUrl}/client/${token}`;

    return {
      title,
      description,
      openGraph: {
        type: 'website',
        url: pageUrl,
        title,
        description,
        siteName: 'T ESTATE',
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [ogImageUrl],
      },
    };
  } catch {
    return fallbackMetadata(token);
  }
}

function fallbackMetadata(token: string): Metadata {
  const pageUrl = `${siteUrl}/client/${token}`;
  const title = 'נכס למכירה | T ESTATE';
  const description = 'מערכת פרימיום למשרדי נדל"ן — ניהול נכסים, לידים וחוויית לקוח ברמה הגבוהה ביותר';

  return {
    title,
    description,
    openGraph: {
      type: 'website',
      url: pageUrl,
      title,
      description,
      siteName: 'T ESTATE',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default function ClientPropertyPage({ params }: Props) {
  return <ClientPropertyView params={params} />;
}
