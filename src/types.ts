export type ConditionGrade = 'S' | 'A' | 'B' | 'C';

export type AgeBandId =
  | 'prenatal'
  | 'm0_3'
  | 'm4_6'
  | 'm7_12'
  | 'm13_24'
  | 'm25_36'
  | 'm37_48'
  | 'm49_72';

export type CategoryId =
  | 'newborn'
  | 'feeding'
  | 'outing'
  | 'toys'
  | 'clothing'
  | 'furniture'
  | 'books'
  | 'maternity';

export type ListingStatus = 'selling' | 'reserved' | 'sold';

export interface Listing {
  id: string;
  title: string;
  brand?: string;
  categoryId: CategoryId;
  ageBands: AgeBandId[]; // 한 상품이 여러 월령에 해당 가능
  condition: ConditionGrade;
  usedMonths: number; // 사용 기간(개월)
  price: number; // 판매가(원)
  newPrice?: number; // 신품가(원) - 절약률 표시용
  description: string;
  photos: string[];
  sellerId: string;
  region: string; // 거래 희망 지역(동 단위)
  status: ListingStatus;
  likes: number;
  createdAt: string; // ISO
  safetySensitive?: boolean; // 카시트·유아침대·유모차 등
  hasReceipt?: boolean; // 구매 영수증 확인
}

export interface Child {
  id: string;
  nickname: string;
  birthDate?: string; // 출산 전이면 undefined
  dueDate?: string; // 출산 예정일
}

export interface UserProfile {
  id: string;
  nickname: string;
  region: string;
  phoneVerified: boolean;
  trustScore: number; // 0~100, 거래 후기 기반
  reviewCount: number;
  children: Child[];
}

export interface ChatRoom {
  id: string;
  listingId: string;
  partnerNickname: string;
  lastMessage: string;
  updatedAt: string;
  unread: number;
}

/** 우리 집 육아용품: 구매 기록 → 나중에 판매글로 전환 */
export interface OwnedItem {
  id: string;
  title: string;
  brand?: string;
  categoryId: CategoryId;
  store?: string; // 구매처
  purchasedOn?: string; // YYYY-MM-DD
  purchasePrice?: number;
  receiptPath?: string; // 비공개 버킷 경로
  photoUrl?: string; // 제품 사진 공개 URL
  memo?: string;
  listingId?: string; // 판매글로 전환됐으면 연결
  createdAt: string;
}
