import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Activity, AlertTriangle, Check, ChevronDown, Clock, Dumbbell,
} from 'lucide-react-native';
import { DIET, type DietItem, type DiseaseTip } from '@/constants/diet';
import { EXERCISES, pickExerciseGroup } from '@/constants/exercises';
import { usePatient } from '@/lib/queries';
import { useTheme } from '@/lib/themeStore';

type Sub = 'eat' | 'avoid' | 'disease' | 'exercise';

const SUBS: ReadonlyArray<{ id: Sub; em: string; lb: string }> = [
  { id: 'eat', em: '🥗', lb: 'Eat' },
  { id: 'avoid', em: '🚫', lb: 'Avoid' },
  { id: 'disease', em: '🏥', lb: 'Disease' },
  { id: 'exercise', em: '💪', lb: 'Exercise' },
];

export default function WellnessScreen() {
  const { tokens } = useTheme();
  const [sub, setSub] = useState<Sub>('eat');

  const patientQ = usePatient();
  const diag = patientQ.data?.diagnosis ?? '';

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={{ flex: 1, backgroundColor: tokens.bg }}>
      <StatusBar style="light" />
      <LinearGradient
        colors={tokens.header.colors}
        start={tokens.header.start}
        end={tokens.header.end}
        style={{ paddingTop: 22, paddingHorizontal: 18, paddingBottom: 16 }}
      >
        <Text style={{ fontSize: 22, fontWeight: '900', color: 'white' }}>
          {sub === 'exercise' ? '💪 Exercise Guide' : '🥗 Diet & Wellness'}
        </Text>
        <Text style={{ fontSize: 13, color: 'white', opacity: 0.85, marginTop: 2 }}>
          {sub === 'exercise'
            ? 'Evidence-based for Rheumatology patients'
            : 'For Autoimmune & Inflammatory Conditions'}
        </Text>
      </LinearGradient>

      <View style={{
        flexDirection: 'row', backgroundColor: tokens.card,
        borderBottomWidth: 1, borderBottomColor: tokens.border,
      }}>
        {SUBS.map((s) => {
          const active = sub === s.id;
          return (
            <Pressable
              key={s.id} accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => setSub(s.id)}
              style={{
                flex: 1, paddingVertical: 9, alignItems: 'center', gap: 1,
                borderBottomWidth: 3,
                borderBottomColor: active ? '#0D9488' : 'transparent',
              }}>
              <Text style={{ fontSize: 14 }}>{s.em}</Text>
              <Text style={{
                fontSize: 11, fontWeight: '700',
                color: active ? '#0D9488' : tokens.text2,
              }}>{s.lb}</Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={{ padding: 13 }}>
          {sub === 'eat' ? <EatList items={DIET.eat} /> : null}
          {sub === 'avoid' ? <AvoidList items={DIET.avoid} /> : null}
          {sub === 'disease' ? <DiseaseList items={DIET.diseases} /> : null}
          {sub === 'exercise' ? <ExerciseSection diag={diag} /> : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function EatList({ items }: { items: DietItem[] }) {
  const { tokens } = useTheme();
  const [open, setOpen] = useState<number | null>(null);
  return (
    <>
      <View style={{
        backgroundColor: tokens.card, borderRadius: 11, padding: 11, marginBottom: 10,
        borderWidth: 2, borderColor: '#86EFAC',
      }}>
        <Text style={{ fontWeight: '800', color: '#16A34A', fontSize: 12, marginBottom: 2 }}>
          🌿 Anti-Inflammatory Principles
        </Text>
        <Text style={{ fontSize: 11, color: tokens.text2, lineHeight: 16 }}>
          Whole colourful foods, good oils, turmeric and ginger daily.
        </Text>
      </View>
      {items.map((item, i) => (
        <Expandable
          key={i} icon={item.icon} name={item.name}
          isOpen={open === i} onToggle={() => setOpen(open === i ? null : i)}
        >
          <Text style={{ fontSize: 12, color: tokens.text2, lineHeight: 18, fontWeight: '600' }}>
            {item.detail}
          </Text>
        </Expandable>
      ))}
    </>
  );
}

function AvoidList({ items }: { items: DietItem[] }) {
  const { tokens } = useTheme();
  const [open, setOpen] = useState<number | null>(null);
  return (
    <>
      <View style={{
        backgroundColor: tokens.card, borderRadius: 11, padding: 11, marginBottom: 10,
        borderWidth: 2, borderColor: '#FCA5A5',
      }}>
        <Text style={{ fontWeight: '800', color: '#EF4444', fontSize: 12, marginBottom: 2 }}>
          ⚠️ Critical Warning
        </Text>
        <Text style={{ fontSize: 11, color: tokens.text2, lineHeight: 16 }}>
          Alcohol is ABSOLUTELY contraindicated on Methotrexate, Leflunomide and JAK inhibitors.
        </Text>
      </View>
      {items.map((item, i) => (
        <Expandable
          key={i} icon={item.icon} name={item.name}
          isOpen={open === i} onToggle={() => setOpen(open === i ? null : i)}
        >
          <Text style={{ fontSize: 12, color: tokens.text2, lineHeight: 18, fontWeight: '600' }}>
            {item.detail}
          </Text>
        </Expandable>
      ))}
    </>
  );
}

function DiseaseList({ items }: { items: DiseaseTip[] }) {
  const { tokens } = useTheme();
  const [open, setOpen] = useState<number | null>(null);
  return (
    <>
      <View style={{
        backgroundColor: tokens.card2, borderRadius: 11, padding: 11, marginBottom: 10,
        borderWidth: 2, borderColor: tokens.border,
      }}>
        <Text style={{ fontWeight: '800', color: tokens.text, fontSize: 12, marginBottom: 2 }}>
          🏥 Condition-Specific Diet
        </Text>
        <Text style={{ fontSize: 11, color: tokens.text2, lineHeight: 16 }}>
          Tap your condition. Always follow your doctor&apos;s advice.
        </Text>
      </View>
      {items.map((d, i) => {
        const isOpen = open === i;
        return (
          <View key={i} style={{
            backgroundColor: tokens.card, borderRadius: 12, marginBottom: 7,
            borderWidth: 2, borderColor: isOpen ? d.border : tokens.border,
            borderLeftWidth: 5, borderLeftColor: d.border, overflow: 'hidden',
          }}>
            <Pressable
              accessibilityRole="button" accessibilityState={{ expanded: isOpen }}
              onPress={() => setOpen(isOpen ? null : i)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12 }}>
              <Text style={{ fontSize: 20 }}>{d.icon}</Text>
              <Text style={{ flex: 1, fontWeight: '800', fontSize: 13, color: tokens.text }}>
                {d.disease}
              </Text>
              <ChevronDown
                size={15}
                color={tokens.text2}
                style={{ transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }}
              />
            </Pressable>
            {isOpen ? (
              <View style={{ padding: 12, borderTopWidth: 1, borderTopColor: tokens.border }}>
                {d.tips.map((tip, j) => (
                  <View key={j} style={{
                    flexDirection: 'row', gap: 7, marginBottom: 6, alignItems: 'flex-start',
                  }}>
                    <View style={{
                      width: 17, height: 17, borderRadius: 50, backgroundColor: d.border,
                      alignItems: 'center', justifyContent: 'center', marginTop: 1,
                    }}>
                      <Check size={10} color="white" />
                    </View>
                    <Text style={{
                      flex: 1, fontSize: 12, color: tokens.text, lineHeight: 18, fontWeight: '600',
                    }}>{tip}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        );
      })}
    </>
  );
}

function ExerciseSection({ diag }: { diag: string }) {
  const { tokens } = useTheme();
  const initial = useMemo(() => pickExerciseGroup(diag), [diag]);
  const [selEx, setSelEx] = useState(initial);
  const [openEx, setOpenEx] = useState<number | null>(null);
  const ex = EXERCISES[selEx];

  return (
    <>
      {diag ? (
        <View style={{
          backgroundColor: tokens.card, borderRadius: 10, padding: 10, marginBottom: 10,
          borderWidth: 2, borderColor: '#0D9488',
          flexDirection: 'row', alignItems: 'center', gap: 6,
        }}>
          <Activity size={13} color="#0D9488" />
          <Text style={{ fontSize: 12, fontWeight: '700', color: '#0D9488' }}>
            Showing for: {diag}
          </Text>
        </View>
      ) : null}
      <Text style={{ fontWeight: '700', color: tokens.text2, fontSize: 11, marginBottom: 7 }}>
        Select condition:
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 5, paddingBottom: 7 }}
        style={{ marginBottom: 12 }}>
        {EXERCISES.map((e, i) => {
          const sel = selEx === i;
          return (
            <Pressable
              key={i} accessibilityRole="button"
              onPress={() => { setSelEx(i); setOpenEx(null); }}
              style={{
                backgroundColor: sel ? e.ac : tokens.card2,
                borderWidth: 2, borderColor: sel ? e.ac : tokens.border,
                borderRadius: 50, paddingHorizontal: 11, paddingVertical: 5,
                flexDirection: 'row', alignItems: 'center', gap: 4,
              }}>
              <Text style={{ fontSize: 13 }}>{e.ic}</Text>
              <Text style={{
                fontSize: 11, fontWeight: '700',
                color: sel ? 'white' : tokens.text2,
              }}>{e.con.split(' ')[0]}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={{
        backgroundColor: ex.ac, borderRadius: 12, padding: 12, marginBottom: 10,
        flexDirection: 'row', alignItems: 'center', gap: 9,
      }}>
        <Text style={{ fontSize: 26 }}>{ex.ic}</Text>
        <View>
          <Text style={{ fontWeight: '900', fontSize: 15, color: 'white' }}>{ex.con}</Text>
          <Text style={{ fontSize: 11, color: 'white', opacity: 0.85, marginTop: 1 }}>
            {ex.list.length} exercises
          </Text>
        </View>
      </View>

      <View style={{
        backgroundColor: tokens.card2, borderRadius: 9, padding: 9, marginBottom: 10,
        borderWidth: 1, borderColor: ex.ac,
        flexDirection: 'row', gap: 6,
      }}>
        <AlertTriangle size={12} color={ex.ac} />
        <Text style={{ flex: 1, fontSize: 11, color: tokens.text2, fontWeight: '600', lineHeight: 16 }}>
          {ex.warn}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 7, marginBottom: 12 }}>
        <View style={{
          flex: 1, backgroundColor: tokens.card2, borderRadius: 9, padding: 9,
          borderWidth: 1, borderColor: tokens.border,
        }}>
          <Text style={{ fontWeight: '800', color: '#16A34A', fontSize: 11, marginBottom: 5 }}>
            ✅ Do
          </Text>
          {ex.dos.map((d, i) => (
            <Text key={i} style={{ fontSize: 10, color: tokens.text2, fontWeight: '600', lineHeight: 16, marginBottom: 2 }}>
              • {d}
            </Text>
          ))}
        </View>
        <View style={{
          flex: 1, backgroundColor: tokens.card2, borderRadius: 9, padding: 9,
          borderWidth: 1, borderColor: tokens.border,
        }}>
          <Text style={{ fontWeight: '800', color: '#EF4444', fontSize: 11, marginBottom: 5 }}>
            ❌ Don&apos;t
          </Text>
          {ex.donts.map((d, i) => (
            <Text key={i} style={{ fontSize: 10, color: tokens.text2, fontWeight: '600', lineHeight: 16, marginBottom: 2 }}>
              • {d}
            </Text>
          ))}
        </View>
      </View>

      <Text style={{
        fontWeight: '800', color: tokens.text2, fontSize: 10, marginBottom: 8,
        textTransform: 'uppercase', letterSpacing: 0.5,
      }}>Exercises</Text>
      {ex.list.map((e, j) => {
        const isOpen = openEx === j;
        return (
          <View key={j} style={{
            backgroundColor: tokens.card, borderRadius: 10, marginBottom: 6,
            borderWidth: 2, borderColor: isOpen ? ex.ac : tokens.border, overflow: 'hidden',
          }}>
            <Pressable
              accessibilityRole="button" accessibilityState={{ expanded: isOpen }}
              onPress={() => setOpenEx(isOpen ? null : j)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 7, padding: 11 }}>
              <Dumbbell size={13} color={ex.ac} />
              <Text style={{ flex: 1, fontWeight: '800', fontSize: 13, color: tokens.text }}>{e.n}</Text>
              <Text style={{
                fontSize: 10, fontWeight: '800', color: 'white',
                backgroundColor: e.l === 'Easy' ? '#16A34A' : e.l === 'Medium' ? '#F59E0B' : '#EF4444',
                borderRadius: 5, paddingHorizontal: 6, paddingVertical: 1, marginRight: 4,
              }}>{e.l}</Text>
              <ChevronDown
                size={13} color={tokens.text2}
                style={{ transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }}
              />
            </Pressable>
            {isOpen ? (
              <View style={{ padding: 11, borderTopWidth: 1, borderTopColor: tokens.border }}>
                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 6 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                    <Clock size={11} color={tokens.text2} />
                    <Text style={{ fontSize: 11, color: tokens.text2, fontWeight: '700' }}>{e.d}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                    <Activity size={11} color={tokens.text2} />
                    <Text style={{ fontSize: 11, color: tokens.text2, fontWeight: '700' }}>{e.s}</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 12, color: tokens.text2, lineHeight: 18, fontWeight: '600' }}>
                  {e.desc}
                </Text>
              </View>
            ) : null}
          </View>
        );
      })}
    </>
  );
}

function Expandable({
  icon, name, isOpen, onToggle, children,
}: {
  icon: string; name: string; isOpen: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  const { tokens } = useTheme();
  return (
    <View style={{
      backgroundColor: tokens.card, borderRadius: 10, marginBottom: 5,
      borderWidth: 2, borderColor: tokens.border, overflow: 'hidden',
    }}>
      <Pressable
        accessibilityRole="button" accessibilityState={{ expanded: isOpen }}
        onPress={onToggle}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 11 }}>
        <Text style={{ fontSize: 18 }}>{icon}</Text>
        <Text style={{ flex: 1, fontWeight: '700', fontSize: 13, color: tokens.text }}>{name}</Text>
        <ChevronDown
          size={14} color={tokens.text2}
          style={{ transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }}
        />
      </Pressable>
      {isOpen ? (
        <View style={{
          paddingHorizontal: 11, paddingBottom: 10, paddingTop: 6,
          borderTopWidth: 1, borderTopColor: tokens.border,
        }}>
          {children}
        </View>
      ) : null}
    </View>
  );
}
