import { Stack, useLocalSearchParams } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { brand } from '@/constants/Colors';
import { ageBandLabel, categoryLabel, conditionOf } from '@/src/data/catalog';
import { fetchListing } from '@/src/api/listings';
import { ErrorView, Loading } from '@/src/components/ui';
import { useAsync } from '@/src/lib/useAsync';
import { savingRate, timeAgo, won } from '@/src/lib/format';

export default function ListingDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width } = useWindowDimensions();
  const { data: item, error, loading, reload } = useAsync(() => fetchListing(id), [id]);
  if (loading) return <Loading />;
  if (error) return <ErrorView error={error} onRetry={reload} />;
  if (!item) return <Text style={{ padding: 20 }}>상품을 찾을 수 없어요</Text>;

  const cond = conditionOf(item.condition);
  const saving = savingRate(item.price, item.newPrice);

  return (
    <View style={{ flex: 1, backgroundColor: brand.white }}>
      <Stack.Screen options={{ title: '' }} />
      <ScrollView>
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
          {(item.photos.length ? item.photos : [undefined]).map((uri, i) => (
            <Image key={i} source={uri ? { uri } : undefined} style={[styles.photo, { width }]} />
          ))}
        </ScrollView>
        <View style={styles.body}>
          <Text style={styles.meta}>{categoryLabel(item.categoryId)} · {item.region} · {timeAgo(item.createdAt)}</Text>
          <Text style={styles.title}>{item.title}</Text>

          <View style={styles.specs}>
            <Spec k="상태" v={`${item.condition}급 · ${cond.label}`} color={cond.color} />
            <Spec k="사용 기간" v={`${item.usedMonths}개월`} />
            <Spec k="추천 월령" v={item.ageBands.map(ageBandLabel).join(', ')} />
            {item.brand && <Spec k="브랜드" v={item.brand} />}
          </View>

          {item.newPrice && (
            <View style={styles.compare}>
              <Text style={styles.meta}>신품가 {won(item.newPrice)}</Text>
              <Text style={styles.compareMain}>지금 사면 {won(item.newPrice - item.price)} 절약 ({saving}%)</Text>
            </View>
          )}

          {item.safetySensitive && (
            <View style={styles.safety}>
              <Text style={styles.safetyText}>
                ⚠️ 안전 관련 제품이에요. 구매 전 제조일·모델명을 확인하고, 리콜 여부를 꼭 조회하세요. 상태 등급은 안전성을 보증하지 않아요.
              </Text>
            </View>
          )}

          <Text style={styles.desc}>{item.description}</Text>
          <Text style={styles.meta}>관심 {item.likes}</Text>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Text style={styles.price}>{won(item.price)}</Text>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>채팅하기</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Spec({ k, v, color }: { k: string; v: string; color?: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: 10 }}>
      <Text style={[styles.meta, { width: 64 }]}>{k}</Text>
      <Text style={{ flex: 1, fontSize: 14, color: color ?? brand.ink, fontWeight: color ? '700' : '400' }}>{v}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  photo: { aspectRatio: 1, backgroundColor: brand.line },
  body: { padding: 16, gap: 12 },
  title: { fontSize: 20, fontWeight: '700', color: brand.ink },
  meta: { fontSize: 13, color: brand.sub },
  specs: { gap: 8, padding: 14, backgroundColor: brand.cream, borderRadius: 12 },
  compare: { gap: 2 },
  compareMain: { fontSize: 15, fontWeight: '700', color: brand.primaryDark },
  safety: { backgroundColor: '#FFF4E5', borderRadius: 10, padding: 12 },
  safetyText: { fontSize: 13, color: '#8A5300', lineHeight: 19 },
  desc: { fontSize: 15, lineHeight: 23, color: brand.ink },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderTopWidth: 1, borderColor: brand.line },
  price: { fontSize: 19, fontWeight: '700', color: brand.ink },
  button: { backgroundColor: brand.primary, borderRadius: 10, paddingHorizontal: 22, paddingVertical: 12 },
  buttonText: { color: brand.white, fontWeight: '700', fontSize: 15 },
});
