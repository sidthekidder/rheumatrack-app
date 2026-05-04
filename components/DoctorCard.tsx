import { Linking, Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MessageCircle, Stethoscope } from 'lucide-react-native';
import { useTheme } from '@/lib/themeStore';
import { waPhone } from '@/lib/schedule';

interface Props {
  name: string;
  specialty?: string | null;
  phone: string;
}

export default function DoctorCard({ name, specialty, phone }: Props) {
  const { tokens } = useTheme();

  const open = () => {
    Linking.openURL(`https://wa.me/${waPhone(phone)}`);
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
            <Text style={{ color: 'white', fontWeight: '700', fontSize: 13 }}>WhatsApp</Text>
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
}
