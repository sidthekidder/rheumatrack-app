import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Line, Path, Polyline, Text as SvgText } from 'react-native-svg';
import {
  ArrowLeft, BookOpen, Loader2, Plus, Trash2, TrendingUp,
} from 'lucide-react-native';
import { JOINTS } from '@/constants/joints';
import {
  useDeleteFlareEntry, useFlareEntries, useUpsertFlareEntry,
} from '@/lib/queries';
import type { FlareEntry } from '@/lib/api';
import { today } from '@/lib/schedule';
import { useTheme } from '@/lib/themeStore';

type Param = 'pain' | 'stiffness' | 'fatigue';

const vasClr = (v: number): string =>
  v <= 3 ? '#16A34A' : v <= 6 ? '#F59E0B' : '#EF4444';

export default function Diary() {
  const { tokens } = useTheme();
  const [showAdd, setShowAdd] = useState(false);
  const [gParam, setGParam] = useState<Param>('pain');

  const flaresQ = useFlareEntries();
  const del = useDeleteFlareEntry();

  const flares = flaresQ.data ?? [];
  const sorted = useMemo(
    () => [...flares].sort((a, b) => (a.entryDate < b.entryDate ? 1 : -1)),
    [flares],
  );

  const avg7 = (key: 'pain' | 'stiffnessMin' | 'fatigue'): number => {
    if (flares.length === 0) return 0;
    const slice = sorted.slice(0, 7);
    const sum = slice.reduce((s, f) => s + (f[key] ?? 0), 0);
    return Math.round((sum / slice.length) * 10) / 10;
  };

  return (
    <View style={{ flex: 1, backgroundColor: tokens.bg }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={{ padding: 13 }}>
          {flaresQ.isLoading ? (
            <View style={{ alignItems: 'center', padding: 30 }}>
              <ActivityIndicator color="#0D9488" />
            </View>
          ) : null}

          {flares.length >= 2 ? (
            <View style={{
              backgroundColor: tokens.card, borderRadius: 13, padding: 13,
              borderWidth: 2, borderColor: tokens.border, marginBottom: 12,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 9 }}>
                <TrendingUp size={15} color="#0D9488" />
                <Text style={{ fontWeight: '800', fontSize: 13, color: tokens.text }}>
                  Trend (last {Math.min(flares.length, 12)})
                </Text>
                <View style={{ marginLeft: 'auto', flexDirection: 'row', gap: 5 }}>
                  {(['pain', 'stiffness', 'fatigue'] as Param[]).map((p) => {
                    const cl = p === 'pain' ? '#EF4444' : p === 'stiffness' ? '#F59E0B' : '#8B5CF6';
                    const sel = gParam === p;
                    return (
                      <Pressable key={p} onPress={() => setGParam(p)}
                        accessibilityRole="button"
                        style={{
                          backgroundColor: sel ? cl : tokens.card2,
                          borderWidth: 2,
                          borderColor: sel ? cl : tokens.border,
                          borderRadius: 7,
                          paddingHorizontal: 8,
                          paddingVertical: 3,
                        }}>
                        <Text style={{
                          fontWeight: '700', fontSize: 11,
                          color: sel ? 'white' : tokens.text2,
                          textTransform: 'capitalize',
                        }}>{p}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
              <FlareGraph flares={flares} param={gParam} />
            </View>
          ) : null}

          {flares.length >= 2 ? (
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 13 }}>
              <AvgBox label="Avg Pain" val={`${avg7('pain')}`} cl="#EF4444" ic="💢" tokens={tokens} />
              <AvgBox label="Avg Stiff" val={`${avg7('stiffnessMin')} min`} cl="#F59E0B" ic="🦴" tokens={tokens} />
              <AvgBox label="Avg Fatigue" val={`${avg7('fatigue')}`} cl="#8B5CF6" ic="😴" tokens={tokens} />
            </View>
          ) : null}

          {flares.length === 0 && !flaresQ.isLoading ? (
            <View style={{ alignItems: 'center', padding: 40 }}>
              <Text style={{ fontSize: 46, marginBottom: 10 }}>📔</Text>
              <Text style={{ fontSize: 16, fontWeight: '800', color: tokens.text2, marginBottom: 6 }}>
                No diary entries yet
              </Text>
              <Text style={{ fontSize: 13, color: tokens.text2, textAlign: 'center', marginBottom: 14 }}>
                Log your daily symptoms to track disease activity over time
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => setShowAdd(true)}
                style={{
                  backgroundColor: '#0D9488', borderRadius: 12,
                  paddingHorizontal: 22, paddingVertical: 12,
                }}
              >
                <Text style={{ color: 'white', fontWeight: '800', fontSize: 14 }}>📝 Log Today</Text>
              </Pressable>
            </View>
          ) : null}

          {sorted.map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              tokens={tokens}
              onDelete={() => {
                Alert.alert('Delete entry?', `Remove ${entry.entryDate}?`, [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete', style: 'destructive',
                    onPress: () => del.mutate(entry.id),
                  },
                ]);
              }}
            />
          ))}

          <Pressable
            accessibilityRole="button"
            onPress={() => setShowAdd(true)}
            style={{
              backgroundColor: 'rgba(255,255,255,0.95)',
              borderRadius: 10,
              paddingVertical: 8,
              paddingHorizontal: 13,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
              alignSelf: 'flex-end',
              marginTop: 8,
            }}
          >
            <Plus size={15} color="#0D9488" />
            <Text style={{ color: '#0D9488', fontWeight: '900', fontSize: 13 }}>Log Today</Text>
          </Pressable>
        </View>
      </ScrollView>

      <Modal visible={showAdd} animationType="slide" presentationStyle="fullScreen"
        onRequestClose={() => setShowAdd(false)}>
        <AddFlareScreen onClose={() => setShowAdd(false)} />
      </Modal>
    </View>
  );
}

