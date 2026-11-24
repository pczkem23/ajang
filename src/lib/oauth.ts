import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import { supabase } from './supabase';

WebBrowser.maybeCompleteAuthSession();

export type SocialProvider = 'kakao' | 'google' | 'apple';

/**
 * 소셜 로그인: Supabase가 만든 로그인 주소를 앱 안 브라우저로 열고,
 * 돌아온 ?code= 를 세션으로 교환한다 (PKCE). Expo Go와 정식 앱 모두에서 동작.
 */
export async function signInWithProvider(provider: SocialProvider): Promise<'ok' | 'cancel'> {
  const redirectTo = Linking.createURL('/login');
  // 카카오: 이메일 동의 항목이 없어도 가입되도록 기본 프로필만 요청
  const scopes = provider === 'kakao' ? { scopes: 'profile_nickname profile_image' } : {};

  // 웹: 주소를 받아온 뒤 여는 팝업은 Safari 등이 막으므로 페이지 자체를 이동한다.
  // 돌아오면 login 화면이 ?code= 를 세션으로 교환한다.
  if (Platform.OS === 'web') {
    const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo, ...scopes } });
    if (error) throw error;
    return 'ok';
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo, skipBrowserRedirect: true, ...scopes },
  });
  if (error) throw error;

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== 'success') return 'cancel';

  const { queryParams } = Linking.parse(result.url);
  const errDesc = queryParams?.error_description;
  if (typeof errDesc === 'string') throw new Error(errDesc);
  const code = queryParams?.code;
  if (typeof code !== 'string') throw new Error('로그인 응답에 코드가 없어요.');

  const { error: exErr } = await supabase.auth.exchangeCodeForSession(code);
  if (exErr) throw exErr;
  return 'ok';
}
