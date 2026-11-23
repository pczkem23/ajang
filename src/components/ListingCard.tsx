import { Link } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { brand } from '@/constants/Colors';
import { conditionOf } from '../data/catalog';
import { savingRate, timeAgo, won } from '../lib/format';
import type { Listing } from '../types';

const STATUS_LABEL = { selling: null, reserved: '예약중', sold: '거래완료' } as const;

export function ListingCard({ item }: { item: Listing }) {
  const cond = conditionOf(item.condition);
  const saving = savingRate(item.price, item.newPrice);
  const status = STATUS_LABEL[item.status];

  return (
    <Link href={{ pathname: '/listing/[id]', params: { id: item.id } }} asChild>
      <Pressable style={styles.card}>
        <Image source={item.photos[0] ? { uri: item.photos[0] } : undefined} style={styles.photo} />
        <View style={styles.body}>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.meta}>
            {item.region} · {timeAgo(item.createdAt)}
          </Text>
          <View style={styles.row}>
            <View style={[styles.badge, { backgroundColor: cond.color }]}>
              <Text style={styles.badgeText}>{item.condition}급</Text>
            </View>
            <Text style={styles.meta}>{item.usedMonths}개월 사용</Text>
          </View>
          <View style={styles.row}>
            {status && (
              <View style={[styles.badge, { backgroundColor: brand.ink }]}>
                <Text style={styles.badgeText}>{status}</Text>
              </View>
            )}
            <Text style={styles.price}>{won(item.price)}</Text>
            {saving !== null && <Text style={styles.saving}>신품 대비 {saving}%↓</Text>}
          </View>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', padding: 14, gap: 12, borderBottomWidth: 1, borderColor: brand.line, backgroundColor: brand.white },
  photo: { width: 104, height: 104, borderRadius: 10, backgroundColor: brand.line },
  body: { flex: 1, gap: 4 },
  title: { fontSize: 15, color: brand.ink, fontWeight: '500' },
  meta: { fontSize: 12, color: brand.sub },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  badgeText: { color: brand.white, fontSize: 11, fontWeight: '700' },
  price: { fontSize: 16, fontWeight: '700', color: brand.ink },
  saving: { fontSize: 12, color: brand.primaryDark, fontWeight: '600' },
});
