import { useFonts } from 'expo-font';
import { DefaultTheme, Stack, ThemeProvider, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { Loading } from '@/src/components/ui';
import { AuthProvider, isOnboarded, useAuth } from '@/src/lib/auth';


export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  anchor: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}

function RootLayoutNav() {
  const { session, profile, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // 로그인 → 온보딩 → 메인 순서로 이동
  useEffect(() => {
    if (loading) return;
    const top = segments[0];
    if (!session) {
      if (top !== 'login') router.replace('/login');
    } else if (!isOnboarded(profile)) {
      if (top !== 'onboarding') router.replace('/onboarding');
    } else if (top === 'login' || top === 'onboarding') {
      router.replace('/');
    }
  }, [loading, session, profile, segments, router]);

  if (loading) return <Loading />;

  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="listing/[id]" options={{ title: '', headerBackTitle: '뒤로' }} />
      </Stack>
    </ThemeProvider>
  );
}
