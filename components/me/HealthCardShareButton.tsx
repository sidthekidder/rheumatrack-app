import { Linking, Pressable, Text } from 'react-native';
import { MessageCircle } from 'lucide-react-native';
import { useT } from '@/lib/i18n/useT';
import { waPhone } from '@/lib/schedule';

interface Props {
  shareText: string;
  doctorPhone?: string | null;
}

/**
 * Opens WhatsApp pre-filled with the formatted health card text.
 * - With doctorPhone: addresses the message to the doctor.
 * - Without doctorPhone: opens contact picker with text only.
 * Works on web (WhatsApp Web in new tab), iOS, and Android.
 */
export default function HealthCardShareButton({ shareText, doctorPhone }: Props) {
  const t = useT();
  const onShare = () => {
    const encoded = encodeURIComponent(shareText);
    const url = doctorPhone
      ? `https://wa.me/${waPhone(doctorPhone)}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;
    Linking.openURL(url);
  };
  return (
    <Pressable
      onPress={onShare}
      style={{
        flexDirection: 'row', alignItems: 'center', gap: 6,
        paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8,
        backgroundColor: '#22C55E',
      }}
    >
      <MessageCircle color="white" size={16} />
      <Text style={{ color: 'white', fontWeight: '700' }}>{t('share')}</Text>
    </Pressable>
  );
}
