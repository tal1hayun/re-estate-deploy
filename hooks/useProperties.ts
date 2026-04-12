'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Property, PropertyDetails, PropertyImage, Agent } from '@/types';

export type PropertyFull = Property & {
  agents: Agent;
  property_details: PropertyDetails | null;
  property_images: PropertyImage[];
};

export function useProperties() {
  const [properties, setProperties] = useState<PropertyFull[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProperties = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('properties')
        .select(`
          *,
          agents(id, full_name, email, avatar_url),
          property_details(*),
          property_images(id, storage_path, is_cover, display_order)
        `)
        .order('created_at', { ascending: false });

      setProperties(data || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProperties(); }, [fetchProperties]); // eslint-disable-line react-hooks/set-state-in-effect

  async function createProperty(body: {
    title: string; address: string; city: string;
    current_price: number; description?: string;
    details?: Partial<PropertyDetails>;
  }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: agent } = await supabase
      .from('agents')
      .select('id, organization_id')
      .eq('user_id', user.id)
      .single();

    if (!agent) throw new Error('Agent not found');

    const { data: property, error } = await supabase
      .from('properties')
      .insert({
        title: body.title,
        address: body.address,
        city: body.city,
        current_price: body.current_price,
        description: body.description,
        agent_id: agent.id,
        organization_id: agent.organization_id,
      })
      .select()
      .single();

    if (error) throw error;

    if (body.details && property) {
      await supabase.from('property_details').insert({
        property_id: property.id,
        ...body.details,
      });
    }

    return property;
  }

  async function updatePrice(propertyId: string, newPrice: number, reason?: string) {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: agent } = await supabase
      .from('agents').select('id').eq('user_id', user!.id).single();

    const { data: prop } = await supabase
      .from('properties').select('current_price').eq('id', propertyId).single();

    if (!prop) throw new Error('Property not found');

    await supabase.from('price_history').insert({
      property_id: propertyId,
      old_price: prop.current_price,
      new_price: newPrice,
      changed_by: agent?.id,
      reason: reason || null,
    });

    const { data, error } = await supabase
      .from('properties')
      .update({ current_price: newPrice })
      .eq('id', propertyId)
      .select().single();

    if (error) throw error;
    await fetchProperties();
    return data;
  }

  async function uploadImage(propertyId: string, file: File, isCover: boolean) {
    const ext = file.name.split('.').pop();
    const path = `${propertyId}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('property-images')
      .upload(path, file, { contentType: file.type });

    if (uploadError) throw uploadError;

    const { data: { user } } = await supabase.auth.getUser();
    const { data: agent } = await supabase
      .from('agents').select('id').eq('user_id', user!.id).single();

    if (isCover) {
      await supabase.from('property_images')
        .update({ is_cover: false })
        .eq('property_id', propertyId);
    }

    await supabase.from('property_images').insert({
      property_id: propertyId,
      storage_path: path,
      is_cover: isCover,
      uploaded_by: agent?.id,
    });

    await fetchProperties();
    return path;
  }

  async function deleteImage(propertyId: string, imageId: string, storagePath: string) {
    await supabase.storage.from('property-images').remove([storagePath]);
    await supabase.from('property_images').delete().eq('id', imageId);
    await fetchProperties();
  }

  return { properties, loading, fetchProperties, createProperty, updatePrice, uploadImage, deleteImage };
}
