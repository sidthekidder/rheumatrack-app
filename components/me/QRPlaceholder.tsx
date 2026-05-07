import { Linking, Pressable, Text, View } from 'react-native';
import { ExternalLink, QrCode } from 'lucide-react-native';
import { useTheme } from '@/lib/themeStore';
import { useT } from '@/lib/i18n/useT';

export default function QRPlaceholder() {
  const { tokens } = useTheme();
  const t = useT();
  return (
    <View style={{ backgroundColor: tokens.card, borderRadius: 12, padding: 14, marginBottom: 12, gap: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <QrCode color="#0D9488" size={16} />
        <Text style={{ color: tokens.text, fontWeight: '800', fontSize: 14 }}>{t('qr_doctor_qr_code')}</Text>
      </View>
      <Text style={{ color: tokens.text2, fontSize: 13 }}>
        {t('qr_explain')}
      </Text>
      <Text style={{ color: tokens.text2, fontSize: 12, fontFamily: 'Courier', marginTop: 4 }}>
        Format: immunocare.in/doctor?name=...&phone=...&hospital=...
      </Text>
      <Pressable
        onPress={() => Linking.openURL('https://www.qr-code-generator.com')}
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 8, padding: 10, borderRadius: 8, backgroundColor: '#0D9488' }}
      >
        <Text style={{ color: 'white', fontWeight: '700', fontSize: 13 }}>{t('qr_generate_btn')}</Text>
        <ExternalLink color="white" size={14} />
      </Pressable>
    </View>
  );
}
