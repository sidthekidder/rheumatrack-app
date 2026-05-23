import { useRef, useState } from 'react';
import {
  GestureResponderEvent,
  LayoutChangeEvent,
  Platform,
  Pressable,
  Text,
  View,
} from 'react-native';
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
  const trackRef = useRef<View>(null);
  const ratio = max === min ? 0 : (value - min) / (max - min);
  const fillWidth = Math.max(0, Math.min(1, ratio)) * trackWidth;

  const onLayout = (e: LayoutChangeEvent) => setTrackWidth(e.nativeEvent.layout.width);

  // RN-Web doesn't populate nativeEvent.locationX the way native does, so fall
  // through several sources to figure out the click x inside the track.
  const extractX = (e: GestureResponderEvent): number | null => {
    const ne = e.nativeEvent as unknown as Record<string, unknown>;
    if (typeof ne.locationX === 'number' && !Number.isNaN(ne.locationX)) {
      return ne.locationX;
    }
    if (typeof ne.offsetX === 'number' && !Number.isNaN(ne.offsetX)) {
      return ne.offsetX;
    }
    if (Platform.OS === 'web' && trackRef.current && typeof ne.pageX === 'number') {
      const el = trackRef.current as unknown as HTMLElement;
      const rect = el.getBoundingClientRect?.();
      if (rect) return ne.pageX - rect.left;
    }
    return null;
  };

  const onPressTrack = (e: GestureResponderEvent) => {
    if (trackWidth <= 0) return;
    const x = extractX(e);
    if (x === null) return;
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
        ref={trackRef}
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
