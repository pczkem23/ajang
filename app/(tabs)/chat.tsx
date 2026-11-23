import { StyleSheet, Text, View } from 'react-native';

import { brand } from '@/constants/Colors';

// TODO(다음 단계): chat_rooms/messages 테이블 + Supabase Realtime 구독
export default function ChatScreen() {
  return (
    <View style={styles.center}>
      <Text style={{ fontSize: 40 }}>💬</Text>
      <Text style={styles.title}>채팅은 곧 열려요</Text>
      <Text style={styles.sub}>상품 상세에서 판매자와 1:1로 대화할 수 있게 준비하고 있어요.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 8, backgroundColor: brand.white },
  title: { fontSize: 17, fontWeight: '700', color: brand.ink },
  sub: { fontSize: 14, color: brand.sub, textAlign: 'center' },
});
