import { supabase } from './supabase';

/** 기기 사진(uri)을 Supabase Storage에 올리고 저장 경로를 돌려줌 */
export async function uploadImage(bucket: string, pathWithoutExt: string, uri: string): Promise<string> {
  const res = await fetch(uri);
  const buf = await res.arrayBuffer();
  const type = res.headers.get('content-type') ?? 'image/jpeg';
  const ext = type.split('/')[1]?.split(';')[0] ?? 'jpg';
  const path = `${pathWithoutExt}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, buf, { contentType: type, upsert: true });
  if (error) throw error;
  return path;
}

/** 두 날짜 사이 개월 수 (사용 기간 자동 계산용) */
export function monthsBetween(fromIso: string, to: Date = new Date()): number {
  const d = new Date(fromIso);
  let m = (to.getFullYear() - d.getFullYear()) * 12 + (to.getMonth() - d.getMonth());
  if (to.getDate() < d.getDate()) m -= 1;
  return Math.max(0, m);
}
