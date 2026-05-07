import { Pressable, Text, View } from 'react-native';
import { useLanguageStore, type Language } from '@/lib/languageStore';
import { usePatchPatient } from '@/lib/queries';
import { useTheme } from '@/lib/themeStore';
import { useT } from '@/lib/i18n/useT';

export default function LanguageToggle() {
  const { tokens } = useTheme();
  const t = useT();
  const language = useLanguageStore((s) => s.language);
  const setLanguage = useLanguageStore((s) => s.setLanguage);
  const patchMutation = usePatchPatient();

  const onPick = (lang: Language) => {
    setLanguage(lang);
    patchMutation.mutate({ language: lang });
  };

  return (
    <View style={{ backgroundColor: tokens.card, borderRadius: 12, padding: 14, marginBottom: 12, gap: 10 }}>
      <Text style={{ color: tokens.text, fontWeight: '800', fontSize: 14 }}>{t('language')}</Text>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Btn active={language === 'en'} onPress={() => onPick('en')} label="🇬🇧 English" />
        <Btn active={language === 'hi'} onPress={() => onPick('hi')} label="🇮🇳 हिन्दी" />
      </View>
    </View>
  );
}

function Btn({ active, onPress, label }: { active: boolean; onPress: () => void; label: string }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: active ? '#0D9488' : 'transparent',
        borderWidth: 1,
        borderColor: '#0D9488',
        alignItems: 'center',
      }}
    >
      <Text style={{ color: active ? 'white' : '#0D9488', fontWeight: '700', fontSize: 14 }}>{label}</Text>
    </Pressable>
  );
}
