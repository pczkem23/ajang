import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { brand } from '@/constants/Colors';
import { Chip } from '@/src/components/Chip';
import { Button, Field, Input } from '@/src/components/ui';
import { addChild, updateProfile } from '@/src/api/profile';
import { useAuth } from '@/src/lib/auth';
import { detectRegion } from '@/src/lib/location';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

type ChildDraft = { key: number; name: string; born: boolean; date: string };

let nextKey = 1;
const emptyChild = (): ChildDraft => ({ key: nextKey++, name: '', born: true, date: '' });
const childValid = (c: ChildDraft) => !!c.name.trim() && DATE_RE.test(c.date);

export default function OnboardingScreen() {
  const { session, profile, refreshProfile } = useAuth();
  const [nickname, setNickname] = useState(profile?.nickname ?? '');
  const [region, setRegion] = useState(profile?.region ?? '');
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);
  const [children, setChildren] = useState<ChildDraft[]>([emptyChild()]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasChildren = (profile?.children.length ?? 0) > 0;

  const locate = async () => {
    setLocating(true);
    setLocError(null);
    try {
      setRegion(await detectRegion());
    } catch (e) {
      setLocError((e as Error).message);
    } finally {
      setLocating(false);
    }
  };

  // 처음 들어오면 현재 위치로 동네를 자동으로 채워요.
  useEffect(() => {
    if (!profile?.region) locate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateChild = (key: number, patch: Partial<ChildDraft>) =>
    setChildren((list) => list.map((c) => (c.key === key ? { ...c, ...patch } : c)));
  const removeChild = (key: number) => setChildren((list) => list.filter((c) => c.key !== key));

  const valid = !!nickname.trim() && !!region.trim() && (hasChildren || (children.length > 0 && children.every(childValid)));

  const submit = async () => {
    if (!session) return;
    setBusy(true);
    setError(null);
    try {
      await updateProfile(session.user.id, { nickname: nickname.trim(), region: region.trim() });
      if (!hasChildren) {
        for (const c of children) {
          await addChild(session.user.id, { nickname: c.name.trim(), ...(c.born ? { birthDate: c.date } : { dueDate: c.date }) });
        }
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
        <View style={styles.row}>
          <Input
            value={region}
            onChangeText={setRegion}
            placeholder={locating ? '현재 위치를 찾는 중…' : '예: 성남시 분당구 정자동'}
            style={{ flex: 1 }}
          />
          <Pressable onPress={locate} disabled={locating} style={styles.locButton}>
            {locating ? <ActivityIndicator color={brand.primaryDark} /> : <Text style={styles.locText}>📍 현재 위치</Text>}
          </Pressable>
        </View>
        {locError ? <Text style={styles.hint}>{locError}</Text> : <Text style={styles.hint}>현재 위치로 자동으로 채워져요. 틀리면 직접 고칠 수 있어요.</Text>}
      </Field>

      {!hasChildren && (
        <>
          <View style={styles.divider} />
          <Text style={styles.section}>우리 아이</Text>

          {children.map((c, i) => (
            <View key={c.key} style={styles.card}>
              <View style={styles.cardHead}>
                <Text style={styles.cardTitle}>{i + 1}번째 아이</Text>
                {children.length > 1 && (
                  <Text style={styles.remove} onPress={() => removeChild(c.key)}>
                    삭제
                  </Text>
                )}
              </View>
              <Field label="아이 이름(태명)">
                <Input value={c.name} onChangeText={(name) => updateChild(c.key, { name })} placeholder="예: 콩이" />
              </Field>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                <Chip label="태어났어요" selected={c.born} onPress={() => updateChild(c.key, { born: true })} />
                <Chip label="출산 예정이에요" selected={!c.born} onPress={() => updateChild(c.key, { born: false })} />
              </View>
              <Field label={c.born ? '생년월일' : '출산 예정일'}>
                <Input
                  value={c.date}
                  onChangeText={(date) => updateChild(c.key, { date })}
                  placeholder="YYYY-MM-DD"
                  maxLength={10}
                  keyboardType="numbers-and-punctuation"
                />
              </Field>
            </View>
          ))}

          <Pressable onPress={() => setChildren((list) => [...list, emptyChild()])} style={styles.addChild}>
            <Text style={styles.addChildText}>＋ 아이 추가하기</Text>
          </Pressable>
        </>
      )}

      {error && <Text style={{ color: brand.primaryDark }}>{error}</Text>}
      <Button title="시작하기" onPress={submit} disabled={!valid} loading={busy} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, gap: 16, paddingTop: 64 },
  title: { fontSize: 26, fontWeight: '800', color: brand.ink },
  sub: { fontSize: 14, color: brand.sub, marginBottom: 8 },
  section: { fontSize: 16, fontWeight: '700', color: brand.ink },
  divider: { height: 1, backgroundColor: brand.line, marginVertical: 4 },
  row: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  locButton: { borderWidth: 1, borderColor: brand.primary, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 10, minWidth: 92, alignItems: 'center' },
  locText: { color: brand.primaryDark, fontWeight: '600', fontSize: 13 },
  hint: { fontSize: 12, color: brand.sub },
  card: { gap: 12, padding: 14, borderRadius: 14, backgroundColor: brand.cream },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 14, fontWeight: '700', color: brand.ink },
  remove: { fontSize: 13, color: brand.sub },
  addChild: { borderWidth: 1, borderStyle: 'dashed', borderColor: brand.primary, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  addChildText: { color: brand.primaryDark, fontWeight: '700' },
});
