import * as Linking from 'expo-linking';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { brand } from '@/constants/Colors';
import { Button, Field, Input } from '@/src/components/ui';
import { signInWithProvider, type SocialProvider } from '@/src/lib/oauth';
import { supabase } from '@/src/lib/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // 메일 링크로 앱이 열리면 ?code= 를 세션으로 교환
  const url = Linking.useURL();
  useEffect(() => {
    if (!url) return;
    const { queryParams } = Linking.parse(url);
    const authCode = queryParams?.code;
    if (typeof authCode === 'string') {
      setBusy(true);
      supabase.auth.exchangeCodeForSession(authCode).then(({ error }) => {
        setBusy(false);
        if (error) setMessage('링크가 만료됐어요. 다시 받아 주세요.');
      });
    }
  }, [url]);

  const [showEmail, setShowEmail] = useState(false);

  const social = async (p: SocialProvider) => {
    setBusy(true);
    setMessage(null);
    try {
      await signInWithProvider(p);
      // 성공하면 AuthProvider가 세션을 감지해 다음 화면으로 이동
    } catch (e) {
      setMessage(`로그인하지 못했어요: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  };

  const sendCode = async () => {
    setBusy(true);
    setMessage(null);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true, emailRedirectTo: Linking.createURL('/login') },
    });
    setBusy(false);
    if (error) return setMessage(error.message);
    setSent(true);
    setMessage('메일을 보냈어요. 이 기기에서 메일 속 링크를 누르거나, 메일에 6자리 코드가 있으면 아래에 입력해 주세요.');
  };

  const verify = async () => {
    setBusy(true);
    const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: 'email' });
    setBusy(false);
    if (error) setMessage('코드가 맞지 않거나 만료됐어요. 다시 받아 주세요.');
    // 성공하면 AuthProvider가 세션을 감지해 다음 화면으로 이동
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.logo}>아장</Text>
        <Text style={styles.slogan}>우리 아이가 졸업한 물건,{'\n'}누군가의 첫 시작이 되도록</Text>
      </View>
      <View style={{ gap: 10 }}>
        <Pressable style={[styles.social, { backgroundColor: '#FEE500' }]} onPress={() => social('kakao')} disabled={busy}>
          <Text style={[styles.socialText, { color: '#191919' }]}>💬  카카오로 시작하기</Text>
        </Pressable>
        <Pressable style={[styles.social, { backgroundColor: '#000' }]} onPress={() => social('apple')} disabled={busy}>
          <Text style={[styles.socialText, { color: '#fff' }]}>  Apple로 계속하기</Text>
        </Pressable>
        <Pressable style={[styles.social, styles.google]} onPress={() => social('google')} disabled={busy}>
          <Text style={[styles.socialText, { color: '#1F1F1F' }]}>G  Google로 계속하기</Text>
        </Pressable>
        {!showEmail && (
          <Text style={styles.link} onPress={() => setShowEmail(true)}>이메일로 로그인</Text>
        )}
        {!showEmail && message && <Text style={styles.message}>{message}</Text>}
      </View>
      {showEmail && (
      <View style={{ gap: 14 }}>
        <Field label="이메일">
          <Input value={email} onChangeText={setEmail} placeholder="you@example.com" autoCapitalize="none" keyboardType="email-address" editable={!sent} />
        </Field>
        {sent && (
          <Field label="인증 코드 (선택)">
            <Input value={code} onChangeText={setCode} placeholder="123456" keyboardType="number-pad" maxLength={6} />
          </Field>
        )}
        {message && <Text style={styles.message}>{message}</Text>}
        {sent ? (
          <>
            <Button title="시작하기" onPress={verify} disabled={code.trim().length < 6} loading={busy} />
            <Text style={styles.link} onPress={() => { setSent(false); setCode(''); setMessage(null); }}>이메일 다시 입력</Text>
          </>
        ) : (
          <Button title="로그인 메일 받기" onPress={sendCode} disabled={!email.includes('@')} loading={busy} />
        )}
      </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', gap: 32, backgroundColor: brand.white },
  hero: { alignItems: 'center', gap: 10 },
  logo: { fontSize: 44, fontWeight: '800', color: brand.primary },
  slogan: { fontSize: 15, color: brand.sub, textAlign: 'center', lineHeight: 22 },
  message: { fontSize: 13, color: brand.primaryDark },
  link: { textAlign: 'center', color: brand.sub, fontSize: 13, marginTop: 6 },
  social: { borderRadius: 12, paddingVertical: 15, alignItems: 'center' },
  socialText: { fontSize: 16, fontWeight: '700' },
  google: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#DADCE0' },
});
