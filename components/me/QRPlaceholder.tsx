import { Linking, Pressable, Text, View } from 'react-native';
import { ExternalLink, QrCode } from 'lucide-react-native';
import { useTheme } from '@/lib/themeStore';

export default function QRPlaceholder() {
  const { tokens } = useTheme();
  return (
    <View style={{ backgroundColor: tokens.card, borderRadius: 12, padding: 14, marginBottom: 12, gap: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <QrCode color="#0D9488" size={16} />
        <Text style={{ color: tokens.text, fontWeight: '800', fontSize: 14 }}>Doctor QR Code</Text>
      </View>
      <Text style={{ color: tokens.text2, fontSize: 13 }}>
        Generate a QR code patients can scan to instantly add your contact info to RheumaTrack.
      </Text>
      <Text style={{ color: tokens.text2, fontSize: 12, fontFamily: 'Courier', marginTop: 4 }}>
        Format: immunocare.in/doctor?name=...&phone=...&hospital=...
      </Text>
      <Pressable
        onPress={() => Linking.openURL('https://www.qr-code-generator.com')}
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 8, padding: 10, borderRadius: 8, backgroundColor: '#0D9488' }}
      >
        <Text style={{ color: 'white', fontWeight: '700', fontSize: 13 }}>Generate at qr-code-generator.com</Text>
        <ExternalLink color="white" size={14} />
      </Pressable>
    </View>
  );
}
