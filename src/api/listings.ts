import { photoUrl, PHOTO_BUCKET, supabase } from '../lib/supabase';
import type { AgeBandId, CategoryId, ConditionGrade, Listing } from '../types';

const SELECT = `id, title, brand, category_id, age_bands, condition, used_months, price, new_price, description,
  seller_id, region, status, safety_sensitive, created_at,
  listing_photos(storage_path, sort_order), likes(count)`;

type Row = {
  id: string; title: string; brand: string | null; category_id: string; age_bands: string[];
  condition: ConditionGrade; used_months: number | null; price: number; new_price: number | null;
  description: string; seller_id: string; region: string | null; status: Listing['status'];
  safety_sensitive: boolean; created_at: string;
  listing_photos: { storage_path: string; sort_order: number }[];
  likes: { count: number }[];
};

const toListing = (r: Row): Listing => ({
  id: r.id,
  title: r.title,
  brand: r.brand ?? undefined,
  categoryId: r.category_id as CategoryId,
  ageBands: r.age_bands as AgeBandId[],
  condition: r.condition,
  usedMonths: r.used_months ?? 0,
  price: r.price,
  newPrice: r.new_price ?? undefined,
  description: r.description,
  photos: [...r.listing_photos].sort((a, b) => a.sort_order - b.sort_order).map((p) => photoUrl(p.storage_path)),
  sellerId: r.seller_id,
  region: r.region ?? '',
  status: r.status,
  likes: r.likes?.[0]?.count ?? 0,
  createdAt: r.created_at,
  safetySensitive: r.safety_sensitive,
});

export interface ListingFilter {
  query?: string;
  categoryId?: CategoryId | null;
  ageBand?: AgeBandId | null;
  condition?: ConditionGrade | null;
}

export async function fetchListings(f: ListingFilter = {}): Promise<Listing[]> {
  let q = supabase.from('listings').select(SELECT).neq('status', 'hidden').order('created_at', { ascending: false }).limit(50);
  if (f.categoryId) q = q.eq('category_id', f.categoryId);
  if (f.ageBand) q = q.contains('age_bands', [f.ageBand]);
  if (f.condition) q = q.eq('condition', f.condition);
  if (f.query?.trim()) {
    const s = f.query.trim().replace(/[%,()]/g, ' ');
    q = q.or(`title.ilike.%${s}%,brand.ilike.%${s}%`);
  }
  const { data, error } = await q;
  if (error) throw error;
  return (data as unknown as Row[]).map(toListing);
}

export async function fetchListing(id: string): Promise<Listing | null> {
  const { data, error } = await supabase.from('listings').select(SELECT).eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? toListing(data as unknown as Row) : null;
}

export interface NewListing {
  title: string;
  categoryId: CategoryId;
  ageBands: AgeBandId[];
  condition: ConditionGrade;
  usedMonths: number;
  price: number;
  newPrice?: number;
  description: string;
  region: string;
  safetySensitive: boolean;
  photoUris: string[];
}

export async function createListing(sellerId: string, input: NewListing): Promise<string> {
  const { data, error } = await supabase
    .from('listings')
    .insert({
      seller_id: sellerId,
      title: input.title,
      category_id: input.categoryId,
      age_bands: input.ageBands,
      condition: input.condition,
      used_months: input.usedMonths,
      price: input.price,
      new_price: input.newPrice ?? null,
      description: input.description,
      region: input.region,
      safety_sensitive: input.safetySensitive,
    })
    .select('id')
    .single();
  if (error) throw error;
  const listingId = data.id as string;

  const photos = await Promise.all(
    input.photoUris.map(async (uri, i) => {
      const res = await fetch(uri);
      const buf = await res.arrayBuffer();
      const type = res.headers.get('content-type') ?? 'image/jpeg';
      const ext = type.split('/')[1]?.split(';')[0] ?? 'jpg';
      const path = `${sellerId}/${listingId}/${i}.${ext}`;
      const up = await supabase.storage.from(PHOTO_BUCKET).upload(path, buf, { contentType: type, upsert: true });
      if (up.error) throw up.error;
      return { listing_id: listingId, storage_path: path, sort_order: i };
    }),
  );
  if (photos.length) {
    const { error: pe } = await supabase.from('listing_photos').insert(photos);
    if (pe) throw pe;
  }
  return listingId;
}
