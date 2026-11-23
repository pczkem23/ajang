import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { brand } from '@/constants/Colors';
import { createOwnedItem } from '@/src/api/ownedItems';
import { Chip } from '@/src/components/Chip';
import { PhotoPicker } from '@/src/components/PhotoPicker';
import { Button, Field, Input } from '@/src/components/ui';
import { CATEGORIES } from '@/src/data/catalog';
import { useAuth } from '@/src/lib/auth';
import type { CategoryId } from '@/src/types';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const today = () => new Date().toISOString().slice(0, 10);

export default function NewOwnedItemScreen() {
  const { session } = useAuth();
  const router = useRouter();
  const [receiptUri, setReceiptUri] = useState<string>();
  const [photoUri, setPhotoUri] = useState<string>();
  const [title, setTitle] = useState('');
  const [brandName, setBrandName] = useState('');
  const [category, setCategory] = useState<CategoryId | null>(null);
  const [store, setStore] = useState('');
  const [purchasedOn, setPurchasedOn] = useState(today());
  const [price, setPrice] = useState('');
  const [memo, setMemo] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const valid = !!(title.trim() && category && (!purchasedOn || DATE_RE.test(purchasedOn)));

  const save = async () => {
    if (!session || !valid) return;
    setBusy(true);
    setError(null);
    try {
      await createOwnedItem(session.user.id, {
        title: title.trim(),
        brand: brandName.trim() || undefined,
        categoryId: category!,
        store: store.trim() || undefined,
        purchasedOn: purchasedOn || undefined,
        purchasePrice: price ? Number(price) : undefined,
        memo: memo.trim() || undefined,
        receiptUri,
        photoUri,
      });
      router.back();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView style={{ backgroundColor: brand.white }} contentContainerStyle={{ padding: 16, gap: 14 }}>
      <Stack.Screen options={{ title: '구매 기록하기' }} />
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <PhotoPicker label="🧾 영수증" hint="나만 볼 수 있어요" uri={receiptUri} onChange={setReceiptUri} />
        <PhotoPicker label="🧸 제품 사진" hint="판매할 때 같이 써요" uri={photoUri} onChange={setPhotoUri} />
      </View>

      <Field label="제품명">
        <Input value={title} onChangeText={setTitle} placeholder="예: 스토케 트립트랩" />
      </Field>
      <Field label="브랜드 (선택)">
        <Input value={brandName} onChangeText={setBrandName} placeholder="예: 스토케" />
      </Field>
      <Field label="카테고리">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {CATEGORIES.map((c) => (
            <Chip key={c.id} label={c.label} selected={category === c.id} onPress={() => setCategory(c.id)} />
          ))}
        </View>
      </Field>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Field label="구매처" flex>
          <Input value={store} onChangeText={setStore} placeholder="쿠팡, 이마트…" />
        </Field>
        <Field label="구매일" flex>
          <Input value={purchasedOn} onChangeText={setPurchasedOn} placeholder="YYYY-MM-DD" maxLength={10} />
        </Field>
      </View>
      <Field label="구매 금액(원)">
        <Input value={price} onChangeText={setPrice} keyboardType="number-pad" placeholder="459000" />
      </Field>
      <Field label="메모 (선택)">
        <Input value={memo} onChangeText={setMemo} placeholder="구성품, 보증기간 등" />
      </Field>

      {error && <Text style={{ color: brand.primaryDark }}>{error}</Text>}
      <Button title="저장하기" onPress={save} disabled={!valid} loading={busy} />
    </ScrollView>
  );
}
