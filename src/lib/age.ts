import { AGE_BANDS } from '../data/catalog';
import type { AgeBandId, Child } from '../types';

/** 기준일(today) 대비 아이 월령. 출산 전이면 음수(예정일까지 남은 개월). */
export function monthsOld(child: Child, today: Date = new Date()): number {
  const base = child.birthDate ?? child.dueDate;
  if (!base) return 0;
  const d = new Date(base);
  let months = (today.getFullYear() - d.getFullYear()) * 12 + (today.getMonth() - d.getMonth());
  if (today.getDate() < d.getDate()) months -= 1;
  if (!child.birthDate) return Math.min(-1, months); // 출산 전
  return Math.max(0, months);
}

export function ageBandFor(months: number): AgeBandId {
  const band = AGE_BANDS.find((b) => months >= b.minMonth && months <= b.maxMonth);
  if (band) return band.id;
  return months < 0 ? 'prenatal' : 'm49_72';
}

/** 지금 월령 + 곧 다가올 다음 구간까지 추천 (미리 준비하는 부모를 위해) */
export function recommendedBands(months: number): AgeBandId[] {
  const current = ageBandFor(months);
  const idx = AGE_BANDS.findIndex((b) => b.id === current);
  const next = AGE_BANDS[idx + 1];
  return next ? [current, next.id] : [current];
}

export function monthsLabel(months: number): string {
  if (months < 0) return `출산 ${-months}개월 전`;
  return `생후 ${months}개월`;
}
