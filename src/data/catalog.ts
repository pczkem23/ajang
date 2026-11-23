import type { AgeBandId, CategoryId, ConditionGrade } from '../types';

export const CATEGORIES: { id: CategoryId; label: string; emoji: string; examples: string }[] = [
  { id: 'newborn', label: '출산·신생아', emoji: '👶', examples: '아기침대, 역류방지쿠션, 속싸개' },
  { id: 'feeding', label: '수유·이유식', emoji: '🍼', examples: '젖병, 젖병소독기, 이유식 의자' },
  { id: 'outing', label: '외출용품', emoji: '🚼', examples: '유모차, 카시트, 아기띠' },
  { id: 'toys', label: '장난감', emoji: '🧸', examples: '모빌, 바운서, 점퍼루, 교구' },
  { id: 'clothing', label: '의류·잡화', emoji: '👕', examples: '신생아복, 우주복, 신발' },
  { id: 'furniture', label: '가구·생활', emoji: '🪑', examples: '범퍼침대, 하이체어, 안전문' },
  { id: 'books', label: '도서·교육', emoji: '📚', examples: '그림책, 전집, 학습교구' },
  { id: 'maternity', label: '임신·출산', emoji: '🤰', examples: '임산부용품, 출산준비물' },
];

// minMonth/maxMonth: 출생 기준 개월. 임신 중은 -10 ~ -1 로 표현.
export const AGE_BANDS: { id: AgeBandId; label: string; minMonth: number; maxMonth: number }[] = [
  { id: 'prenatal', label: '임신·출산 준비', minMonth: -10, maxMonth: -1 },
  { id: 'm0_3', label: '0~3개월', minMonth: 0, maxMonth: 3 },
  { id: 'm4_6', label: '4~6개월', minMonth: 4, maxMonth: 6 },
  { id: 'm7_12', label: '7~12개월', minMonth: 7, maxMonth: 12 },
  { id: 'm13_24', label: '13~24개월', minMonth: 13, maxMonth: 24 },
  { id: 'm25_36', label: '25~36개월', minMonth: 25, maxMonth: 36 },
  { id: 'm37_48', label: '37~48개월', minMonth: 37, maxMonth: 48 },
  { id: 'm49_72', label: '49~72개월', minMonth: 49, maxMonth: 72 },
];

export const CONDITIONS: { grade: ConditionGrade; label: string; color: string }[] = [
  { grade: 'S', label: '거의 새 상품', color: '#2E9E6B' },
  { grade: 'A', label: '사용감 적음', color: '#3B82F6' },
  { grade: 'B', label: '생활 흠집 있음', color: '#F59E0B' },
  { grade: 'C', label: '사용감 많음', color: '#9CA3AF' },
];

export const categoryLabel = (id: CategoryId) => CATEGORIES.find((c) => c.id === id)?.label ?? id;
export const ageBandLabel = (id: AgeBandId) => AGE_BANDS.find((a) => a.id === id)?.label ?? id;
export const conditionOf = (g: ConditionGrade) => CONDITIONS.find((c) => c.grade === g)!;
