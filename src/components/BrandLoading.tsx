import { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';

import { brand } from '@/constants/Colors';

export const SPLASH_BG = '#FFF3E3';

/** 앱을 켤 때 보이는 아장 로딩 화면. 네이티브 스플래시와 같은 배경·아이콘이라 자연스럽게 이어져요. */
export function BrandLoading() {
  const spin = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(spin, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.cubic), useNativeDriver: true }),
        Animated.delay(500),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [spin, fade]);

  // 아기가 폴짝 뛰듯 살짝 튀어 오르며 커졌다 돌아와요.
  const translateY = spin.interpolate({ inputRange: [0, 0.4, 0.7, 1], outputRange: [0, -18, 0, 0] });
  const scale = spin.interpolate({ inputRange: [0, 0.4, 0.7, 0.85, 1], outputRange: [1, 1.05, 0.96, 1.02, 1] });

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ translateY }, { scale }] }}>
        <Image source={require('../../assets/images/splash-icon.png')} style={styles.icon} />
      </Animated.View>
      <Animated.View style={{ opacity: fade, alignItems: 'center' }}>
        <Text style={styles.title}>아장</Text>
        <Text style={styles.tagline}>우리 아이 물건, 다음 아이에게</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: SPLASH_BG, gap: 8 },
  icon: { width: 200, height: 200 },
  title: { fontSize: 30, fontWeight: '800', color: '#5B4636', letterSpacing: 2 },
  tagline: { fontSize: 14, color: brand.sub, marginTop: 4 },
});
