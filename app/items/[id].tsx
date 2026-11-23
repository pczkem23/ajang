import { Link, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { brand } from '@/constants/Colors';
import { fetchOwnedItem, receiptUrl } from '@/src/api/ownedItems';
import { ErrorView, Loading } from '@/src/components/ui';
import { categoryLabel } from '@/src/data/catalog';
import { won } from '@/src/lib/format';
import { monthsBetween } from '@/src/lib/upload';
import { useAsync } from '@/src/lib/useAsync';

export default function OwnedItemDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: item, error, loading, reload } = useAsync(() => fetchOwnedItem(id), [id]);
  const [receipt, setReceipt] = useState<string | null>(null);

  if (loading) return <Loading />;
  if (error) return <ErrorView error={error} onRetry={reload} />;
  if (!item) return <Text style={{ padding: 20 }}>기록을 찾을 수 없어요</Text>;

  const showReceipt = async () => {
    if (item.receiptPath) setReceipt(await receiptUrl(item.receiptPath));
  };

  return (
    <View style={{ flex: 1, backgroundColor: brand.white }}>
      <Stack.Screen options={{ title: item.title }} />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
        {item.photoUrl && <Image source={{ uri: item.photoUrl }} style={styles.photo} />}
        <View style={styles.card}>
          <Row k="카테고리" v={categoryLabel(item.categoryId)} />
          {item.brand && <Row k="브랜드" v={item.brand} />}
          {item.store && <Row k="구매처" v={item.store} />}
          {item.purchasedOn && <Row k="구매일" v={`${item.purchasedOn} (${monthsBetween(item.purchasedOn)}개월 전)`} />}
          {item.purchasePrice != null && <Row k="구매 금액" v={won(item.purchasePrice)} />}
          {item.memo && <Row k="메모" v={item.memo} />}
        </View>

        {item.receiptPath ? (
          receipt ? (
            <Image source={{ uri: receipt }} style={styles.receipt} resizeMode="contain" />
          ) : (
            <Pressable onPress={showReceipt}><Text style={styles.link}>🧾 영수증 보기 (나만 볼 수 있어요)</Text></Pressable>
          )
        ) : (
          <Text style={styles.meta}>영수증이 없어요. 영수증이 있으면 판매할 때 "구매 영수증 확인" 배지가 붙어요.</Text>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {item.listingId ? (
          <Link href={{ pathname: '/listing/[id]', params: { id: item.listingId } }} asChild>
            <Pressable style={[styles.button, { backgroundColor: brand.ink }]}><Text style={styles.buttonText}>판매글 보기</Text></Pressable>
          </Link>
        ) : (
          <Link href={{ pathname: '/sell', params: { itemId: item.id } }} asChild>
            <Pressable style={styles.button}><Text style={styles.buttonText}>이제 필요 없어요 · 바로 판매하기</Text></Pressable>
          </Link>
        )}
      </View>
    </View>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: 10 }}>
      <Text style={[styles.meta, { width: 64 }]}>{k}</Text>
      <Text style={{ flex: 1, fontSize: 14, color: brand.ink }}>{v}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  photo: { width: '100%', aspectRatio: 1, borderRadius: 12, backgroundColor: brand.line },
  card: { gap: 8, padding: 14, backgroundColor: brand.cream, borderRadius: 12 },
  receipt: { width: '100%', height: 420, backgroundColor: brand.line, borderRadius: 8 },
  meta: { fontSize: 13, color: brand.sub },
  link: { color: brand.primaryDark, fontWeight: '600', fontSize: 14 },
  footer: { padding: 14, borderTopWidth: 1, borderColor: brand.line },
  button: { backgroundColor: brand.primary, borderRadius: 12, paddingVertical: 15, alignItems: 'center' },
  buttonText: { color: brand.white, fontWeight: '700', fontSize: 16 },
});
