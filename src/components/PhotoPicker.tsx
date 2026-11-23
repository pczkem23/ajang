import * as ImagePicker from 'expo-image-picker';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { brand } from '@/constants/Colors';

/** 사진 1장 선택 (카메라 또는 앨범) */
export function PhotoPicker({ label, hint, uri, onChange }: { label: string; hint?: string; uri?: string; onChange: (uri?: string) => void }) {
  const pick = async (fromCamera: boolean) => {
    const opts: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.7 };
    if (fromCamera) {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) return;
    }
    const res = fromCamera ? await ImagePicker.launchCameraAsync(opts) : await ImagePicker.launchImageLibraryAsync(opts);
    if (!res.canceled) onChange(res.assets[0].uri);
  };

  return (
    <View style={styles.box}>
      {uri ? (
        <Pressable onPress={() => onChange(undefined)}>
          <Image source={{ uri }} style={styles.preview} />
          <Text style={styles.remove}>✕ 다시 찍기</Text>
        </Pressable>
      ) : (
        <>
          <Text style={styles.label}>{label}</Text>
          {hint && <Text style={styles.hint}>{hint}</Text>}
          <View style={styles.row}>
            <Pressable style={styles.btn} onPress={() => pick(true)}><Text style={styles.btnText}>📷 촬영</Text></Pressable>
            <Pressable style={styles.btn} onPress={() => pick(false)}><Text style={styles.btnText}>🖼️ 앨범</Text></Pressable>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { borderWidth: 1, borderStyle: 'dashed', borderColor: brand.primary, borderRadius: 12, padding: 14, alignItems: 'center', gap: 6, backgroundColor: brand.cream, flex: 1 },
  label: { fontSize: 14, fontWeight: '700', color: brand.primaryDark },
  hint: { fontSize: 11, color: brand.sub, textAlign: 'center' },
  row: { flexDirection: 'row', gap: 6, marginTop: 4 },
  btn: { backgroundColor: brand.white, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: brand.line },
  btnText: { fontSize: 13, color: brand.ink },
  preview: { width: 120, height: 120, borderRadius: 8 },
  remove: { fontSize: 12, color: brand.sub, textAlign: 'center', marginTop: 4 },
});
