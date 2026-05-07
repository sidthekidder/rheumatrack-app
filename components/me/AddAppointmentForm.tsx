import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { ArrowLeft, Check } from 'lucide-react-native';
import { useCreateAppointment, usePatchAppointment, usePatient } from '@/lib/queries';
import type { Appointment, AppointmentCreate } from '@/lib/api';
import { useTheme } from '@/lib/themeStore';

const VISIT_TYPES = ['Routine Follow-up', 'New Symptom', 'Lab Review', 'Other'] as const;
type VisitType = (typeof VISIT_TYPES)[number];

function defaultDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString().slice(0, 10);
}

interface Props {
  editAppt?: Appointment;
}

export default function AddAppointmentForm({ editAppt }: Props) {
  const router = useRouter();
  const { tokens } = useTheme();
  const patientQ = usePatient();
  const createMutation = useCreateAppointment();
  const patchMutation = usePatchAppointment();
  const isEdit = !!editAppt;

  const [date, setDate] = useState(editAppt?.appointmentDate ?? defaultDate());
  const [time, setTime] = useState(editAppt?.appointmentTime ?? '10:00');
  const [visitType, setVisitType] = useState<VisitType>(
    (editAppt?.visitType as VisitType) ?? 'Routine Follow-up'
  );
  const [doctorName, setDoctorName] = useState(editAppt?.doctorName ?? patientQ.data?.doctorName ?? '');
  const [clinic, setClinic] = useState(editAppt?.clinic ?? patientQ.data?.doctorHospital ?? '');
  const [preNotes, setPreNotes] = useState(editAppt?.preNotes ?? '');
  const [postNotes, setPostNotes] = useState(editAppt?.postNotes ?? '');

  const isSaving = createMutation.isPending || patchMutation.isPending;

  const onSubmit = () => {
    if (!doctorName.trim()) {
      Alert.alert('Missing field', 'Doctor name is required.');
      return;
    }
    const payload: AppointmentCreate = {
      appointmentDate: date,
      appointmentTime: time || null,
      visitType,
      doctorName: doctorName.trim(),
      clinic: clinic.trim() || null,
      preNotes: preNotes.trim() || null,
      postNotes: isEdit ? (postNotes.trim() || null) : null,
    };
    if (isEdit) {
      patchMutation.mutate(
        { id: editAppt.id, body: payload },
        { onSuccess: () => router.back(), onError: (e) => Alert.alert('Update failed', String(e)) }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => router.back(),
        onError: (e) => Alert.alert('Save failed', String(e)),
      });
    }
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: tokens.bg }}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12, gap: 12, borderBottomWidth: 1, borderBottomColor: tokens.border }}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <ArrowLeft color={tokens.text} size={22} />
          </Pressable>
          <Text style={{ color: tokens.text, fontSize: 18, fontWeight: '800' }}>
            {isEdit ? 'Edit Appointment' : 'New Appointment'}
          </Text>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
          <Field label="Date">
            <TextInput value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" placeholderTextColor={tokens.text2} style={inputStyle(tokens)} />
          </Field>
          <Field label="Time">
            <TextInput value={time} onChangeText={setTime} placeholder="HH:MM" placeholderTextColor={tokens.text2} style={inputStyle(tokens)} />
          </Field>
          <Field label="Visit type">
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {VISIT_TYPES.map((t) => {
                const active = visitType === t;
                return (
                  <Pressable
                    key={t}
                    onPress={() => setVisitType(t)}
                    style={{
                      paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8,
                      backgroundColor: active ? '#0D9488' : tokens.card,
                      borderWidth: 1, borderColor: active ? '#0D9488' : tokens.border,
                    }}
                  >
                    <Text style={{ color: active ? 'white' : tokens.text, fontWeight: '700', fontSize: 13 }}>{t}</Text>
                  </Pressable>
                );
              })}
            </View>
          </Field>
          <Field label="Doctor name">
            <TextInput value={doctorName} onChangeText={setDoctorName} placeholder="Dr. ..." placeholderTextColor={tokens.text2} style={inputStyle(tokens)} />
          </Field>
          <Field label="Clinic">
            <TextInput value={clinic} onChangeText={setClinic} placeholder="Hospital or clinic name" placeholderTextColor={tokens.text2} style={inputStyle(tokens)} />
          </Field>
          <Field label="Pre-visit notes">
            <TextInput value={preNotes} onChangeText={setPreNotes} multiline placeholder="Questions to ask, symptoms to mention" placeholderTextColor={tokens.text2} style={[inputStyle(tokens), { minHeight: 80, textAlignVertical: 'top' }]} />
          </Field>
          {isEdit ? (
            <Field label="Post-visit notes">
              <TextInput value={postNotes} onChangeText={setPostNotes} multiline placeholder="What the doctor said" placeholderTextColor={tokens.text2} style={[inputStyle(tokens), { minHeight: 80, textAlignVertical: 'top' }]} />
            </Field>
          ) : null}

          <Pressable
            onPress={onSubmit}
            disabled={isSaving}
            style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
              backgroundColor: '#0D9488', borderRadius: 12, paddingVertical: 14, opacity: isSaving ? 0.6 : 1,
              marginTop: 8,
            }}
          >
            <Check color="white" size={18} />
            <Text style={{ color: 'white', fontWeight: '700', fontSize: 15 }}>
              {isSaving ? (isEdit ? 'Updating…' : 'Saving…') : (isEdit ? 'Update Appointment' : 'Save Appointment')}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  const { tokens } = useTheme();
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ color: tokens.text2, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</Text>
      {children}
    </View>
  );
}

const inputStyle = (tokens: ReturnType<typeof useTheme>['tokens']) => ({
  color: tokens.text,
  backgroundColor: tokens.input,
  borderRadius: 8,
  padding: 12,
  borderWidth: 1,
  borderColor: tokens.border,
});
