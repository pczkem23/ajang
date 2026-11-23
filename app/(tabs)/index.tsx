import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';

import { brand } from '@/constants/Colors';
import { fetchListings } from '@/src/api/listings';
import { ListingCard } from '@/src/components/ListingCard';
import { ErrorView } from '@/src/components/ui';
import { ageBandLabel } from '@/src/data/catalog';
import { monthsLabel, monthsOld, recommendedBands } from '@/src/lib/age';
import { useAuth } from '@/src/lib/auth';
import { useAsync } from '@/src/lib/useAsync';

export default function HomeScreen() {
  const { profile } = useAuth();
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState('');
  const child = profile?.children[0];
  const months = child ? monthsOld(child) : 0;
  const bands = useMemo(() => recommendedBands(months), [months]);

  const { data, error, loading, reload } = useAsync(() => fetchListings({ query: submitted }), [submitted]);
  useFocusEffect(useCallback(() => { reload(); }, [reload]));

  const sorted = useMemo(() => {
    if (!data || submitted) return data ?? [];
    // 우리 아이 월령에 맞는 상품을 먼저, 그다음 최신순
    return [...data].sort((a, b) => {
      const am = a.ageBands.some((x) => bands.includes(x)) ? 1 : 0;
      const bm = b.ageBands.some((x) => bands.includes(x)) ? 1 : 0;
      return bm - am || b.createdAt.localeCompare(a.createdAt);
    });
  }, [data, submitted, bands]);

  if (error) return <ErrorView error={error} onRetry={reload} />;

  return (
    <View style={styles.container}>
      <View style={styles.searchWrap}>
        <TextInput
          value={query}
          onChangeText={(t) => { setQuery(t); if (!t) setSubmitted(''); }}
          onSubmitEditing={() => setSubmitted(query)}
          returnKeyType="search"
          placeholder="상품명, 브랜드 검색 (예: 트립트랩)"
          placeholderTextColor={brand.sub}
          style={styles.search}
        />
      </View>
      <FlatList
        data={sorted}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => <ListingCard item={item} />}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={reload} />}
        ListHeaderComponent={
          !submitted && child ? (
            <View style={styles.banner}>
              <Text style={styles.bannerTitle}>
                {child.nickname}는 지금 {monthsLabel(months)} 🍼
              </Text>
              <Text style={styles.bannerSub}>{bands.map(ageBandLabel).join(' · ')}에 맞는 물건을 먼저 보여드려요</Text>
            </View>
          ) : undefined
        }
        ListEmptyComponent={
          loading ? undefined : (
            <Text style={styles.empty}>{submitted ? '검색 결과가 없어요' : '아직 등록된 물건이 없어요.\n첫 판매글을 올려보세요!'}</Text>
          )
        }
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
  empty: { textAlign: 'center', marginTop: 40, color: brand.sub, lineHeight: 22 },
});
