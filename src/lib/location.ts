import * as Location from 'expo-location';
import { Platform } from 'react-native';

/** 현재 위치를 받아 "성남시 분당구 정자동" 같은 동네 이름으로 바꿔요. */
export async function detectRegion(): Promise<string> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('위치 권한이 없어서 동네를 찾지 못했어요. 직접 입력해 주세요.');
  }
  const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
  const { latitude, longitude } = pos.coords;
  const name = Platform.OS === 'web' ? await reverseWeb(latitude, longitude) : await reverseNative(latitude, longitude);
  if (!name) throw new Error('현재 위치의 동네 이름을 찾지 못했어요. 직접 입력해 주세요.');
  return name;
}

async function reverseNative(latitude: number, longitude: number) {
  const [a] = await Location.reverseGeocodeAsync({ latitude, longitude });
  if (!a) return '';
  return joinParts([a.city, a.subregion, a.district]);
}

/** 웹은 기기 지오코더가 없어서 OpenStreetMap(Nominatim)으로 주소를 찾아요. */
async function reverseWeb(latitude: number, longitude: number) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&accept-language=ko&zoom=16&lat=${latitude}&lon=${longitude}`;
  const res = await fetch(url);
  if (!res.ok) return '';
  const { address = {} } = (await res.json()) as { address?: Record<string, string> };
  return joinParts([
    address.city ?? address.county,
    address.borough ?? address.city_district,
    address.quarter ?? address.suburb ?? address.neighbourhood,
  ]);
}

function joinParts(parts: (string | null | undefined)[]) {
  const seen = new Set<string>();
  return parts
    .map((p) => p?.trim())
    .filter((p): p is string => !!p && !seen.has(p) && (seen.add(p), true))
    .join(' ');
}
