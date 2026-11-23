import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { brand } from '@/constants/Colors';
import { Loading } from '@/src/components/ui';
import { monthsLabel, monthsOld } from '@/src/lib/age';
import { useAuth } from '@/src/lib/auth';

const MENU = ['찜 목록', '판매 내역', '구매 내역', '받은 거래 후기', '우리 집 육아용품 (준비중)', '신고·차단 관리', '고객센터'];

export default function MyScreen() {
  const { profile: ME, signOut } = useAuth();
  if (!ME) return <Loading />;
  return (
    <ScrollView style={{ backgroundColor: brand.white }} contentContainerStyle={{ padding: 16, gap: 16 }}>
      <View style={styles.profile}>
        <View style={styles.avatar}><Text style={{ fontSize: 28 }}>🧑‍🍼</Text></View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={styles.name}>{ME.nickname}</Text>
          <Text style={styles.meta}>{ME.region}</Text>
          <Text style={styles.meta}>{ME.phoneVerified ? '✅ 휴대폰 본인인증 완료' : '본인인증 필요'}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>신뢰 점수 {ME.trustScore}점</Text>
        <View style={styles.bar}><View style={[styles.fill, { width: `${ME.trustScore}%` }]} /></View>
        <Text style={styles.meta}>거래 후기 {ME.reviewCount}개 기반</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>우리 아이</Text>
        {ME.children.map((c) => (
          <Text key={c.id} style={styles.item}>👶 {c.nickname} · {monthsLabel(monthsOld(c))}</Text>
        ))}
        <Text style={styles.link}>+ 아이 추가 (출산 예정일도 등록 가능)</Text>
      </View>

      <View>
        {MENU.map((m) => (
          <Text key={m} style={styles.menu}>{m}</Text>
        ))}
        <Pressable onPress={signOut}>
          <Text style={[styles.menu, { color: brand.sub }]}>로그아웃</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  profile: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: brand.cream, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 18, fontWeight: '700', color: brand.ink },
  meta: { fontSize: 13, color: brand.sub },
  card: { backgroundColor: brand.cream, borderRadius: 14, padding: 16, gap: 8 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: brand.ink },
  bar: { height: 8, borderRadius: 4, backgroundColor: brand.line, overflow: 'hidden' },
  fill: { height: 8, backgroundColor: brand.primary },
  item: { fontSize: 14, color: brand.ink },
  link: { fontSize: 13, color: brand.primaryDark, fontWeight: '600' },
  menu: { fontSize: 15, color: brand.ink, paddingVertical: 14, borderBottomWidth: 1, borderColor: brand.line },
});
