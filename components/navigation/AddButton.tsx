import { Pressable, View, Text, type GestureResponderEvent } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus } from 'lucide-react-native';

interface AddButtonProps {
  onPress: (e: GestureResponderEvent) => void;
  active?: boolean;
}

export default function AddButton({ onPress, active = false }: AddButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Add — open scan or manual add"
      onPress={onPress}
      style={{ alignItems: 'center', justifyContent: 'center' }}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 14,
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#0D9488',
          shadowOpacity: active ? 0.55 : 0.35,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 2 },
          elevation: 4,
        }}
      >
        <LinearGradient
          colors={['#14B8A6', '#0D9488']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}
        >
          <Plus color="white" size={22} strokeWidth={2.8} />
        </LinearGradient>
      </View>
      <Text style={{ fontSize: 9, fontWeight: '700', color: '#0D9488', marginTop: 2 }}>
        +Add
      </Text>
    </Pressable>
  );
}
