import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { ArrowLeft, Check } from 'lucide-react-native';
import { useCreateAppointment, usePatchAppointment, usePatient } from '@/lib/queries';
import type { Appointment, AppointmentCreate } from '@/lib/api';
import { useTheme } from '@/lib/themeStore';
import { useT } from '@/lib/i18n/useT';

const VISIT_TYPES = ['Routine Follow-up', 'New Symptom', 'Lab Review', 'Other'] as const;
type VisitType = (typeof VISIT_TYPES)[number];

// Map DB-stored visit type values to i18n keys
const VISIT_TYPE_KEYS: Record<VisitType, 'visit_routine' | 'visit_new_symptom' | 'visit_lab_review' | 'visit_other'> = {
  'Routine Follow-up': 'visit_routine',
  'New Symptom': 'visit_new_symptom',
  'Lab Review': 'visit_lab_review',
  'Other': 'visit_other',
};

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
  const t = useT();
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
      Alert.alert(t('appt_missing_field'), t('appt_doctor_required'));
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
        { onSuccess: () => router.back(), onError: (e) => Alert.alert(t('appt_update_failed'), String(e)) }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => router.back(),
        onError: (e) => Alert.alert(t('appt_save_failed'), String(e)),
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
            {isEdit ? t('edit_appointment') : t('new_appointment')}
          </Text>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
          <Field label={t('appt_date_label')}>
            <TextInput value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" placeholderTextColor={tokens.text2} style={inputStyle(tokens)} />
          </Field>
          <Field label={t('appt_time_label')}>
            <TextInput value={time} onChangeText={setTime} placeholder="HH:MM" placeholderTextColor={tokens.text2} style={inputStyle(tokens)} />
          </Field>
          <Field label={t('visit_type')}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {VISIT_TYPES.map((vt) => {
                const active = visitType === vt;
                return (
                  <Pressable
                    key={vt}
                    onPress={() => setVisitType(vt)}
                    style={{
                      paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8,
                      backgroundColor: active ? '#0D9488' : tokens.card,
                      borderWidth: 1, borderColor: active ? '#0D9488' : tokens.border,
                    }}
                  >
                    <Text style={{ color: active ? 'white' : tokens.text, fontWeight: '700', fontSize: 13 }}>{t(VISIT_TYPE_KEYS[vt])}</Text>
                  </Pressable>
                );
              })}
            </View>
          </Field>
          <Field label={t('doctor_name')}>
            <TextInput value={doctorName} onChangeText={setDoctorName} placeholder="Dr. ..." placeholderTextColor={tokens.text2} style={inputStyle(tokens)} />
          </Field>
          <Field label={t('appt_clinic_label')}>
            <TextInput value={clinic} onChangeText={setClinic} placeholder={t('appt_clinic_placeholder')} placeholderTextColor={tokens.text2} style={inputStyle(tokens)} />
          </Field>
          <Field label={t('pre_visit_notes')}>
            <TextInput value={preNotes} onChangeText={setPreNotes} multiline placeholder={t('pre_visit_placeholder')} placeholderTextColor={tokens.text2} style={[inputStyle(tokens), { minHeight: 80, textAlignVertical: 'top' }]} />
          </Field>
          {isEdit ? (
            <Field label={t('post_visit_notes')}>
              <TextInput value={postNotes} onChangeText={setPostNotes} multiline placeholder={t('post_visit_placeholder')} placeholderTextColor={tokens.text2} style={[inputStyle(tokens), { minHeight: 80, textAlignVertical: 'top' }]} />
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
              {isSaving ? (isEdit ? t('me_updating') : t('saving')) : (isEdit ? t('update_appointment') : t('save_appointment'))}
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
