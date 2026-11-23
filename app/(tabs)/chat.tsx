import { FlatList, StyleSheet, Text, View } from 'react-native';

import { brand } from '@/constants/Colors';
import { CHAT_ROOMS, LISTINGS } from '@/src/data/mock';
import { timeAgo } from '@/src/lib/format';

export default function ChatScreen() {
  return (
    <FlatList
      style={{ backgroundColor: brand.white }}
      data={CHAT_ROOMS}
      keyExtractor={(r) => r.id}
      renderItem={({ item }) => {
        const listing = LISTINGS.find((l) => l.id === item.listingId);
        return (
          <View style={styles.row}>
            <View style={styles.avatar}>
              <Text>🙂</Text>
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={styles.name}>
                {item.partnerNickname} <Text style={styles.meta}>· {timeAgo(item.updatedAt)}</Text>
              </Text>
              <Text style={styles.msg} numberOfLines={1}>{item.lastMessage}</Text>
              {listing && <Text style={styles.meta} numberOfLines={1}>{listing.title}</Text>}
            </View>
            {item.unread > 0 && (
              <View style={styles.unread}>
                <Text style={styles.unreadText}>{item.unread}</Text>
              </View>
            )}
          </View>
        );
      }}
      ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 40, color: brand.sub }}>아직 채팅이 없어요</Text>}
    />
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12, borderBottomWidth: 1, borderColor: brand.line },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: brand.cream, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 15, fontWeight: '600', color: brand.ink },
  msg: { fontSize: 14, color: brand.ink },
  meta: { fontSize: 12, color: brand.sub, fontWeight: '400' },
  unread: { backgroundColor: brand.primary, borderRadius: 10, minWidth: 20, paddingHorizontal: 6, paddingVertical: 2, alignItems: 'center' },
  unreadText: { color: brand.white, fontSize: 12, fontWeight: '700' },
});
