import { photoUrl, PHOTO_BUCKET, supabase } from '../lib/supabase';
import { uploadImage } from '../lib/upload';
import type { CategoryId, OwnedItem } from '../types';

export const RECEIPT_BUCKET = 'receipts';

type Row = {
  id: string; title: string; brand: string | null; category_id: string; store: string | null;
  purchased_on: string | null; purchase_price: number | null; receipt_path: string | null;
  photo_path: string | null; memo: string | null; listing_id: string | null; created_at: string;
};

const toItem = (r: Row): OwnedItem => ({
  id: r.id,
  title: r.title,
  brand: r.brand ?? undefined,
  categoryId: r.category_id as CategoryId,
  store: r.store ?? undefined,
  purchasedOn: r.purchased_on ?? undefined,
  purchasePrice: r.purchase_price ?? undefined,
  receiptPath: r.receipt_path ?? undefined,
  photoUrl: r.photo_path ? photoUrl(r.photo_path) : undefined,
  memo: r.memo ?? undefined,
  listingId: r.listing_id ?? undefined,
  createdAt: r.created_at,
});

export async function fetchOwnedItems(): Promise<OwnedItem[]> {
  const { data, error } = await supabase.from('owned_items').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data as Row[]).map(toItem);
}

export async function fetchOwnedItem(id: string): Promise<OwnedItem | null> {
  const { data, error } = await supabase.from('owned_items').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? toItem(data as Row) : null;
}

/** 비공개 영수증을 잠깐(10분) 볼 수 있는 주소 */
export async function receiptUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage.from(RECEIPT_BUCKET).createSignedUrl(path, 600);
  if (error) throw error;
  return data.signedUrl;
}

export interface NewOwnedItem {
  title: string;
  brand?: string;
  categoryId: CategoryId;
  store?: string;
  purchasedOn?: string;
  purchasePrice?: number;
  memo?: string;
  receiptUri?: string;
  photoUri?: string;
}

export async function createOwnedItem(ownerId: string, input: NewOwnedItem): Promise<string> {
  const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const [receiptPath, photoPath] = await Promise.all([
    input.receiptUri ? uploadImage(RECEIPT_BUCKET, `${ownerId}/${id}/receipt`, input.receiptUri) : null,
    input.photoUri ? uploadImage(PHOTO_BUCKET, `${ownerId}/items/${id}`, input.photoUri) : null,
  ]);
  const { data, error } = await supabase
    .from('owned_items')
    .insert({
      owner_id: ownerId,
      title: input.title,
      brand: input.brand ?? null,
      category_id: input.categoryId,
      store: input.store ?? null,
      purchased_on: input.purchasedOn ?? null,
      purchase_price: input.purchasePrice ?? null,
      memo: input.memo ?? null,
      receipt_path: receiptPath,
      photo_path: photoPath,
    })
    .select('id')
    .single();
  if (error) throw error;
  return data.id as string;
}
