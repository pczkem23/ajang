import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';

import { brand } from '@/constants/Colors';
import { ListingCard } from '@/src/components/ListingCard';
import { ageBandLabel } from '@/src/data/catalog';
import { LISTINGS, ME } from '@/src/data/mock';
import { monthsLabel, monthsOld, recommendedBands } from '@/src/lib/age';

export default function HomeScreen() {
  const [query, setQuery] = useState('');
  const child = ME.children[0];
  const months = child ? monthsOld(child) : 0;
  const bands = recommendedBands(months);

  const data = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q) {
      return LISTINGS.filter((l) => `${l.title} ${l.brand ?? ''}`.toLowerCase().includes(q));
    }
    // 우리 아이 월령에 맞는 상품을 먼저, 그다음 최신순
    return [...LISTINGS].sort((a, b) => {
      const am = a.ageBands.some((x) => bands.includes(x)) ? 1 : 0;
      const bm = b.ageBands.some((x) => bands.includes(x)) ? 1 : 0;
      return bm - am || b.createdAt.localeCompare(a.createdAt);
    });
  }, [query, bands]);

  return (
    <View style={styles.container}>
      <View style={styles.searchWrap}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="상품명, 브랜드 검색 (예: 트립트랩)"
          placeholderTextColor={brand.sub}
          style={styles.search}
        />
      </View>
      <FlatList
        data={data}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => <ListingCard item={item} />}
        ListHeaderComponent={
          !query && child ? (
            <View style={styles.banner}>
              <Text style={styles.bannerTitle}>
                {child.nickname}는 지금 {monthsLabel(months)} 🍼
              </Text>
              <Text style={styles.bannerSub}>
                {bands.map(ageBandLabel).join(' · ')}에 맞는 물건을 먼저 보여드려요
              </Text>
            </View>
          ) : undefined
        }
        ListEmptyComponent={<Text style={styles.empty}>검색 결과가 없어요</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: brand.white },
  searchWrap: { padding: 12, borderBottomWidth: 1, borderColor: brand.line },
  search: { backgroundColor: brand.cream, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, color: brand.ink },
  banner: { margin: 12, padding: 16, borderRadius: 14, backgroundColor: brand.cream, gap: 4 },
  bannerTitle: { fontSize: 17, fontWeight: '700', color: brand.ink },
  bannerSub: { fontSize: 13, color: brand.sub },
  empty: { textAlign: 'center', marginTop: 40, color: brand.sub },
});
