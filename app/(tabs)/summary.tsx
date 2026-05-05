import { useMemo, useState } from 'react';
import {
  ActivityIndicator, Alert, Linking, Modal, Pressable, ScrollView, Text, TextInput, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle as SvgCircle } from 'react-native-svg';
import {
  ArrowLeft, CheckCircle, ChevronDown, LayoutDashboard, Loader2, Plus, Share2,
  Stethoscope, Trash2,
} from 'lucide-react-native';
import { APPT_TYPES } from '@/constants/appointments';
import { LAB_TESTS, flagBg, flagClr, flagLbl, flagVal } from '@/constants/labs';
import {
  useAppointments, useCreateAppointment, useDeleteAppointment, useLabReports,
  useMedicationLog, useMedicines, usePatchAppointment, usePatient,
} from '@/lib/queries';
import type { Appointment, MedicationLogEntry } from '@/lib/api';
import { TS_DATA } from '@/constants/slots';
import { getMedsForDate, today, waPhone } from '@/lib/schedule';
import { useTheme } from '@/lib/themeStore';

type Sub = 'card' | 'appts';

const SUBS: ReadonlyArray<{ id: Sub; em: string; lb: string }> = [
  { id: 'card', em: '🏥', lb: 'Health Card' },
  { id: 'appts', em: '📅', lb: 'Appointments' },
];

