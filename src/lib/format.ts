export const won = (n: number) => `${n.toLocaleString('ko-KR')}원`;

export function savingRate(price: number, newPrice?: number): number | null {
  if (!newPrice || newPrice <= price) return null;
  return Math.round(((newPrice - price) / newPrice) * 100);
}

export function timeAgo(iso: string, now: Date = new Date()): string {
  const diff = (now.getTime() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return '방금 전';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
}
