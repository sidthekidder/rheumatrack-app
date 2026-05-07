import { useState } from 'react';
import { Alert, Linking, Pressable, Text, TextInput, View } from 'react-native';
import { MessageCircle, Pencil, Phone, Stethoscope } from 'lucide-react-native';
import DoctorSocialLinks from '@/components/DoctorSocialLinks';
import { usePatchPatient, usePatient } from '@/lib/queries';
import { waPhone } from '@/lib/schedule';
import { useTheme } from '@/lib/themeStore';
import { useT } from '@/lib/i18n/useT';

export default function DoctorSection() {
  const { tokens } = useTheme();
  const t = useT();
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
      { onSuccess: () => setEditing(false), onError: (e) => Alert.alert(t('save_failed'), String(e)) }
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
      <Section title={`👨‍⚕️ ${t('your_doctor')}`} onEdit={null}>
        <Field label={t('doctor_name')}><TextInput value={name} onChangeText={setName} style={inputStyle(tokens)} placeholderTextColor={tokens.text2} /></Field>
        <Field label={t('specialty')}><TextInput value={specialty} onChangeText={setSpecialty} style={inputStyle(tokens)} placeholderTextColor={tokens.text2} /></Field>
        <Field label={t('hospital_clinic')}><TextInput value={hospital} onChangeText={setHospital} style={inputStyle(tokens)} placeholderTextColor={tokens.text2} /></Field>
        <Field label={t('whatsapp_number')}><TextInput value={phone} onChangeText={setPhone} keyboardType="phone-pad" style={inputStyle(tokens)} placeholderTextColor={tokens.text2} /></Field>
        <Field label={t('website_url')}><TextInput value={website} onChangeText={setWebsite} autoCapitalize="none" placeholder="https://..." style={inputStyle(tokens)} placeholderTextColor={tokens.text2} /></Field>
        <Field label={t('instagram_url')}><TextInput value={instagram} onChangeText={setInstagram} autoCapitalize="none" placeholder="https://instagram.com/..." style={inputStyle(tokens)} placeholderTextColor={tokens.text2} /></Field>
        <Field label={t('youtube_url')}><TextInput value={youtube} onChangeText={setYoutube} autoCapitalize="none" placeholder="https://youtube.com/..." style={inputStyle(tokens)} placeholderTextColor={tokens.text2} /></Field>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
          <Pressable onPress={onCancel} style={{ flex: 1, padding: 12, borderRadius: 8, backgroundColor: tokens.card2, alignItems: 'center' }}>
            <Text style={{ color: tokens.text, fontWeight: '700' }}>{t('cancel')}</Text>
          </Pressable>
          <Pressable onPress={onSave} disabled={patchMutation.isPending} style={{ flex: 1, padding: 12, borderRadius: 8, backgroundColor: '#0D9488', alignItems: 'center', opacity: patchMutation.isPending ? 0.6 : 1 }}>
            <Text style={{ color: 'white', fontWeight: '700' }}>{patchMutation.isPending ? t('saving') : t('save')}</Text>
          </Pressable>
        </View>
      </Section>
    );
  }

  return (
    <Section title={`👨‍⚕️ ${t('your_doctor')}`} onEdit={enterEdit}>
      {patient.doctorName ? <Text style={{ color: tokens.text, fontWeight: '700', fontSize: 16 }}>{patient.doctorName}</Text> : null}
      {patient.doctorSpecialty ? <Text style={{ color: tokens.text2, fontSize: 13 }}>{patient.doctorSpecialty}</Text> : null}
      {patient.doctorHospital ? <Text style={{ color: tokens.text2, fontSize: 13 }}>{patient.doctorHospital}</Text> : null}
      {patient.doctorPhone ? <Text style={{ color: tokens.text2, fontSize: 13 }}>{patient.doctorPhone}</Text> : null}

      {patient.doctorPhone ? (
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
          <Pressable onPress={onWhatsApp} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 10, borderRadius: 8, backgroundColor: '#22C55E' }}>
            <MessageCircle color="white" size={16} />
            <Text style={{ color: 'white', fontWeight: '700', fontSize: 13 }}>{t('me_whatsapp')}</Text>
          </Pressable>
          <Pressable onPress={onCall} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 10, borderRadius: 8, backgroundColor: '#0D9488' }}>
            <Phone color="white" size={16} />
            <Text style={{ color: 'white', fontWeight: '700', fontSize: 13 }}>{t('call')}</Text>
          </Pressable>
        </View>
      ) : null}

      <DoctorSocialLinks
        websiteUrl={patient.doctorWebsiteUrl}
        instagramUrl={patient.doctorInstagramUrl}
        youtubeUrl={patient.doctorYoutubeUrl}
        variant="colored"
      />
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
