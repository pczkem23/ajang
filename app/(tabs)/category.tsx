import { useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';

import { brand } from '@/constants/Colors';
import { Chip } from '@/src/components/Chip';
import { ListingCard } from '@/src/components/ListingCard';
import { AGE_BANDS, CATEGORIES, CONDITIONS } from '@/src/data/catalog';
import { LISTINGS } from '@/src/data/mock';
import type { AgeBandId, CategoryId, ConditionGrade } from '@/src/types';

export default function CategoryScreen() {
  const [cat, setCat] = useState<CategoryId | null>(null);
  const [age, setAge] = useState<AgeBandId | null>(null);
  const [cond, setCond] = useState<ConditionGrade | null>(null);

  const data = useMemo(
    () =>
      LISTINGS.filter(
        (l) => (!cat || l.categoryId === cat) && (!age || l.ageBands.includes(age)) && (!cond || l.condition === cond),
      ),
    [cat, age, cond],
  );

  const toggle = <T,>(cur: T | null, v: T, set: (x: T | null) => void) => set(cur === v ? null : v);

  return (
    <View style={styles.container}>
      <View style={styles.filters}>
        <Text style={styles.label}>품목</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
          {CATEGORIES.map((c) => (
            <Chip key={c.id} label={`${c.emoji} ${c.label}`} selected={cat === c.id} onPress={() => toggle(cat, c.id, setCat)} />
          ))}
        </ScrollView>
        <Text style={styles.label}>월령</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
          {AGE_BANDS.map((a) => (
            <Chip key={a.id} label={a.label} selected={age === a.id} onPress={() => toggle(age, a.id, setAge)} />
          ))}
        </ScrollView>
        <Text style={styles.label}>상태</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
          {CONDITIONS.map((c) => (
            <Chip key={c.grade} label={`${c.grade}급 ${c.label}`} selected={cond === c.grade} onPress={() => toggle(cond, c.grade, setCond)} />
          ))}
        </ScrollView>
      </View>
      <FlatList
        data={data}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => <ListingCard item={item} />}
        ListEmptyComponent={<Text style={styles.empty}>조건에 맞는 상품이 없어요</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: brand.white },
  filters: { paddingVertical: 8, borderBottomWidth: 1, borderColor: brand.line, gap: 4 },
  label: { fontSize: 12, color: brand.sub, marginLeft: 14, marginTop: 4 },
  row: { gap: 6, paddingHorizontal: 12 },
  empty: { textAlign: 'center', marginTop: 40, color: brand.sub },
});