function AvgBox({
  label, val, cl, ic, tokens,
}: { label: string; val: string; cl: string; ic: string; tokens: ReturnType<typeof useTheme>['tokens'] }) {
  return (
    <View style={{
      flex: 1, backgroundColor: tokens.card, borderRadius: 11, padding: 10,
      borderWidth: 2, borderColor: tokens.border, alignItems: 'center',
    }}>
      <Text style={{ fontSize: 17, marginBottom: 3 }}>{ic}</Text>
      <Text style={{ fontWeight: '900', fontSize: 16, color: cl }}>{val}</Text>
      <Text style={{ fontSize: 9, color: tokens.text2, fontWeight: '700' }}>{label} (7d)</Text>
    </View>
  );
}

function EntryCard({
  entry, tokens, onDelete,
}: { entry: FlareEntry; tokens: ReturnType<typeof useTheme>['tokens']; onDelete: () => void }) {
  const joints = entry.joints ?? [];
  const params = [
    { lb: 'Pain', val: entry.pain, max: 10, cl: vasClr(entry.pain), unit: '/10' },
    { lb: 'Stiffness', val: entry.stiffnessMin, max: 120, cl: '#F59E0B', unit: ' min' },
    { lb: 'Fatigue', val: entry.fatigue, max: 10, cl: '#8B5CF6', unit: '/10' },
  ];
  return (
    <View style={{
      backgroundColor: tokens.card, borderRadius: 13, padding: 12, marginBottom: 8,
      borderWidth: 2, borderColor: tokens.border,
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: '900', fontSize: 14, color: tokens.text }}>{entry.entryDate}</Text>
          <Text style={{ fontSize: 11, color: tokens.text2, fontWeight: '600', marginTop: 1 }}>
            {joints.length === 0
              ? 'No joints marked'
              : joints.slice(0, 3).join(', ') + (joints.length > 3 ? ` +${joints.length - 3} more` : '')}
          </Text>
        </View>
        <Pressable accessibilityRole="button" onPress={onDelete}
          style={{ backgroundColor: '#FEE2E2', borderRadius: 7, padding: 6 }}>
          <Trash2 size={13} color="#DC2626" />
        </Pressable>
      </View>
      <View style={{ flexDirection: 'row', gap: 6 }}>
        {params.map((p) => (
          <View key={p.lb} style={{ flex: 1, backgroundColor: tokens.card2, borderRadius: 9, padding: 8 }}>
            <Text style={{ fontSize: 9, color: tokens.text2, fontWeight: '700', marginBottom: 3 }}>{p.lb}</Text>
            <Text style={{ fontWeight: '900', fontSize: 16, color: p.cl }}>
              {p.val}
              <Text style={{ fontSize: 10, fontWeight: '600', color: tokens.text2 }}>{p.unit}</Text>
            </Text>
            <View style={{ backgroundColor: tokens.border, borderRadius: 50, height: 3, marginTop: 4 }}>
              <View style={{
                width: `${Math.min(100, (p.val / p.max) * 100)}%`,
                height: '100%', backgroundColor: p.cl, borderRadius: 50,
              }} />
            </View>
          </View>
        ))}
      </View>
      {entry.notes ? (
        <Text style={{ marginTop: 7, fontSize: 11, color: tokens.text2, fontStyle: 'italic', lineHeight: 16 }}>
          &quot;{entry.notes}&quot;
        </Text>
      ) : null}
    </View>
  );
}

