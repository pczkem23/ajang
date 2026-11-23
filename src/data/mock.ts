import type { ChatRoom, Listing, UserProfile } from '../types';

// 백엔드(Supabase) 연동 전까지 쓰는 샘플 데이터
const img = (seed: string) => `https://picsum.photos/seed/${seed}/600/600`;
const daysAgo = (d: number) => new Date(Date.now() - d * 86400000).toISOString();

export const ME: UserProfile = {
  id: 'u_me',
  nickname: '초보맘민트',
  region: '성남시 분당구 정자동',
  phoneVerified: true,
  trustScore: 82,
  reviewCount: 12,
  children: [{ id: 'c1', nickname: '콩이', birthDate: new Date(Date.now() - 200 * 86400000).toISOString().slice(0, 10) }],
};

export const LISTINGS: Listing[] = [
  {
    id: 'l1', title: '스토케 트립트랩 하이체어 (화이트)', brand: '스토케', categoryId: 'furniture',
    ageBands: ['m4_6', 'm7_12', 'm13_24', 'm25_36'], condition: 'A', usedMonths: 8,
    price: 150000, newPrice: 459000, description: '이유식 시작하면서 8개월 사용했어요. 베이비세트 포함, 생활 스크래치 조금 있습니다.',
    photos: [img('tripptrapp')], sellerId: 'u2', region: '분당구 수내동', status: 'selling', likes: 23, createdAt: daysAgo(0.1),
  },
  {
    id: 'l2', title: '점퍼루 점프앤런 (거의 새것)', brand: '피셔프라이스', categoryId: 'toys',
    ageBands: ['m4_6', 'm7_12'], condition: 'S', usedMonths: 2,
    price: 45000, newPrice: 139000, description: '아이가 싫어해서 2개월만 썼어요. 소독 완료, 박스 있어요.',
    photos: [img('jumper')], sellerId: 'u3', region: '분당구 정자동', status: 'selling', likes: 11, createdAt: daysAgo(0.5),
  },
  {
    id: 'l3', title: '6~9개월 남아 내의 10벌 묶음', categoryId: 'clothing',
    ageBands: ['m4_6', 'm7_12'], condition: 'B', usedMonths: 3,
    price: 20000, description: '사이즈 70~80. 세탁 후 보관했습니다. 묶음으로만 판매해요.',
    photos: [img('babyclothes')], sellerId: 'u4', region: '분당구 서현동', status: 'selling', likes: 6, createdAt: daysAgo(1),
  },
  {
    id: 'l4', title: '부가부 폭스5 디럭스 유모차', brand: '부가부', categoryId: 'outing',
    ageBands: ['m0_3', 'm4_6', 'm7_12', 'm13_24'], condition: 'A', usedMonths: 14,
    price: 650000, newPrice: 1690000, description: '2025년 3월 제조. 리콜 대상 아님 확인했어요. 레인커버 포함.',
    photos: [img('stroller')], sellerId: 'u2', region: '분당구 수내동', status: 'reserved', likes: 41, createdAt: daysAgo(2), safetySensitive: true,
  },
  {
    id: 'l5', title: '신생아 속싸개·스와들업 세트', categoryId: 'newborn',
    ageBands: ['prenatal', 'm0_3'], condition: 'A', usedMonths: 2,
    price: 25000, newPrice: 68000, description: '출산 준비하시는 분께 추천해요. 스와들업 S 사이즈 2개 + 속싸개 3장.',
    photos: [img('swaddle')], sellerId: 'u5', region: '분당구 금곡동', status: 'selling', likes: 9, createdAt: daysAgo(3),
  },
  {
    id: 'l6', title: '헤이그 실리콘 빨대컵 + 이유식 용기 세트', categoryId: 'feeding',
    ageBands: ['m4_6', 'm7_12'], condition: 'S', usedMonths: 1,
    price: 15000, newPrice: 42000, description: '선물 받았는데 중복이라 판매해요. 1회 열탕 소독만 했어요.',
    photos: [img('sippycup')], sellerId: 'u3', region: '분당구 정자동', status: 'selling', likes: 4, createdAt: daysAgo(4),
  },
  {
    id: 'l7', title: '프뢰벨 영아 전집 (0~3세)', categoryId: 'books',
    ageBands: ['m7_12', 'm13_24', 'm25_36'], condition: 'B', usedMonths: 18,
    price: 80000, newPrice: 320000, description: '구성 전부 있어요. 몇 권 모서리 닳음 있습니다.',
    photos: [img('kidsbooks')], sellerId: 'u6', region: '분당구 이매동', status: 'selling', likes: 15, createdAt: daysAgo(6),
  },
  {
    id: 'l8', title: '조이 아이스핀 360 회전형 카시트', brand: '조이', categoryId: 'outing',
    ageBands: ['m0_3', 'm4_6', 'm7_12', 'm13_24', 'm25_36'], condition: 'A', usedMonths: 20,
    price: 180000, newPrice: 549000, description: '무사고 차량에서만 사용. 제조일 2024년 11월, 모델명 라벨 사진 있어요.',
    photos: [img('carseat')], sellerId: 'u5', region: '분당구 금곡동', status: 'selling', likes: 28, createdAt: daysAgo(7), safetySensitive: true,
  },
];

export const CHAT_ROOMS: ChatRoom[] = [
  { id: 'r1', listingId: 'l1', partnerNickname: '수내동쌍둥이아빠', lastMessage: '내일 저녁 7시 수내역 괜찮으세요?', updatedAt: daysAgo(0.05), unread: 2 },
  { id: 'r2', listingId: 'l5', partnerNickname: '금곡동라떼', lastMessage: '감사합니다! 잘 쓸게요 :)', updatedAt: daysAgo(1.2), unread: 0 },
];
