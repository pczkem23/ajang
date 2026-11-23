import { Tabs } from 'expo-router';
import { Text } from 'react-native';

import { brand } from '@/constants/Colors';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

const icon = (emoji: string) => ({ focused }: { focused: boolean }) => (
  <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.45 }}>{emoji}</Text>
);

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: brand.primary,
        headerShown: useClientOnlyValue(false, true),
        headerTitleStyle: { fontWeight: '700' },
      }}>
      <Tabs.Screen name="index" options={{ title: '홈', headerTitle: '아장 · 아기장터', tabBarIcon: icon('🏠') }} />
      <Tabs.Screen name="category" options={{ title: '카테고리', tabBarIcon: icon('🗂️') }} />
      <Tabs.Screen name="sell" options={{ title: '판매하기', tabBarIcon: icon('➕') }} />
      <Tabs.Screen name="chat" options={{ title: '채팅', tabBarIcon: icon('💬') }} />
      <Tabs.Screen name="my" options={{ title: '마이', headerTitle: '마이페이지', tabBarIcon: icon('👤') }} />
    </Tabs>
  );
}
