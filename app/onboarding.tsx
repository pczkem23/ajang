import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { brand } from '@/constants/Colors';
import { Chip } from '@/src/components/Chip';
import { Button, Field, Input } from '@/src/components/ui';
import { addChild, updateProfile } from '@/src/api/profile';
import { useAuth } from '@/src/lib/auth';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export default function OnboardingScreen() {
  const { session, profile, refreshProfile } = useAuth();
  const [nickname, setNickname] = useState(profile?.nickname ?? '');
  const [region, setRegion] = useState(profile?.region ?? '');
  const [childName, setChildName] = useState('');
  const [born, setBorn] = useState(true);
  const [date, setDate] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const valid = nickname.trim() && region.trim() && childName.trim() && DATE_RE.test(date);

  const submit = async () => {
    if (!session) return;
    setBusy(true);
    setError(null);
    try {
      await updateProfile(session.user.id, { nickname: nickname.trim(), region: region.trim() });
      if (!profile?.children.length) {
        await addChild(session.user.id, { nickname: childName.trim(), ...(born ? { birthDate: date } : { dueDate: date }) });
      }
      await refreshProfile();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView style={{ backgroundColor: brand.white }} contentContainerStyle={styles.container}>
      <Text style={styles.title}>반가워요! 👋</Text>
      <Text style={styles.sub}>아이 월령에 맞는 물건을 먼저 보여드릴게요.</Text>

      <Field label="닉네임">
        <Input value={nickname} onChangeText={setNickname} placeholder="예: 초보맘민트" maxLength={12} />
      </Field>
      <Field label="거래 동네">
        <Input value={region} onChangeText={setRegion} placeholder="예: 분당구 정자동" />
      </Field>

      <View style={styles.divider} />

      <Field label="아이 이름(태명)">
        <Input value={childName} onChangeText={setChildName} placeholder="예: 콩이" />
      </Field>
      <View style={{ flexDirection: 'row', gap: 6 }}>
        <Chip label="태어났어요" selected={born} onPress={() => setBorn(true)} />
        <Chip label="출산 예정이에요" selected={!born} onPress={() => setBorn(false)} />
      </View>
      <Field label={born ? '생년월일' : '출산 예정일'}>
        <Input value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" maxLength={10} keyboardType="numbers-and-punctuation" />
      </Field>

      {error && <Text style={{ color: brand.primaryDark }}>{error}</Text>}
      <Button title="시작하기" onPress={submit} disabled={!valid} loading={busy} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, gap: 16, paddingTop: 64 },
  title: { fontSize: 26, fontWeight: '800', color: brand.ink },
  sub: { fontSize: 14, color: brand.sub, marginBottom: 8 },
  divider: { height: 1, backgroundColor: brand.line, marginVertical: 4 },
});
