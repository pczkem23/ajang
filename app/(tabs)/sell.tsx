import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { brand } from '@/constants/Colors';
import { Chip } from '@/src/components/Chip';
import { AGE_BANDS, CATEGORIES, CONDITIONS } from '@/src/data/catalog';
import type { AgeBandId, CategoryId, ConditionGrade } from '@/src/types';

const SAFETY_CATEGORIES: CategoryId[] = ['outing', 'newborn', 'furniture'];

export default function SellScreen() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CategoryId | null>(null);
  const [ages, setAges] = useState<AgeBandId[]>([]);
  const [condition, setCondition] = useState<ConditionGrade | null>(null);
  const [usedMonths, setUsedMonths] = useState('');
  const [price, setPrice] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [description, setDescription] = useState('');

  const toggleAge = (id: AgeBandId) => setAges((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const canSubmit = title && category && ages.length && condition && price;

  // AI 자동 작성 전 단계: 입력값 기반 설명 템플릿
  const fillTemplate = () => {
    const cond = CONDITIONS.find((c) => c.grade === condition);
    setDescription(
      `· 사용 기간: ${usedMonths || '?'}개월\n· 상태: ${condition ?? '?'}급 (${cond?.label ?? ''})\n· 구성품: \n· 하자/흠집: \n· 거래 방법: 직거래 / 택배`,
    );
  };

  const submit = () => {
    // TODO: Supabase listings 테이블 insert + 사진 업로드
    Alert.alert('등록 준비 완료', '백엔드 연동 후 실제로 등록돼요.');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, gap: 14 }}>
      <Pressable style={styles.photoBox}>
        <Text style={styles.photoText}>📷 사진 추가 (최대 10장)</Text>
        <Text style={styles.hint}>제품 라벨·사용감이 보이는 사진을 꼭 넣어주세요</Text>
      </Pressable>

      <Field label="상품명">
        <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="예: 스토케 트립트랩" />
      </Field>

      <Field label="카테고리">
        <View style={styles.wrap}>
          {CATEGORIES.map((c) => (
            <Chip key={c.id} label={c.label} selected={category === c.id} onPress={() => setCategory(c.id)} />
          ))}
        </View>
      </Field>

      {category && SAFETY_CATEGORIES.includes(category) && (
        <View style={styles.safety}>
          <Text style={styles.safetyText}>
            ⚠️ 카시트·유모차·유아침대 등 안전 관련 제품은 제조일, 모델명, 리콜 여부를 설명에 꼭 적어주세요.
          </Text>
        </View>
      )}

      <Field label="사용 월령 (복수 선택)">
        <View style={styles.wrap}>
          {AGE_BANDS.map((a) => (
            <Chip key={a.id} label={a.label} selected={ages.includes(a.id)} onPress={() => toggleAge(a.id)} />
          ))}
        </View>
      </Field>

      <Field label="상품 상태">
        <View style={styles.wrap}>
          {CONDITIONS.map((c) => (
            <Chip key={c.grade} label={`${c.grade}급 · ${c.label}`} selected={condition === c.grade} onPress={() => setCondition(c.grade)} />
          ))}
        </View>
      </Field>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Field label="사용 기간(개월)" flex>
          <TextInput style={styles.input} value={usedMonths} onChangeText={setUsedMonths} keyboardType="number-pad" placeholder="8" />
        </Field>
        <Field label="판매가(원)" flex>
          <TextInput style={styles.input} value={price} onChangeText={setPrice} keyboardType="number-pad" placeholder="150000" />
        </Field>
      </View>
      <Field label="신품가(원, 선택) — 절약률로 보여드려요">
        <TextInput style={styles.input} value={newPrice} onChangeText={setNewPrice} keyboardType="number-pad" placeholder="459000" />
      </Field>

      <Field label="설명">
        <Pressable onPress={fillTemplate}>
          <Text style={styles.link}>✨ 설명 템플릿 채우기</Text>
        </Pressable>
        <TextInput
          style={[styles.input, { minHeight: 120, textAlignVertical: 'top' }]}
          value={description}
          onChangeText={setDescription}
          multiline
          placeholder="구성품, 하자, 거래 방법을 적어주세요"
        />
      </Field>

      <Pressable disabled={!canSubmit} onPress={submit} style={[styles.button, !canSubmit && { opacity: 0.4 }]}>
        <Text style={styles.buttonText}>등록하기</Text>
      </Pressable>
    </ScrollView>
  );
}

function Field({ label, children, flex }: { label: string; children: React.ReactNode; flex?: boolean }) {
  return (
    <View style={[{ gap: 6 }, flex && { flex: 1 }]}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: brand.white },
  photoBox: { borderWidth: 1, borderStyle: 'dashed', borderColor: brand.primary, borderRadius: 12, padding: 20, alignItems: 'center', gap: 4, backgroundColor: brand.cream },
  photoText: { fontSize: 15, fontWeight: '600', color: brand.primaryDark },
  hint: { fontSize: 12, color: brand.sub },
  label: { fontSize: 13, fontWeight: '600', color: brand.ink },
  input: { borderWidth: 1, borderColor: brand.line, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: brand.ink },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  safety: { backgroundColor: '#FFF4E5', borderRadius: 10, padding: 12 },
  safetyText: { fontSize: 13, color: '#8A5300' },
  link: { color: brand.primaryDark, fontSize: 13, fontWeight: '600' },
  button: { backgroundColor: brand.primary, borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginTop: 6 },
  buttonText: { color: brand.white, fontSize: 16, fontWeight: '700' },
});
