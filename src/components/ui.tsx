import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { brand } from '@/constants/Colors';

export function Button({ title, onPress, disabled, loading }: { title: string; onPress: () => void; disabled?: boolean; loading?: boolean }) {
  return (
    <Pressable onPress={onPress} disabled={disabled || loading} style={[s.button, (disabled || loading) && { opacity: 0.4 }]}>
      {loading ? <ActivityIndicator color={brand.white} /> : <Text style={s.buttonText}>{title}</Text>}
    </Pressable>
  );
}

export function Input(props: TextInputProps) {
  return <TextInput placeholderTextColor={brand.sub} {...props} style={[s.input, props.style]} />;
}

export function Field({ label, children, flex }: { label: string; children: React.ReactNode; flex?: boolean }) {
  return (
    <View style={[{ gap: 6 }, flex && { flex: 1 }]}>
      <Text style={s.label}>{label}</Text>
      {children}
    </View>
  );
}

export function Loading() {
  return (
    <View style={s.center}>
      <ActivityIndicator color={brand.primary} />
    </View>
  );
}

export function ErrorView({ error, onRetry }: { error: Error; onRetry?: () => void }) {
  return (
    <View style={s.center}>
      <Text style={{ color: brand.sub, marginBottom: 12 }}>불러오지 못했어요: {error.message}</Text>
      {onRetry && <Text style={{ color: brand.primaryDark, fontWeight: '600' }} onPress={onRetry}>다시 시도</Text>}
    </View>
  );
}

export const s = StyleSheet.create({
  button: { backgroundColor: brand.primary, borderRadius: 12, paddingVertical: 15, alignItems: 'center' },
  buttonText: { color: brand.white, fontSize: 16, fontWeight: '700' },
  input: { borderWidth: 1, borderColor: brand.line, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: brand.ink },
  label: { fontSize: 13, fontWeight: '600', color: brand.ink },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: brand.white },
});
