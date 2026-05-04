import { View } from 'react-native';

interface Props {
  total: number;
  current: number;
}

export default function ProgressDots({ total, current }: Props) {
  return (
    <View style={{ flexDirection: 'row', gap: 5, marginTop: 11 }}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={{
            flex: 1,
            height: 4,
            borderRadius: 2,
            backgroundColor: 'white',
            opacity: i === current ? 1 : 0.3,
          }}
        />
      ))}
    </View>
  );
}
