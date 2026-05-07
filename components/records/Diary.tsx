import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Activity, Save } from 'lucide-react-native';
import VasBar from '@/components/charts/VasBar';
import FlareGraph from '@/components/charts/FlareGraph';
import { JOINTS } from '@/constants/joints';
import { useFlareEntries, useUpsertFlareEntry } from '@/lib/queries';
import { today } from '@/lib/schedule';
import { useTheme } from '@/lib/themeStore';
import { useT } from '@/lib/i18n/useT';

export default function Diary() {
  const { tokens } = useTheme();
  const t = useT();
  const todayStr = today();

  const flaresQ = useFlareEntries();
  const upsert = useUpsertFlareEntry();

  const entries = flaresQ.data ?? [];
  const todayEntry = entries.find((e) => e.entryDate === todayStr);
  const past = entries
    .filter((e) => e.entryDate !== todayStr)
    .sort((a, b) => b.entryDate.localeCompare(a.entryDate));

  const [pain, setPain] = useState(todayEntry?.pain ?? 0);
  const [stiffness, setStiffness] = useState(todayEntry?.stiffnessMin ?? 0);
  const [fatigue, setFatigue] = useState(todayEntry?.fatigue ?? 0);
  const [joints, setJoints] = useState<string[]>(todayEntry?.joints ?? []);
  const [notes, setNotes] = useState<string>(todayEntry?.notes ?? '');

  useEffect(() => {
    if (todayEntry) {
      setPain(todayEntry.pain);
      setStiffness(todayEntry.stiffnessMin);
      setFatigue(todayEntry.fatigue);
      setJoints(todayEntry.joints ?? []);
      setNotes(todayEntry.notes ?? '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todayEntry?.id]);

  const onSave = () => {
    upsert.mutate({
      entryDate: todayStr,
      pain,
      stiffnessMin: stiffness,
      fatigue,
      joints,
      notes: notes.trim() || null,
    });
  };

  const toggleJoint = (j: string) => {
    setJoints((prev) => (prev.includes(j) ? prev.filter((x) => x !== j) : [...prev, j]));
  };

  const isUpdate = !!todayEntry;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: tokens.bg }}
      contentContainerStyle={{ padding: 16, paddingBottom: 100, gap: 16 }}
    >
      {/* Trend graph */}
      <View>
        <SectionTitle icon={<Activity color="#0D9488" size={16} />} title={t('diary_trend_30')} />
        <FlareGraph entries={entries} days={30} />
      </View>

      {/* Today's entry */}
      <View style={{ backgroundColor: tokens.card, borderRadius: 12, padding: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ color: tokens.text, fontWeight: '800', fontSize: 14 }}>{t('diary_today')}</Text>
          <Pressable
            onPress={onSave}
            disabled={upsert.isPending}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
              backgroundColor: '#0D9488',
              opacity: upsert.isPending ? 0.6 : 1,
            }}
          >
            <Save color="white" size={14} />
            <Text style={{ color: 'white', fontWeight: '700', fontSize: 13 }}>
              {upsert.isPending ? t('saving') : isUpdate ? t('update_entry') : t('save_entry')}
            </Text>
          </Pressable>
        </View>

        <VasBar label={t('pain_vas')} value={pain} max={10} onChange={setPain} color="#EF4444" />
        <VasBar label={t('morning_stiffness')} value={stiffness} max={120} unit="min" step={5} onChange={setStiffness} color="#F59E0B" />
        <VasBar label={t('fatigue')} value={fatigue} max={10} onChange={setFatigue} color="#3B82F6" />

        <Text style={{ color: tokens.text2, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginTop: 12, marginBottom: 6 }}>
          {t('joints_affected')}
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {JOINTS.map((j) => {
            const active = joints.includes(j);
            return (
              <Pressable
                key={j}
                onPress={() => toggleJoint(j)}
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 14,
                  backgroundColor: active ? '#0D9488' : tokens.card2,
                  borderWidth: 1,
                  borderColor: active ? '#0D9488' : tokens.border,
                }}
              >
                <Text style={{ color: active ? 'white' : tokens.text, fontSize: 12, fontWeight: '600' }}>{j}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={{ color: tokens.text2, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginTop: 12, marginBottom: 6 }}>
          {t('notes')}
        </Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          multiline
          placeholder={t('how_feeling')}
          placeholderTextColor={tokens.text2}
          style={{
            color: tokens.text,
            backgroundColor: tokens.input,
            borderRadius: 8,
            padding: 10,
            minHeight: 60,
            textAlignVertical: 'top',
            borderWidth: 1,
            borderColor: tokens.border,
          }}
        />
      </View>

      {/* Past entries */}
      {past.length > 0 ? (
        <View style={{ backgroundColor: tokens.card, borderRadius: 12, padding: 14 }}>
          <Text style={{ color: tokens.text, fontWeight: '800', fontSize: 14, marginBottom: 8 }}>
            {t('past')}
          </Text>
          {past.map((e) => (
            <View
              key={e.id}
              style={{ flexDirection: 'row', paddingVertical: 6, borderTopWidth: 1, borderTopColor: tokens.border, gap: 8 }}
            >
              <Text style={{ color: tokens.text2, fontSize: 12, width: 88 }}>{e.entryDate}</Text>
              <Text style={{ color: tokens.text, fontSize: 12, flex: 1 }}>
                Pain {e.pain}  ·  Stiff {e.stiffnessMin}m  ·  Fatigue {e.fatigue}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  const { tokens } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
      {icon}
      <Text style={{ color: tokens.text, fontWeight: '800', fontSize: 14 }}>{title}</Text>
    </View>
  );
}
