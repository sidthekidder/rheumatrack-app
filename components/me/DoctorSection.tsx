import { useState } from 'react';
import { Alert, Linking, Pressable, Text, TextInput, View } from 'react-native';
import { Globe, Link, MessageCircle, Pencil, Phone, Play, Stethoscope } from 'lucide-react-native';
import { usePatchPatient, usePatient } from '@/lib/queries';
import { waPhone } from '@/lib/schedule';
import { useTheme } from '@/lib/themeStore';

export default function DoctorSection() {
  const { tokens } = useTheme();
  const patientQ = usePatient();
  const patient = patientQ.data;
  const patchMutation = usePatchPatient();
  const [editing, setEditing] = useState(false);

  const [name, setName] = useState(patient?.doctorName ?? '');
  const [specialty, setSpecialty] = useState(patient?.doctorSpecialty ?? '');
  const [hospital, setHospital] = useState(patient?.doctorHospital ?? '');
  const [phone, setPhone] = useState(patient?.doctorPhone ?? '');
  const [website, setWebsite] = useState(patient?.doctorWebsiteUrl ?? '');
  const [instagram, setInstagram] = useState(patient?.doctorInstagramUrl ?? '');
  const [youtube, setYoutube] = useState(patient?.doctorYoutubeUrl ?? '');

  if (!patient) return null;

  const enterEdit = () => {
    setName(patient.doctorName ?? '');
    setSpecialty(patient.doctorSpecialty ?? '');
    setHospital(patient.doctorHospital ?? '');
    setPhone(patient.doctorPhone ?? '');
    setWebsite(patient.doctorWebsiteUrl ?? '');
    setInstagram(patient.doctorInstagramUrl ?? '');
    setYoutube(patient.doctorYoutubeUrl ?? '');
    setEditing(true);
  };

  const onSave = () => {
    patchMutation.mutate(
      {
        doctorName: name.trim() || null,
        doctorSpecialty: specialty.trim() || null,
        doctorHospital: hospital.trim() || null,
        doctorPhone: phone.trim() || null,
        doctorWebsiteUrl: website.trim() || null,
        doctorInstagramUrl: instagram.trim() || null,
        doctorYoutubeUrl: youtube.trim() || null,
      },
      { onSuccess: () => setEditing(false), onError: (e) => Alert.alert('Save failed', String(e)) }
    );
  };

  const onCancel = () => setEditing(false);

  const onWhatsApp = () => {
    if (!patient.doctorPhone) return;
    const num = waPhone(patient.doctorPhone);
    const msg = encodeURIComponent(
      `Hello ${patient.doctorName ?? ''}\nI am ${patient.name}${patient.patientId ? ` (ID: ${patient.patientId})` : ''}.${patient.diagnosis ? `\nMy diagnosis: ${patient.diagnosis}.` : ''}\n\nSent via RheumaTrack`
    );
    Linking.openURL(`https://wa.me/${num}?text=${msg}`);
  };
  const onCall = () => patient.doctorPhone && Linking.openURL(`tel:${patient.doctorPhone}`);

  if (editing) {
    return (
      <Section title="👨‍⚕️ Your Doctor" onEdit={null}>
        <Field label="Doctor name"><TextInput value={name} onChangeText={setName} style={inputStyle(tokens)} placeholderTextColor={tokens.text2} /></Field>
        <Field label="Specialty"><TextInput value={specialty} onChangeText={setSpecialty} style={inputStyle(tokens)} placeholderTextColor={tokens.text2} /></Field>
        <Field label="Hospital"><TextInput value={hospital} onChangeText={setHospital} style={inputStyle(tokens)} placeholderTextColor={tokens.text2} /></Field>
        <Field label="Phone"><TextInput value={phone} onChangeText={setPhone} keyboardType="phone-pad" style={inputStyle(tokens)} placeholderTextColor={tokens.text2} /></Field>
        <Field label="Website URL"><TextInput value={website} onChangeText={setWebsite} autoCapitalize="none" placeholder="https://..." style={inputStyle(tokens)} placeholderTextColor={tokens.text2} /></Field>
        <Field label="Instagram URL"><TextInput value={instagram} onChangeText={setInstagram} autoCapitalize="none" placeholder="https://instagram.com/..." style={inputStyle(tokens)} placeholderTextColor={tokens.text2} /></Field>
        <Field label="YouTube URL"><TextInput value={youtube} onChangeText={setYoutube} autoCapitalize="none" placeholder="https://youtube.com/..." style={inputStyle(tokens)} placeholderTextColor={tokens.text2} /></Field>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
          <Pressable onPress={onCancel} style={{ flex: 1, padding: 12, borderRadius: 8, backgroundColor: tokens.card2, alignItems: 'center' }}>
            <Text style={{ color: tokens.text, fontWeight: '700' }}>Cancel</Text>
          </Pressable>
          <Pressable onPress={onSave} disabled={patchMutation.isPending} style={{ flex: 1, padding: 12, borderRadius: 8, backgroundColor: '#0D9488', alignItems: 'center', opacity: patchMutation.isPending ? 0.6 : 1 }}>
            <Text style={{ color: 'white', fontWeight: '700' }}>{patchMutation.isPending ? 'Saving…' : 'Save'}</Text>
          </Pressable>
        </View>
      </Section>
    );
  }

  return (
    <Section title="👨‍⚕️ Your Doctor" onEdit={enterEdit}>
      {patient.doctorName ? <Text style={{ color: tokens.text, fontWeight: '700', fontSize: 16 }}>{patient.doctorName}</Text> : null}
      {patient.doctorSpecialty ? <Text style={{ color: tokens.text2, fontSize: 13 }}>{patient.doctorSpecialty}</Text> : null}
      {patient.doctorHospital ? <Text style={{ color: tokens.text2, fontSize: 13 }}>{patient.doctorHospital}</Text> : null}
      {patient.doctorPhone ? <Text style={{ color: tokens.text2, fontSize: 13 }}>{patient.doctorPhone}</Text> : null}

      {patient.doctorPhone ? (
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
          <Pressable onPress={onWhatsApp} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 10, borderRadius: 8, backgroundColor: '#22C55E' }}>
            <MessageCircle color="white" size={16} />
            <Text style={{ color: 'white', fontWeight: '700', fontSize: 13 }}>WhatsApp</Text>
          </Pressable>
          <Pressable onPress={onCall} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 10, borderRadius: 8, backgroundColor: '#0D9488' }}>
            <Phone color="white" size={16} />
            <Text style={{ color: 'white', fontWeight: '700', fontSize: 13 }}>Call</Text>
          </Pressable>
        </View>
      ) : null}

      {patient.doctorWebsiteUrl ? (
        <Pressable onPress={() => Linking.openURL(patient.doctorWebsiteUrl!)} style={{ ...socialBtn, backgroundColor: '#3B82F6', marginTop: 8 }}>
          <Globe color="white" size={16} />
          <Text style={socialText}>Website</Text>
        </Pressable>
      ) : null}
      {patient.doctorInstagramUrl ? (
        <Pressable onPress={() => Linking.openURL(patient.doctorInstagramUrl!)} style={{ ...socialBtn, backgroundColor: '#E1306C', marginTop: 8 }}>
          <Link color="white" size={16} />
          <Text style={socialText}>Instagram</Text>
        </Pressable>
      ) : null}
      {patient.doctorYoutubeUrl ? (
        <Pressable onPress={() => Linking.openURL(patient.doctorYoutubeUrl!)} style={{ ...socialBtn, backgroundColor: '#DC2626', marginTop: 8 }}>
          <Play color="white" size={16} />
          <Text style={socialText}>YouTube</Text>
        </Pressable>
      ) : null}
    </Section>
  );
}

function Section({ title, onEdit, children }: { title: string; onEdit: (() => void) | null; children: React.ReactNode }) {
  const { tokens } = useTheme();
  return (
    <View style={{ backgroundColor: tokens.card, borderRadius: 12, padding: 14, marginBottom: 12, gap: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Stethoscope color="#0D9488" size={16} />
        <Text style={{ color: tokens.text, fontWeight: '800', fontSize: 14, marginLeft: 8, flex: 1 }}>{title}</Text>
        {onEdit ? (
          <Pressable onPress={onEdit} hitSlop={8}>
            <Pencil color={tokens.text2} size={16} />
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  const { tokens } = useTheme();
  return (
    <View style={{ gap: 4 }}>
      <Text style={{ color: tokens.text2, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' }}>{label}</Text>
      {children}
    </View>
  );
}

const inputStyle = (tokens: ReturnType<typeof useTheme>['tokens']) => ({
  color: tokens.text,
  backgroundColor: tokens.input,
  borderRadius: 8,
  padding: 10,
  borderWidth: 1,
  borderColor: tokens.border,
});

const socialBtn = { flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'center' as const, gap: 6, padding: 10, borderRadius: 8 };
const socialText = { color: 'white' as const, fontWeight: '700' as const, fontSize: 13 };
