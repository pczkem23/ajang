import { Pressable, StyleSheet, Text } from 'react-native';

import { brand } from '@/constants/Colors';

export function Chip({ label, selected, onPress }: { label: string; selected?: boolean; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, selected && styles.selected]}>
      <Text style={[styles.text, selected && styles.selectedText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16, borderWidth: 1, borderColor: brand.line, backgroundColor: brand.white },
  selected: { backgroundColor: brand.primary, borderColor: brand.primary },
  text: { fontSize: 13, color: brand.ink },
  selectedText: { color: brand.white, fontWeight: '600' },
});
