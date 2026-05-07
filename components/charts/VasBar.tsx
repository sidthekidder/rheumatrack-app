import { useState } from 'react';
import { LayoutChangeEvent, Pressable, Text, View } from 'react-native';
import { useTheme } from '@/lib/themeStore';

interface VasBarProps {
  label: string;
  value: number;
  min?: number;
  max: number;
  unit?: string;
  step?: number;
  onChange: (v: number) => void;
  color: string;
}

/**
 * Tap-to-set VAS slider. Renders a labeled track with a colored fill bar.
 * Tap anywhere on the track → calculates ratio and snaps value to nearest step.
 */
export default function VasBar({
  label,
  value,
  min = 0,
  max,
  unit = '',
  step = 1,
  onChange,
  color,
}: VasBarProps) {
  const { tokens } = useTheme();
  const [trackWidth, setTrackWidth] = useState(0);
  const ratio = max === min ? 0 : (value - min) / (max - min);
  const fillWidth = Math.max(0, Math.min(1, ratio)) * trackWidth;

  const onLayout = (e: LayoutChangeEvent) => setTrackWidth(e.nativeEvent.layout.width);

  const onPressTrack = (e: { nativeEvent: { locationX: number } }) => {
    if (trackWidth <= 0) return;
    const x = e.nativeEvent.locationX;
    const r = Math.max(0, Math.min(1, x / trackWidth));
    const raw = min + r * (max - min);
    const snapped = Math.round(raw / step) * step;
    onChange(snapped);
  };

  return (
    <View style={{ marginVertical: 8 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
        <Text style={{ color: tokens.text, fontSize: 13, fontWeight: '700' }}>{label}</Text>
        <Text style={{ color: tokens.text2, fontSize: 13, fontWeight: '700' }}>
          {value}{unit ? ` ${unit}` : ''}
          {!unit && max <= 10 ? `/${max}` : ''}
        </Text>
      </View>
      <Pressable
        onPress={onPressTrack}
        onLayout={onLayout}
        style={{
          height: 24,
          borderRadius: 12,
          backgroundColor: tokens.input,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: tokens.border,
        }}
      >
        <View
          style={{
            width: fillWidth,
            height: '100%',
            backgroundColor: color,
            borderRadius: 12,
          }}
        />
      </Pressable>
    </View>
  );
}
