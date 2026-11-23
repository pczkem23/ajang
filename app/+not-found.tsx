import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { brand } from '@/constants/Colors';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: '앗!' }} />
      <View style={styles.container}>
        <Text style={styles.title}>없는 화면이에요.</Text>
        <Link href="/" style={styles.link}>
          <Text style={{ color: brand.primaryDark }}>홈으로 가기</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: brand.white },
  title: { fontSize: 20, fontWeight: 'bold', color: brand.ink },
  link: { marginTop: 15, paddingVertical: 15 },
});
