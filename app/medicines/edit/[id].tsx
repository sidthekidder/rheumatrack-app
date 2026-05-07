import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import MedicineForm from '@/components/MedicineForm';
import { useMedicines } from '@/lib/queries';
import { useTheme } from '@/lib/themeStore';
import { useT } from '@/lib/i18n/useT';

export default function EditMedicineScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: medicines, isLoading } = useMedicines();
  const { tokens } = useTheme();
  const t = useT();
  const router = useRouter();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: tokens.bg }}>
        <ActivityIndicator size="large" color="#0D9488" />
      </View>
    );
  }

  const editMed = medicines?.find((m) => m.id === id);

  if (!editMed) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: tokens.bg, padding: 24, gap: 16 }}>
        <Text style={{ color: tokens.text, fontSize: 18, fontWeight: '700' }}>{t('medicine_not_found')}</Text>
        <Text style={{ color: tokens.text2, textAlign: 'center' }}>
          {t('medicine_deleted_other_tab')}
        </Text>
        <Pressable
          onPress={() => router.back()}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, backgroundColor: '#0D9488' }}
        >
          <ArrowLeft color="white" size={18} />
          <Text style={{ color: 'white', fontWeight: '700' }}>{t('back')}</Text>
        </Pressable>
      </View>
    );
  }

  return <MedicineForm editMed={editMed} />;
}