function FlareGraph({ flares, param }: { flares: FlareEntry[]; param: Param }) {
  const sorted = [...flares].sort((a, b) => (a.entryDate < b.entryDate ? -1 : 1)).slice(-12);
  if (sorted.length < 2) return null;
  const color = param === 'pain' ? '#EF4444' : param === 'stiffness' ? '#F59E0B' : '#8B5CF6';
  const maxV = param === 'stiffness' ? 120 : 10;
  const vals = sorted.map((f) => {
    if (param === 'pain') return f.pain;
    if (param === 'stiffness') return f.stiffnessMin;
    return f.fatigue;
  });
  const W = 320, H = 90, P = { t: 8, r: 10, b: 26, l: 28 };
  const gW = W - P.l - P.r;
  const gH = H - P.t - P.b;
  const sy = (v: number): number => P.t + gH - (v / maxV) * gH;
  const sx = (i: number): number =>
    P.l + (sorted.length === 1 ? gW / 2 : (i / (sorted.length - 1)) * gW);
  const fillPath =
    `M${sx(0)},${H - P.b} ` +
    vals.map((v, i) => `L${sx(i)},${sy(v)}`).join(' ') +
    ` L${sx(sorted.length - 1)},${H - P.b} Z`;
  const linePts = vals.map((v, i) => `${sx(i)},${sy(v)}`).join(' ');
  return (
    <Svg viewBox={`0 0 ${W} ${H}`} width="100%" height={120}>
      <Path d={fillPath} fill={color} fillOpacity={0.15} />
      <Polyline points={linePts} fill="none" stroke={color} strokeWidth={2.5}
        strokeLinecap="round" strokeLinejoin="round" />
      {vals.map((v, i) => (
        <Circle key={i} cx={sx(i)} cy={sy(v)} r={4} fill={color} stroke="white" strokeWidth={1.5} />
      ))}
      {sorted.map((f, i) => (
        <SvgText key={`l-${i}`} x={sx(i)} y={H - P.b + 11} fontSize={8} fill="#94A3B8" textAnchor="middle">
          {f.entryDate.slice(5)}
        </SvgText>
      ))}
      <Line x1={P.l} y1={P.t + gH} x2={P.l + gW} y2={P.t + gH} stroke="#E2E8F0" strokeWidth={1} />
    </Svg>
  );
}

// ─── Add Flare Screen ─────────────────────────────────────────

