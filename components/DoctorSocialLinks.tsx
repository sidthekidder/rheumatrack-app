import { Linking, Pressable, Text, View } from 'react-native';
import { Globe, Link as LinkIcon, Play } from 'lucide-react-native';

interface DoctorSocialLinksProps {
  websiteUrl?: string | null;
  instagramUrl?: string | null;
  youtubeUrl?: string | null;
  variant?: 'frosted' | 'colored';
}

export default function DoctorSocialLinks({
  websiteUrl,
  instagramUrl,
  youtubeUrl,
  variant = 'colored',
}: DoctorSocialLinksProps) {
  const links = [
    websiteUrl ? { url: websiteUrl, label: 'Website', Icon: Globe, color: '#3B82F6' } : null,
    instagramUrl ? { url: instagramUrl, label: 'Instagram', Icon: LinkIcon, color: '#E1306C' } : null,
    youtubeUrl ? { url: youtubeUrl, label: 'YouTube', Icon: Play, color: '#DC2626' } : null,
  ].filter((x): x is { url: string; label: string; Icon: typeof Globe; color: string } => !!x);

  if (links.length === 0) return null;

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
      {links.map(({ url, label, Icon, color }) => {
        const bg = variant === 'frosted' ? 'rgba(255,255,255,0.18)' : color;
        return (
          <Pressable
            key={label}
            onPress={() => Linking.openURL(url)}
            style={{
              flexDirection: 'row', alignItems: 'center', gap: 6,
              paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8,
              backgroundColor: bg,
              borderWidth: variant === 'frosted' ? 1 : 0,
              borderColor: 'rgba(255,255,255,0.3)',
            }}
          >
            <Icon color="white" size={14} />
            <Text style={{ color: 'white', fontWeight: '700', fontSize: 13 }}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
