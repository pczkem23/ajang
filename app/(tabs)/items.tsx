import { Link, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { brand } from '@/constants/Colors';
import { fetchOwnedItems } from '@/src/api/ownedItems';
import { ErrorView } from '@/src/components/ui';
import { categoryLabel } from '@/src/data/catalog';
import { won } from '@/src/lib/format';
import { monthsBetween } from '@/src/lib/upload';
import { useAsync } from '@/src/lib/useAsync';

export default function OwnedItemsScreen() {
  const { data, error, loading, reload } = useAsync(fetchOwnedItems, []);
  useFocusEffect(useCallback(() => { reload(); }, [reload]));

  if (error) return <ErrorView error={error} onRetry={reload} />;

  return (
    <View style={{ flex: 1, backgroundColor: brand.white }}>
      <FlatList
        data={data ?? []}
        keyExtractor={(i) => i.id}
        onRefresh={reload}
        refreshing={loading}
        ListHeaderComponent={
          <View style={styles.intro}>
            <Text style={styles.introTitle}>살 때 기록해 두면, 팔 때 버튼 하나로 끝나요</Text>
            <Text style={styles.introSub}>영수증과 구매처를 남겨두면 나중에 판매글이 자동으로 채워지고, "구매 영수증 확인" 배지도 붙어요.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Link href={{ pathname: '/items/[id]', params: { id: item.id } }} asChild>
            <Pressable style={styles.row}>
              <Image source={item.photoUrl ? { uri: item.photoUrl } : undefined} style={styles.thumb} />
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.meta}>
                  {categoryLabel(item.categoryId)}
                  {item.store ? ` · ${item.store}` : ''}
                  {item.purchasedOn ? ` · ${monthsBetween(item.purchasedOn)}개월 사용` : ''}
                </Text>
                <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                  {item.purchasePrice != null && <Text style={styles.price}>{won(item.purchasePrice)}</Text>}
                  {item.receiptPath && <Text style={styles.badge}>🧾 영수증</Text>}
                  {item.listingId && <Text style={[styles.badge, styles.selling]}>판매중</Text>}
                </View>
              </View>
            </Pressable>
          </Link>
        )}
        ListEmptyComponent={loading ? undefined : <Text style={styles.empty}>아직 기록한 육아용품이 없어요</Text>}
      />
      <Link href="/items/new" asChild>
        <Pressable style={styles.fab}><Text style={styles.fabText}>+ 구매 기록하기</Text></Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  intro: { margin: 12, padding: 16, borderRadius: 14, backgroundColor: brand.cream, gap: 4 },
  introTitle: { fontSize: 15, fontWeight: '700', color: brand.ink },
  introSub: { fontSize: 13, color: brand.sub, lineHeight: 19 },
  row: { flexDirection: 'row', gap: 12, padding: 14, borderBottomWidth: 1, borderColor: brand.line },
  thumb: { width: 64, height: 64, borderRadius: 8, backgroundColor: brand.line },
  title: { fontSize: 15, fontWeight: '600', color: brand.ink },
  meta: { fontSize: 12, color: brand.sub },
  price: { fontSize: 14, fontWeight: '700', color: brand.ink },
  badge: { fontSize: 11, color: '#2E9E6B', backgroundColor: '#E8F6EF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, overflow: 'hidden' },
  selling: { color: brand.primaryDark, backgroundColor: '#FFEDEA' },
  empty: { textAlign: 'center', marginTop: 30, color: brand.sub },
  fab: { position: 'absolute', right: 16, bottom: 28, backgroundColor: brand.primary, borderRadius: 24, paddingHorizontal: 18, paddingVertical: 13, elevation: 3, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  fabText: { color: brand.white, fontWeight: '700', fontSize: 15 },
});
