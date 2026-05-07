import { Linking, Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MessageCircle, Stethoscope } from 'lucide-react-native';
import { useT } from '@/lib/i18n/useT';
import { useTheme } from '@/lib/themeStore';
import { waPhone } from '@/lib/schedule';

interface Props {
  name: string;
  specialty?: string | null;
  phone: string;
  patientName?: string | null;
  patientId?: string | null;
  diagnosis?: string | null;
}

function buildPrefilled(
  doctor: string,
  patient?: string | null,
  patientId?: string | null,
  diagnosis?: string | null,
): string {
  const nm = patient || 'Patient';
  const id = patientId ? ` (ID: ${patientId})` : '';
  const dg = diagnosis ? ` My diagnosis: ${diagnosis}.` : '';
  return `Hello ${doctor},\nI am ${nm}${id}.${dg}\n\nSent via RheumaTrack`;
}

export default function DoctorCard({
  name,
  specialty,
  phone,
  patientName,
  patientId,
  diagnosis,
}: Props) {
  const { tokens } = useTheme();
  const t = useT();

  const open = () => {
    const text = encodeURIComponent(
      buildPrefilled(name, patientName, patientId, diagnosis),
    );
    Linking.openURL(`https://wa.me/${waPhone(phone)}?text=${text}`).catch(() => {
      // swallow — user will see no action; toast in a later pass.
    });
  };

  return (
    <Pressable accessibilityRole="button" onPress={open} style={{ marginBottom: 14 }}>
      <LinearGradient
        colors={tokens.header.colors}
        start={tokens.header.start}
        end={tokens.header.end}
        style={{ borderRadius: 14, padding: 13 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 11, padding: 8 }}>
            <Stethoscope size={20} color="white" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: 'white', fontWeight: '800', fontSize: 15 }}>{name}</Text>
            {specialty ? (
              <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: '600' }}>
                {specialty}
              </Text>
            ) : null}
          </View>
          <View
            style={{
              backgroundColor: '#25D366',
              borderRadius: 9,
              paddingVertical: 7,
              paddingHorizontal: 11,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <MessageCircle size={15} color="white" />
            <Text style={{ color: 'white', fontWeight: '700', fontSize: 13 }}>{t('me_whatsapp')}</Text>
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
}
