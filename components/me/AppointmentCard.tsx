import { useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { CalendarDays, Check, ChevronDown, ChevronUp, Pencil, Trash2 } from 'lucide-react-native';
import { useDeleteAppointment, usePatchAppointment } from '@/lib/queries';
import type { Appointment } from '@/lib/api';
import { today } from '@/lib/schedule';
import { useTheme } from '@/lib/themeStore';

interface Props {
  appt: Appointment;
}

export default function AppointmentCard({ appt }: Props) {
  const { tokens } = useTheme();
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [postNotesDraft, setPostNotesDraft] = useState(appt.postNotes ?? '');
  const patchMutation = usePatchAppointment();
  const deleteMutation = useDeleteAppointment();

  const isPastDue = appt.appointmentDate <= today() && !appt.completed;
  const isComplete = appt.completed;

  const onComplete = () => {
    patchMutation.mutate({ id: appt.id, body: { completed: true } });
  };
  const onSavePostNotes = () => {
    patchMutation.mutate({ id: appt.id, body: { postNotes: postNotesDraft } });
  };
  const onDelete = () => {
    Alert.alert('Delete appointment?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(appt.id) },
    ]);
  };
  const onEdit = () => router.push(`/appointments/edit/${appt.id}` as never);

  return (
    <Pressable
      onPress={() => setExpanded((e) => !e)}
      style={{
        backgroundColor: tokens.card,
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: isComplete ? '#94A3B8' : tokens.border,
        opacity: isComplete ? 0.85 : 1,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <CalendarDays color="#0D9488" size={18} />
        <Text style={{ color: tokens.text, fontWeight: '700' }}>
          {appt.appointmentDate}{appt.appointmentTime ? ` · ${appt.appointmentTime}` : ''}
        </Text>
        <Text style={{ color: tokens.text2, marginLeft: 'auto', fontSize: 12 }}>{appt.visitType}</Text>
        {expanded ? <ChevronUp color={tokens.text2} size={16} /> : <ChevronDown color={tokens.text2} size={16} />}
      </View>
      <Text style={{ color: tokens.text2, marginTop: 4, fontSize: 13 }}>
        {appt.doctorName}{appt.clinic ? ` · ${appt.clinic}` : ''}
      </Text>

      {expanded ? (
        <View style={{ marginTop: 12, gap: 10 }}>
          {appt.preNotes ? (
            <View>
              <Text style={{ color: tokens.text2, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>Pre-visit notes</Text>
              <Text style={{ color: tokens.text, fontSize: 13, marginTop: 2 }}>{appt.preNotes}</Text>
            </View>
          ) : null}

          {(isComplete || isPastDue) ? (
            <View>
              <Text style={{ color: tokens.text2, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>Post-visit notes</Text>
              {appt.postNotes && !isPastDue ? (
                <Text style={{ color: tokens.text, fontSize: 13, marginTop: 2 }}>{appt.postNotes}</Text>
              ) : (
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                  <TextInput
                    value={postNotesDraft}
                    onChangeText={setPostNotesDraft}
                    placeholder="What did the doctor say?"
                    placeholderTextColor={tokens.text2}
                    multiline
                    style={{ flex: 1, color: tokens.text, backgroundColor: tokens.input, borderRadius: 8, padding: 10, minHeight: 60 }}
                  />
                  <Pressable
                    onPress={onSavePostNotes}
                    style={{ backgroundColor: '#0D9488', borderRadius: 8, paddingHorizontal: 12, justifyContent: 'center' }}
                  >
                    <Text style={{ color: 'white', fontWeight: '700' }}>Save</Text>
                  </Pressable>
                </View>
              )}
            </View>
          ) : null}

          <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
            <Pressable onPress={onEdit} style={btnStyle('#3B82F6')}>
              <Pencil color="white" size={14} />
              <Text style={btnTextStyle}>Edit</Text>
            </Pressable>
            {isPastDue ? (
              <Pressable onPress={onComplete} style={btnStyle('#0D9488')}>
                <Check color="white" size={14} />
                <Text style={btnTextStyle}>Complete</Text>
              </Pressable>
            ) : null}
            <Pressable onPress={onDelete} style={btnStyle('#FEE2E2')}>
              <Trash2 color="#DC2626" size={14} />
              <Text style={{ ...btnTextStyle, color: '#DC2626' }}>Delete</Text>
            </Pressable>
          </View>
        </View>
      ) : null}
    </Pressable>
  );
}

const btnStyle = (bg: string) => ({
  flex: 1,
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  gap: 6,
  paddingVertical: 10,
  borderRadius: 8,
  backgroundColor: bg,
});

const btnTextStyle = { color: 'white' as const, fontWeight: '700' as const, fontSize: 13 };
