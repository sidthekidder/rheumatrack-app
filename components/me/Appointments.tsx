import { useMemo, useState } from 'react';
import {
  ActivityIndicator, Alert, Modal, Pressable, ScrollView, Text, TextInput, View,
} from 'react-native';
import {
  ArrowLeft, CheckCircle, ChevronDown, Loader2, Plus, Trash2,
} from 'lucide-react-native';
import { APPT_TYPES } from '@/constants/appointments';
import {
  useAppointments, useCreateAppointment, useDeleteAppointment, usePatchAppointment, usePatient,
} from '@/lib/queries';
import type { Appointment } from '@/lib/api';
import { today } from '@/lib/schedule';
import { useTheme } from '@/lib/themeStore';

export default function Appointments() {
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