export default function SummaryScreen() {
  const { tokens } = useTheme();
  const [sub, setSub] = useState<Sub>('card');

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={{ flex: 1, backgroundColor: tokens.bg }}>
      <StatusBar style="light" />
      <LinearGradient
        colors={tokens.header.colors}
        start={tokens.header.start}
        end={tokens.header.end}
        style={{ paddingTop: 22, paddingHorizontal: 18, paddingBottom: 16 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 11 }}>
          <LayoutDashboard size={22} color="white" />
          <Text style={{ fontSize: 22, fontWeight: '900', color: 'white' }}>Summary</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 7 }}>
          {SUBS.map((s) => {
            const active = sub === s.id;
            return (
              <Pressable
                key={s.id}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => setSub(s.id)}
                style={{
                  flex: 1, paddingVertical: 9, borderRadius: 10,
                  backgroundColor: active ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)',
                  flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5,
                }}>
                <Text style={{ fontSize: 14 }}>{s.em}</Text>
                <Text style={{ color: 'white', fontWeight: '800', fontSize: 13 }}>{s.lb}</Text>
              </Pressable>
            );
          })}
        </View>
      </LinearGradient>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
        {sub === 'card' ? <HealthCard /> : null}
        {sub === 'appts' ? <ApptsList /> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Health Card ─────────────────────────────────────────

function HealthCard() {
  const { tokens } = useTheme();
  const todayStr = useMemo(() => today(), []);

  const patientQ = usePatient();
  const medsQ = useMedicines();
  const labsQ = useLabReports();
  const logQ = useMedicationLog(todayStr, todayStr);

  const patient = patientQ.data ?? null;
  const meds = medsQ.data ?? [];
  const labs = labsQ.data ?? [];

  const log = useMemo<Record<string, boolean>>(() => {
    const out: Record<string, boolean> = {};
    for (const e of (logQ.data ?? []) as MedicationLogEntry[]) {
      out[`${e.logDate}_${e.medicineId}_${e.slot}`] = e.taken;
    }
    return out;
  }, [logQ.data]);

  const todayMeds = useMemo(
    () => getMedsForDate(meds, todayStr),
    [meds, todayStr],
  );

  const { due, taken } = useMemo(() => {
    let d = 0, t = 0;
    for (const m of todayMeds) {
      for (const slot of TS_DATA) {
        const qty = m.dosesToday[slot.id] ?? 0;
        if (qty > 0) {
          d++;
          if (log[`${todayStr}_${m.id}_${slot.id}`]) t++;
        }
      }
    }
    return { due: d, taken: t };
  }, [todayMeds, log, todayStr]);

  const pct = due > 0 ? Math.round((taken / due) * 100) : 0;
  const ringColor = pct >= 80 ? '#16A34A' : pct >= 50 ? '#F59E0B' : '#EF4444';

  const latest = useMemo(() => {
    const out: Record<string, { v: string; date: string }> = {};
    [...labs]
      .sort((a, b) => (a.reportDate < b.reportDate ? -1 : 1))
      .forEach((e) => e.results.forEach((r) => { out[r.testId] = { v: r.value, date: e.reportDate }; }));
    return out;
  }, [labs]);

  const abnormal = useMemo(
    () => LAB_TESTS.filter((t) => {
      const lv = latest[t.id];
      if (!lv) return false;
      const f = flagVal(t, lv.v);
      return f === 'low' || f === 'high';
    }).slice(0, 5),
    [latest],
  );

  const initials = (patient?.name || '?')
    .split(' ').map((n) => n[0] || '').join('').slice(0, 2).toUpperCase();

  const shareCard = () => {
    const lines = [
      '🏥 RheumaTrack Health Card',
      '━━━━━━━━━━━━━━━━━',
      `Patient: ${patient?.name || '—'}${patient?.patientId ? ` | ID: ${patient.patientId}` : ''}`,
      [patient?.age && `Age: ${patient.age}`, patient?.city].filter(Boolean).join(' | '),
      patient?.diagnosis ? `Diagnosis: ${patient.diagnosis}` : '',
      '━━━━━━━━━━━━━━━━━',
      `💊 Current Medicines (${todayMeds.length}):`,
      ...todayMeds.slice(0, 8).map((m) => `• ${m.drugName} ${m.dose}`),
      todayMeds.length > 8 ? `• +${todayMeds.length - 8} more` : '',
      '━━━━━━━━━━━━━━━━━',
      `📊 Today's Compliance: ${pct}% (${taken}/${due} doses)`,
      abnormal.length
        ? `⚠️ Abnormal Labs: ${abnormal.map((t) => `${t.name} ${latest[t.id].v}${t.unit ? ` ${t.unit}` : ''}`).join(', ')}`
        : '',
      patient?.doctorName ? `\n👨‍⚕️ Dr. ${patient.doctorName} (${patient.doctorSpecialty || 'Doctor'})` : '',
      `\nGenerated ${todayStr} via RheumaTrack`,
    ].filter(Boolean).join('\n');

    const msg = encodeURIComponent(lines);
    const url = patient?.doctorPhone
      ? `https://wa.me/${waPhone(patient.doctorPhone)}?text=${msg}`
      : `https://wa.me/?text=${msg}`;
    Linking.openURL(url).catch(() => undefined);
  };

  if (patientQ.isLoading || medsQ.isLoading) {
    return (
      <View style={{ alignItems: 'center', padding: 30 }}>
        <ActivityIndicator color="#0D9488" />
      </View>
    );
  }

  return (
    <View style={{ padding: 13 }}>
      <View style={{
        backgroundColor: tokens.card, borderRadius: 15,
        borderWidth: 2, borderColor: tokens.border, overflow: 'hidden', marginBottom: 12,
      }}>
        <LinearGradient
          colors={tokens.header.colors}
          start={tokens.header.start}
          end={tokens.header.end}
          style={{ paddingHorizontal: 15, paddingVertical: 14 }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11 }}>
            <View style={{
              width: 50, height: 50, borderRadius: 12,
              backgroundColor: 'rgba(255,255,255,0.25)',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Text style={{ fontSize: 20, fontWeight: '900', color: 'white' }}>{initials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: 'white', fontWeight: '900', fontSize: 17 }}>
                {patient?.name || 'Patient'}
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '600', marginTop: 2 }}>
                {[
                  patient?.age && `Age ${patient.age}`,
                  patient?.patientId && `ID: ${patient.patientId}`,
                  patient?.city,
                ].filter(Boolean).join(' · ') || '—'}
              </Text>
            </View>
          </View>
          {patient?.diagnosis ? (
            <View style={{
              marginTop: 9, backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, alignSelf: 'flex-start',
            }}>
              <Text style={{ color: 'white', fontWeight: '800', fontSize: 12 }}>
                🔬 {patient.diagnosis}
              </Text>
            </View>
          ) : null}
        </LinearGradient>

        <View style={{
          padding: 13, borderBottomWidth: 1, borderBottomColor: tokens.border,
          flexDirection: 'row', alignItems: 'center', gap: 12,
        }}>
          <View style={{ width: 58, height: 58 }}>
            <Svg width={58} height={58} viewBox="0 0 58 58">
              <SvgCircle cx={29} cy={29} r={24} fill="none" stroke={tokens.border} strokeWidth={5} />
              <SvgCircle
                cx={29} cy={29} r={24} fill="none" stroke={ringColor} strokeWidth={5}
                strokeDasharray={`${(pct / 100) * 150.8} 150.8`} strokeLinecap="round"
                transform="rotate(-90 29 29)"
              />
            </Svg>
            <View style={{
              position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center',
            }}>
              <Text style={{ fontWeight: '900', fontSize: 13, color: tokens.text }}>{pct}%</Text>
            </View>
          </View>
          <View>
            <Text style={{ fontWeight: '800', fontSize: 13, color: tokens.text }}>
              Today&apos;s Compliance
            </Text>
            <Text style={{ fontSize: 11, color: tokens.text2, fontWeight: '600', marginTop: 1 }}>
              {taken} of {due} doses taken
            </Text>
            <Text style={{ fontSize: 10, color: tokens.text2, marginTop: 2 }}>
              {todayMeds.length} medicine{todayMeds.length !== 1 ? 's' : ''} scheduled
            </Text>
          </View>
        </View>

        <View style={{ padding: 13, borderBottomWidth: 1, borderBottomColor: tokens.border }}>
          <Text style={{
            fontWeight: '800', fontSize: 10, color: tokens.text2, marginBottom: 7,
            textTransform: 'uppercase', letterSpacing: 0.4,
          }}>Current Medicines ({todayMeds.length})</Text>
          {todayMeds.length === 0 ? (
            <Text style={{ fontSize: 12, color: tokens.text2, fontWeight: '600' }}>
              No medicines scheduled today
            </Text>
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
              {todayMeds.map((m) => (
                <View key={m.id} style={{
                  backgroundColor: m.color || '#D1FAE5',
                  borderRadius: 7, paddingHorizontal: 8, paddingVertical: 3,
                  borderWidth: 1, borderColor: 'rgba(0,0,0,0.07)',
                }}>
                  <Text style={{ fontWeight: '800', fontSize: 11, color: '#1E293B' }}>
                    {m.drugName}
                    <Text style={{ fontWeight: '600', fontSize: 10, color: '#334155' }}> {m.dose}</Text>
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {abnormal.length > 0 ? (
          <View style={{ padding: 13, borderBottomWidth: 1, borderBottomColor: tokens.border }}>
            <Text style={{
              fontWeight: '800', fontSize: 10, color: tokens.text2, marginBottom: 7,
              textTransform: 'uppercase', letterSpacing: 0.4,
            }}>⚠️ Abnormal Labs</Text>
            {abnormal.map((t) => {
              const lv = latest[t.id];
              const f = flagVal(t, lv.v);
              return (
                <View key={t.id} style={{
                  flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4,
                }}>
                  <Text style={{ flex: 1, fontWeight: '700', fontSize: 12, color: tokens.text }}>
                    {t.name}
                  </Text>
                  <Text style={{ fontWeight: '900', fontSize: 13, color: flagClr(f) }}>
                    {lv.v}{t.unit ? ` ${t.unit}` : ''}
                  </Text>
                  <View style={{
                    backgroundColor: flagBg(f), borderWidth: 1, borderColor: flagClr(f),
                    borderRadius: 5, paddingHorizontal: 6, paddingVertical: 1,
                  }}>
                    <Text style={{ fontSize: 10, fontWeight: '800', color: flagClr(f) }}>
                      {flagLbl(f)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        ) : null}

        {patient?.doctorName ? (
          <View style={{
            padding: 12, flexDirection: 'row', alignItems: 'center', gap: 8,
          }}>
            <Stethoscope size={15} color="#0D9488" />
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '800', fontSize: 12, color: tokens.text }}>
                {patient.doctorName}
              </Text>
              <Text style={{ fontSize: 10, color: tokens.text2, fontWeight: '600' }}>
                {patient.doctorSpecialty}
                {patient.doctorHospital ? ` · ${patient.doctorHospital}` : ''}
              </Text>
            </View>
          </View>
        ) : null}
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={shareCard}
        style={{
          backgroundColor: '#25D366', borderRadius: 12, padding: 13,
          flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
          marginBottom: 10,
        }}>
        <Share2 size={18} color="white" />
        <Text style={{ color: 'white', fontWeight: '900', fontSize: 15 }}>
          Share Health Card via WhatsApp
        </Text>
      </Pressable>
      <Text style={{ fontSize: 11, color: tokens.text2, textAlign: 'center', fontWeight: '600' }}>
        Sends name, medicines, compliance and abnormal labs — no typing needed
      </Text>
    </View>
  );
}

// ─── Appointments ─────────────────────────────────────────

function ApptsList() {
  const { tokens } = useTheme();
  const [showAdd, setShowAdd] = useState(false);

  const apptQ = useAppointments();
  const patch = usePatchAppointment();
  const del = useDeleteAppointment();

  const appts = apptQ.data ?? [];
  const todayStr = today();

  const upcoming = useMemo(
    () => appts.filter((a) => a.appointmentDate >= todayStr && !a.completed)
      .sort((a, b) => (a.appointmentDate > b.appointmentDate ? 1 : -1)),
    [appts, todayStr],
  );
  const past = useMemo(
    () => appts.filter((a) => a.appointmentDate < todayStr || a.completed)
      .sort((a, b) => (a.appointmentDate < b.appointmentDate ? 1 : -1)),
    [appts, todayStr],
  );

  return (
    <View style={{ padding: 13 }}>
      <Pressable
        accessibilityRole="button"
        onPress={() => setShowAdd(true)}
        style={{
          backgroundColor: '#0D9488', borderRadius: 11, padding: 12,
          flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
          marginBottom: 14,
        }}>
        <Plus size={16} color="white" />
        <Text style={{ color: 'white', fontWeight: '900', fontSize: 14 }}>Book Appointment</Text>
      </Pressable>

      {apptQ.isLoading ? (
        <View style={{ alignItems: 'center', padding: 30 }}>
          <ActivityIndicator color="#0D9488" />
        </View>
      ) : null}

      {appts.length === 0 && !apptQ.isLoading ? (
        <View style={{ alignItems: 'center', padding: 30 }}>
          <Text style={{ fontSize: 46, marginBottom: 10 }}>📅</Text>
          <Text style={{ fontSize: 16, fontWeight: '800', color: tokens.text2, marginBottom: 6 }}>
            No appointments
          </Text>
          <Text style={{ fontSize: 13, color: tokens.text2, textAlign: 'center' }}>
            Add upcoming doctor visits to track what was discussed
          </Text>
        </View>
      ) : null}

      {upcoming.length > 0 ? (
        <>
          <Text style={{
            fontWeight: '800', color: tokens.text2, fontSize: 10, marginBottom: 8,
            textTransform: 'uppercase', letterSpacing: 0.4,
          }}>Upcoming</Text>
          {upcoming.map((a) => (
            <ApptCard key={a.id} a={a} onMarkDone={(notes) => {
              patch.mutate({ id: a.id, body: { completed: true, postNotes: notes } });
            }} onDelete={() => {
              Alert.alert('Delete appointment?', '', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => del.mutate(a.id) },
              ]);
            }} />
          ))}
        </>
      ) : null}

      {past.length > 0 ? (
        <>
          <Text style={{
            fontWeight: '800', color: tokens.text2, fontSize: 10, marginBottom: 8, marginTop: 8,
            textTransform: 'uppercase', letterSpacing: 0.4,
          }}>Past</Text>
          {past.map((a) => (
            <ApptCard key={a.id} a={a} onMarkDone={(notes) => {
              patch.mutate({ id: a.id, body: { completed: true, postNotes: notes } });
            }} onDelete={() => {
              Alert.alert('Delete appointment?', '', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => del.mutate(a.id) },
              ]);
            }} />
          ))}
        </>
      ) : null}

      <Modal visible={showAdd} animationType="slide" presentationStyle="fullScreen"
        onRequestClose={() => setShowAdd(false)}>
        <AddApptScreen onClose={() => setShowAdd(false)} />
      </Modal>
    </View>
  );
}

function ApptCard({
  a, onMarkDone, onDelete,
}: { a: Appointment; onMarkDone: (notes: string) => void; onDelete: () => void }) {
  const { tokens } = useTheme();
  const [exp, setExp] = useState(false);
  const [editing, setEditing] = useState(false);
  const [postTxt, setPostTxt] = useState(a.postNotes ?? '');

  return (
    <View style={{
      backgroundColor: tokens.card, borderRadius: 12, marginBottom: 8,
      borderWidth: 2, borderColor: a.completed ? '#86EFAC' : tokens.border, overflow: 'hidden',
    }}>
      <Pressable
        accessibilityRole="button"
        onPress={() => setExp(!exp)}
        style={{ padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View style={{
          width: 44, height: 44, borderRadius: 10,
          backgroundColor: a.completed ? '#F0FDF4' : '#0D9488',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Text style={{
            fontSize: 12, fontWeight: '900',
            color: a.completed ? '#16A34A' : 'white',
          }}>{a.appointmentDate.slice(8)}</Text>
          <Text style={{
            fontSize: 9, fontWeight: '700',
            color: a.completed ? '#16A34A' : 'rgba(255,255,255,0.85)',
          }}>{a.appointmentDate.slice(5, 7)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <Text style={{ fontWeight: '800', fontSize: 13, color: tokens.text }}>{a.visitType}</Text>
            {a.completed ? <CheckCircle size={13} color="#16A34A" /> : null}
          </View>
          <Text style={{ fontSize: 11, color: tokens.text2, fontWeight: '600', marginTop: 1 }}>
            {a.doctorName}{a.appointmentTime ? ` · ${a.appointmentTime}` : ''}
          </Text>
        </View>
        <ChevronDown
          size={14} color={tokens.text2}
          style={{ transform: [{ rotate: exp ? '180deg' : '0deg' }] }}
        />
      </Pressable>
      {exp ? (
        <View style={{
          borderTopWidth: 1, borderTopColor: tokens.border, padding: 11, backgroundColor: tokens.card2,
        }}>
          {a.preNotes ? (
            <View style={{ marginBottom: 8 }}>
              <Text style={{ fontWeight: '800', fontSize: 11, color: tokens.text2, marginBottom: 3 }}>
                Questions to ask:
              </Text>
              <Text style={{ fontSize: 12, color: tokens.text, lineHeight: 18 }}>{a.preNotes}</Text>
            </View>
          ) : null}
          {a.postNotes ? (
            <View style={{ marginBottom: 8 }}>
              <Text style={{ fontWeight: '800', fontSize: 11, color: '#16A34A', marginBottom: 3 }}>
                ✅ Visit notes:
              </Text>
              <Text style={{ fontSize: 12, color: tokens.text, lineHeight: 18 }}>{a.postNotes}</Text>
            </View>
          ) : null}

          {!a.completed && editing ? (
            <View>
              <Text style={{ fontWeight: '700', fontSize: 11, color: tokens.text2, marginBottom: 5 }}>
                Add visit notes:
              </Text>
              <TextInput
                value={postTxt} onChangeText={setPostTxt}
                placeholder="What was discussed? Any medicine changes?"
                placeholderTextColor={tokens.text2}
                multiline
                style={{
                  borderWidth: 2, borderColor: tokens.border, borderRadius: 9,
                  padding: 9, fontSize: 12, color: tokens.text,
                  backgroundColor: tokens.input, minHeight: 60, textAlignVertical: 'top', marginBottom: 8,
                }}
              />
              <View style={{ flexDirection: 'row', gap: 7 }}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => { setEditing(false); setPostTxt(a.postNotes ?? ''); }}
                  style={{
                    flex: 1, backgroundColor: tokens.card, borderWidth: 2, borderColor: tokens.border,
                    borderRadius: 9, padding: 9, alignItems: 'center',
                  }}>
                  <Text style={{ fontWeight: '700', fontSize: 12, color: tokens.text2 }}>Cancel</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => { onMarkDone(postTxt); setEditing(false); }}
                  style={{
                    flex: 2, backgroundColor: '#16A34A', borderRadius: 9, padding: 9, alignItems: 'center',
                  }}>
                  <Text style={{ fontWeight: '800', fontSize: 12, color: 'white' }}>
                    ✅ Mark Complete
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : null}

          {!a.completed && !editing ? (
            <View style={{ flexDirection: 'row', gap: 7 }}>
              <Pressable
                accessibilityRole="button"
                onPress={() => setEditing(true)}
                style={{
                  flex: 2, backgroundColor: '#0D9488', borderRadius: 9, padding: 9, alignItems: 'center',
                }}>
                <Text style={{ fontWeight: '700', fontSize: 12, color: 'white' }}>
                  ✅ Mark Completed
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={onDelete}
                style={{
                  flex: 1, backgroundColor: '#FEE2E2', borderRadius: 9, padding: 9,
                  alignItems: 'center', justifyContent: 'center',
                }}>
                <Trash2 size={13} color="#DC2626" />
              </Pressable>
            </View>
          ) : null}

          {a.completed ? (
            <Pressable
              accessibilityRole="button"
              onPress={onDelete}
              style={{
                backgroundColor: '#FEE2E2', borderRadius: 8, padding: 7,
                flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start',
              }}>
              <Trash2 size={12} color="#DC2626" />
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#DC2626' }}>Delete</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

function AddApptScreen({ onClose }: { onClose: () => void }) {
  const { tokens } = useTheme();
  const create = useCreateAppointment();
  const patientQ = usePatient();
  const doc = patientQ.data;

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [docName, setDocName] = useState(doc?.doctorName ?? '');
  const [clinic, setClinic] = useState(doc?.doctorHospital ?? '');
  const [type, setType] = useState('Routine Follow-up');
  const [pre, setPre] = useState('');

  const canSave = !!date && !!docName;

  const handleSave = async () => {
    if (!canSave) return;
    try {
      await create.mutateAsync({
        appointmentDate: date,
        appointmentTime: time || null,
        doctorName: docName,
        clinic: clinic || null,
        visitType: type,
        preNotes: pre || null,
      });
      onClose();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Save failed';
      Alert.alert('Save failed', msg);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: tokens.bg }}>
      <View style={{
        backgroundColor: '#0D9488', paddingHorizontal: 16, paddingTop: 60, paddingBottom: 14,
      }}>
        <Pressable accessibilityRole="button" onPress={onClose}
          style={{
            backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, padding: 6,
            alignSelf: 'flex-start', marginBottom: 8,
          }}>
          <ArrowLeft size={16} color="white" />
        </Pressable>
        <Text style={{ fontSize: 20, fontWeight: '900', color: 'white' }}>New Appointment</Text>
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 13, paddingBottom: 30 }}>
        <Lbl tokens={tokens}>Date *</Lbl>
        <TextInput value={date} onChangeText={setDate} placeholder="YYYY-MM-DD"
          placeholderTextColor={tokens.text2} style={inputStyle(tokens)} />
        <Lbl tokens={tokens}>Time</Lbl>
        <TextInput value={time} onChangeText={setTime} placeholder="HH:MM"
          placeholderTextColor={tokens.text2} style={inputStyle(tokens)} />
        <Lbl tokens={tokens}>Doctor&apos;s Name *</Lbl>
        <TextInput value={docName} onChangeText={setDocName}
          placeholder="Dr. Tanmay Agrawal"
          placeholderTextColor={tokens.text2} style={inputStyle(tokens)} />
        <Lbl tokens={tokens}>Clinic / Hospital</Lbl>
        <TextInput value={clinic} onChangeText={setClinic}
          placeholder="Immunocare, Nagpur"
          placeholderTextColor={tokens.text2} style={inputStyle(tokens)} />
        <Lbl tokens={tokens}>Visit Type</Lbl>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginBottom: 12 }}>
          {APPT_TYPES.map((t) => {
            const sel = type === t;
            return (
              <Pressable key={t} accessibilityRole="button" onPress={() => setType(t)}
                style={{
                  backgroundColor: sel ? '#0D9488' : tokens.card2,
                  borderWidth: 2, borderColor: sel ? '#0D9488' : tokens.border,
                  borderRadius: 50, paddingHorizontal: 11, paddingVertical: 5,
                }}>
                <Text style={{
                  color: sel ? 'white' : tokens.text2,
                  fontWeight: '700', fontSize: 12,
                }}>{t}</Text>
              </Pressable>
            );
          })}
        </View>
        <Lbl tokens={tokens}>Questions to ask (optional)</Lbl>
        <TextInput value={pre} onChangeText={setPre}
          placeholder="e.g. Ask about MTX dose, eye checkup due..."
          placeholderTextColor={tokens.text2}
          multiline
          style={[inputStyle(tokens), { minHeight: 70, textAlignVertical: 'top' }]}
        />
        <Pressable
          accessibilityRole="button"
          disabled={!canSave || create.isPending}
          onPress={handleSave}
          style={{
            backgroundColor: !canSave ? '#CBD5E1' : '#0D9488',
            borderRadius: 12, padding: 13,
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7,
          }}>
          {create.isPending ? <Loader2 size={16} color="white" /> : null}
          <Text style={{ color: 'white', fontWeight: '900', fontSize: 16 }}>📅 Save Appointment</Text>
        </Pressable>
      </ScrollView>
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