function AddFlareScreen({ onClose }: { onClose: () => void }) {
  const { tokens } = useTheme();
  const upsert = useUpsertFlareEntry();
  const [date, setDate] = useState(today());
  const [pain, setPain] = useState(0);
  const [stiffStep, setStiffStep] = useState(0); // 0..10 → minutes = step*12
  const [fatigue, setFatigue] = useState(0);
  const [joints, setJoints] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  const togJoint = (j: string) => {
    setJoints((p) => (p.includes(j) ? p.filter((x) => x !== j) : [...p, j]));
  };

  const handleSave = async () => {
    try {
      await upsert.mutateAsync({
        entryDate: date,
        pain,
        stiffnessMin: stiffStep * 12,
        fatigue,
        joints,
        notes: notes || null,
      });
      onClose();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Save failed';
      Alert.alert('Could not save', msg);
    }
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={{ flex: 1, backgroundColor: tokens.bg }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
        <LinearGradient
          colors={tokens.header.colors}
          start={tokens.header.start}
          end={tokens.header.end}
          style={{ paddingTop: 22, paddingHorizontal: 18, paddingBottom: 16 }}
        >
          <Pressable accessibilityRole="button" onPress={onClose}
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, padding: 6,
              alignSelf: 'flex-start', marginBottom: 8,
            }}>
            <ArrowLeft size={16} color="white" />
          </Pressable>
          <Text style={{ fontSize: 22, fontWeight: '900', color: 'white' }}>Log Symptoms</Text>
          <Text style={{ fontSize: 12, color: 'white', opacity: 0.85 }}>
            How are you feeling today?
          </Text>
        </LinearGradient>

        <View style={{ padding: 13 }}>
          <Lbl tokens={tokens}>Date</Lbl>
          <TextInput
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            style={inputStyle(tokens)}
            placeholderTextColor={tokens.text2}
          />

          <VasBar label="Pain (VAS)" val={pain} setVal={setPain} max={10}
            color={vasClr(pain)} unit="/10" low="0 — None" high="10 — Worst" tokens={tokens} />
          <VasBar label="Fatigue" val={fatigue} setVal={setFatigue} max={10}
            color="#8B5CF6" unit="/10" low="0 — None" high="10 — Worst" tokens={tokens} />

          <View style={{
            backgroundColor: tokens.card, borderRadius: 12, padding: 11,
            borderWidth: 2, borderColor: tokens.border, marginBottom: 10,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ fontWeight: '800', fontSize: 14, color: tokens.text }}>Morning Stiffness</Text>
              <Text style={{ fontWeight: '900', fontSize: 20, color: '#F59E0B' }}>
                {stiffStep * 12}
                <Text style={{ fontSize: 12, fontWeight: '600', color: tokens.text2 }}> min</Text>
              </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 3 }}>
              {Array.from({ length: 11 }, (_, i) => (
                <Pressable
                  key={i}
                  accessibilityRole="button"
                  onPress={() => setStiffStep(i)}
                  style={{
                    flex: 1, height: 22, borderRadius: 5,
                    backgroundColor: i <= stiffStep ? '#F59E0B' : tokens.card2,
                    opacity: i <= stiffStep ? 1 : 0.3,
                  }}
                />
              ))}
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 3 }}>
              <Text style={{ fontSize: 10, color: tokens.text2, fontWeight: '600' }}>0 min</Text>
              <Text style={{ fontSize: 10, color: tokens.text2, fontWeight: '600' }}>120 min</Text>
            </View>
          </View>

          <View style={{
            backgroundColor: tokens.card, borderRadius: 12, padding: 11,
            borderWidth: 2, borderColor: tokens.border, marginBottom: 10,
          }}>
            <Text style={{ fontWeight: '800', fontSize: 14, color: tokens.text, marginBottom: 8 }}>
              Swollen / Painful Joints
              {joints.length > 0 ? (
                <Text style={{ fontSize: 12, color: '#EF4444', fontWeight: '700' }}>
                  {'  '}{joints.length} marked
                </Text>
              ) : null}
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5 }}>
              {JOINTS.map((j) => {
                const sel = joints.includes(j);
                return (
                  <Pressable
                    key={j}
                    accessibilityRole="button"
                    onPress={() => togJoint(j)}
                    style={{
                      backgroundColor: sel ? '#EF4444' : tokens.card2,
                      borderWidth: 2,
                      borderColor: sel ? '#EF4444' : tokens.border,
                      borderRadius: 7,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                    }}>
                    <Text style={{
                      color: sel ? 'white' : tokens.text2,
                      fontWeight: '700', fontSize: 11,
                    }}>{j}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <Lbl tokens={tokens}>Notes (optional)</Lbl>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="How are you feeling overall? Any new symptoms?"
            placeholderTextColor={tokens.text2}
            multiline
            numberOfLines={3}
            style={[inputStyle(tokens), { minHeight: 70, textAlignVertical: 'top' }]}
          />

          <Pressable
            accessibilityRole="button"
            disabled={upsert.isPending}
            onPress={handleSave}
            style={{
              backgroundColor: '#0D9488', borderRadius: 12, padding: 13,
              alignItems: 'center', justifyContent: 'center',
              flexDirection: 'row', gap: 7,
            }}>
            {upsert.isPending ? <Loader2 size={16} color="white" /> : null}
            <Text style={{ color: 'white', fontWeight: '900', fontSize: 16 }}>
              📔 Save Diary Entry
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function VasBar({
  label, val, setVal, max, color, unit, low, high, tokens,
}: {
  label: string; val: number; setVal: (n: number) => void;
  max: number; color: string; unit: string; low: string; high: string;
  tokens: ReturnType<typeof useTheme>['tokens'];
}) {
  return (
    <View style={{
      backgroundColor: tokens.card, borderRadius: 12, padding: 12, marginBottom: 10,
      borderWidth: 2, borderColor: tokens.border,
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 }}>
        <Text style={{ fontWeight: '800', fontSize: 14, color: tokens.text }}>{label}</Text>
        <Text style={{ fontWeight: '900', fontSize: 22, color }}>
          {val}
          <Text style={{ fontSize: 12, fontWeight: '600', color: tokens.text2 }}>{unit}</Text>
        </Text>
      </View>
      <View style={{ flexDirection: 'row', gap: 3 }}>
        {Array.from({ length: max + 1 }, (_, i) => (
          <Pressable
            key={i}
            accessibilityRole="button"
            onPress={() => setVal(i)}
            style={{
              flex: 1, height: 24, borderRadius: 5,
              backgroundColor: i <= val ? color : tokens.card2,
              opacity: i <= val ? 1 : 0.3,
            }}
          />
        ))}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 3 }}>
        <Text style={{ fontSize: 10, color: tokens.text2, fontWeight: '600' }}>{low}</Text>
        <Text style={{ fontSize: 10, color: tokens.text2, fontWeight: '600' }}>{high}</Text>
      </View>
    </View>
  );
}

function Lbl({ children, tokens }: { children: React.ReactNode; tokens: ReturnType<typeof useTheme>['tokens'] }) {
  return (
    <Text style={{ fontWeight: '800', color: tokens.text2, fontSize: 13, marginBottom: 5 }}>
      {children}
    </Text>
  );
}

function inputStyle(tokens: ReturnType<typeof useTheme>['tokens']) {
  return {
    width: '100%' as const,
    borderWidth: 2,
    borderColor: tokens.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: '600' as const,
    backgroundColor: tokens.input,
    color: tokens.text,
    marginBottom: 12,
  };
}
