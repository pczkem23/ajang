import { supabase } from '../lib/supabase';
import type { Child, UserProfile } from '../types';

export async function fetchMyProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, nickname, region, phone_verified, trust_score, children(id, nickname, birth_date, due_date)')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const { count } = await supabase.from('reviews').select('id', { count: 'exact', head: true }).eq('reviewee_id', userId);
  return {
    id: data.id,
    nickname: data.nickname,
    region: data.region ?? '',
    phoneVerified: data.phone_verified,
    trustScore: data.trust_score,
    reviewCount: count ?? 0,
    children: (data.children ?? []).map(
      (c: { id: string; nickname: string; birth_date: string | null; due_date: string | null }): Child => ({
        id: c.id,
        nickname: c.nickname,
        birthDate: c.birth_date ?? undefined,
        dueDate: c.due_date ?? undefined,
      }),
    ),
  };
}

export async function updateProfile(userId: string, patch: { nickname?: string; region?: string }) {
  const { error } = await supabase.from('profiles').update(patch).eq('id', userId);
  if (error) {
    if (error.code === '23505') throw new Error('이미 쓰고 있는 닉네임이에요.');
    throw error;
  }
}

export async function addChild(userId: string, child: { nickname: string; birthDate?: string; dueDate?: string }) {
  const { error } = await supabase.from('children').insert({
    parent_id: userId,
    nickname: child.nickname,
    birth_date: child.birthDate ?? null,
    due_date: child.dueDate ?? null,
  });
  if (error) throw error;
}
