import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { brand } from '@/constants/Colors';
import { createListing } from '@/src/api/listings';
import { fetchOwnedItem } from '@/src/api/ownedItems';
import { monthsBetween } from '@/src/lib/upload';
import type { OwnedItem } from '@/src/types';
import { Chip } from '@/src/components/Chip';
import { useAuth } from '@/src/lib/auth';
import { AGE_BANDS, CATEGORIES, CONDITIONS } from '@/src/data/catalog';
import type { AgeBandId, CategoryId, ConditionGrade } from '@/src/types';

const SAFETY_CATEGORIES: CategoryId[] = ['outing', 'newborn', 'furniture'];

const MAX_PHOTOS = 10;

export default function SellScreen() {
  const { session, profile } = useAuth();
  const router = useRouter();
  const [photos, setPhotos] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { itemId } = useLocalSearchParams<{ itemId?: string }>();
  const [fromItem, setFromItem] = useState<OwnedItem | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CategoryId | null>(null);
  const [ages, setAges] = useState<AgeBandId[]>([]);
  const [condition, setCondition] = useState<ConditionGrade | null>(null);
  const [usedMonths, setUsedMonths] = useState('');
  const [price, setPrice] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [description, setDescription] = useState('');

  // 우리 집 육아용품에서 넘어오면 구매 기록으로 판매글 자동 채우기
  useEffect(() => {
    if (!itemId) return;
    fetchOwnedItem(itemId).then((it) => {
      if (!it) return;
      setFromItem(it);
      setTitle(it.title);
      setCategory(it.categoryId);
      if (it.purchasePrice != null) setNewPrice(String(it.purchasePrice));
      if (it.purchasedOn) setUsedMonths(String(monthsBetween(it.purchasedOn)));
      if (it.photoUrl) setPhotos([it.photoUrl]);
      const lines = [
        it.store && `· 구매처: ${it.store}`,
        it.purchasedOn && `· 구매일: ${it.purchasedOn}`,
        it.receiptPath && '· 구매 영수증 보관 중',
        it.memo && `· ${it.memo}`,
      ].filter(Boolean);
      setDescription(lines.join('\n'));
    });
  }, [itemId]);

  const toggleAge = (id: AgeBandId) => setAges((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const canSubmit = !!(title && category && ages.length && condition && price && photos.length);

  const pickPhotos = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: MAX_PHOTOS - photos.length,
      quality: 0.7,
    });
    if (!res.canceled) setPhotos((p) => [...p, ...res.assets.map((a) => a.uri)].slice(0, MAX_PHOTOS));
  };

  const reset = () => {
    setPhotos([]); setTitle(''); setCategory(null); setAges([]); setCondition(null);
    setUsedMonths(''); setPrice(''); setNewPrice(''); setDescription(''); setFromItem(null);
    router.setParams({ itemId: undefined });
  };

  // AI 자동 작성 전 단계: 입력값 기반 설명 템플릿
  const fillTemplate = () => {
    const cond = CONDITIONS.find((c) => c.grade === condition);
    setDescription(
      `· 사용 기간: ${usedMonths || '?'}개월\n· 상태: ${condition ?? '?'}급 (${cond?.label ?? ''})\n· 구성품: \n· 하자/흠집: \n· 거래 방법: 직거래 / 택배`,
    );
  };

  const submit = async () => {
    if (!session || !canSubmit) return;
    setBusy(true);
    setError(null);
    try {
      const id = await createListing(session.user.id, {
        title: title.trim(),
        brand: fromItem?.brand,
        ownedItemId: fromItem?.id,
        hasReceipt: !!fromItem?.receiptPath,
        categoryId: category!,
        ageBands: ages,
        condition: condition!,
        usedMonths: Number(usedMonths) || 0,
        price: Number(price),
        newPrice: newPrice ? Number(newPrice) : undefined,
        description: description.trim(),
        region: profile?.region ?? '',
        safetySensitive: SAFETY_CATEGORIES.includes(category!),
        photoUris: photos,
      });
      reset();
      router.push({ pathname: '/listing/[id]', params: { id } });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, gap: 14 }}>
      {fromItem && (
        <View style={styles.fromItem}>
          <Text style={styles.fromItemText}>
            🧾 "{fromItem.title}" 구매 기록으로 채웠어요.{fromItem.receiptPath ? ' 영수증이 있어 "구매 영수증 확인" 배지가 붙어요.' : ''} 상태와 판매가만 정해 주세요.
          </Text>
        </View>
      )}
      <Pressable style={styles.photoBox} onPress={pickPhotos} disabled={photos.length >= MAX_PHOTOS}>
        <Text style={styles.photoText}>📷 사진 추가 ({photos.length}/{MAX_PHOTOS})</Text>
        <Text style={styles.hint}>제품 라벨·사용감이 보이는 사진을 꼭 넣어주세요</Text>
      </Pressable>
      {photos.length > 0 && (
        <ScrollView horizontal contentContainerStyle={{ gap: 8 }}>
          {photos.map((uri, i) => (
            <Pressable key={uri + i} onPress={() => setPhotos((p) => p.filter((_, j) => j !== i))}>
              <Image source={{ uri }} style={styles.thumb} />
              <Text style={styles.remove}>✕</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

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

      {error && <Text style={{ color: brand.primaryDark }}>{error}</Text>}
      <Pressable disabled={!canSubmit || busy} onPress={submit} style={[styles.button, (!canSubmit || busy) && { opacity: 0.4 }]}>
        <Text style={styles.buttonText}>{busy ? '등록 중…' : '등록하기'}</Text>
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
  thumb: { width: 72, height: 72, borderRadius: 8, backgroundColor: brand.line },
  remove: { position: 'absolute', top: 2, right: 6, color: brand.white, fontWeight: '700', textShadowColor: '#0008', textShadowRadius: 3 },
  label: { fontSize: 13, fontWeight: '600', color: brand.ink },
  input: { borderWidth: 1, borderColor: brand.line, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: brand.ink },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  fromItem: { backgroundColor: '#E8F6EF', borderRadius: 10, padding: 12 },
  fromItemText: { fontSize: 13, color: '#1F6E4A', lineHeight: 19 },
  safety: { backgroundColor: '#FFF4E5', borderRadius: 10, padding: 12 },
  safetyText: { fontSize: 13, color: '#8A5300' },
  link: { color: brand.primaryDark, fontSize: 13, fontWeight: '600' },
  button: { backgroundColor: brand.primary, borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginTop: 6 },
  buttonText: { color: brand.white, fontSize: 16, fontWeight: '700' },
});
