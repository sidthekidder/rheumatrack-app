import { LayoutChangeEvent } from 'react-native';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { Defs, LinearGradient, Path, Stop, Svg } from 'react-native-svg';
import type { FlareEntry } from '@/lib/api';
import { useTheme } from '@/lib/themeStore';
import { useT } from '@/lib/i18n/useT';
import { areaPath, polylinePath, scaleLinear } from './svgUtils';

interface FlareGraphProps {
  entries: FlareEntry[];
  days?: number;
}

const SUB_HEIGHT = 80;
const PADDING_X = 16;
const PADDING_Y = 8;

export default function FlareGraph({ entries, days = 30 }: FlareGraphProps) {
  const { tokens } = useTheme();
  const t = useT();
  const [width, setWidth] = useState(0);

  const sorted = [...entries].sort((a, b) => a.entryDate.localeCompare(b.entryDate));
  const cutoffMs = Date.now() - days * 24 * 60 * 60 * 1000;
  const cutoffStr = new Date(cutoffMs).toISOString().slice(0, 10);
  const recent = sorted.filter((e) => e.entryDate >= cutoffStr);

  if (recent.length === 0) {
    return (
      <View style={{ padding: 24, alignItems: 'center', backgroundColor: tokens.card, borderRadius: 12 }}>
        <Text style={{ color: tokens.text2, fontSize: 13 }}>{t('diary_no_history')}</Text>
      </View>
    );
  }

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const dayMs = 24 * 60 * 60 * 1000;
  const minDate = new Date(recent[0].entryDate).getTime();
  const maxDate = new Date(recent[recent.length - 1].entryDate).getTime();
  const dateRange: [number, number] = [minDate, maxDate || minDate + dayMs];

  return (
    <View style={{ backgroundColor: tokens.card, borderRadius: 12, padding: PADDING_X }} onLayout={onLayout}>
      <SubChart title="Pain" max={10} color="#EF4444" recent={recent} valueOf={(e) => e.pain} width={Math.max(width - PADDING_X * 2, 1)} dateRange={dateRange} />
      <SubChart title="Stiffness (min)" max={120} color="#F59E0B" recent={recent} valueOf={(e) => e.stiffnessMin} width={Math.max(width - PADDING_X * 2, 1)} dateRange={dateRange} />
      <SubChart title="Fatigue" max={10} color="#3B82F6" recent={recent} valueOf={(e) => e.fatigue} width={Math.max(width - PADDING_X * 2, 1)} dateRange={dateRange} />
    </View>
  );
}

interface SubChartProps {
  title: string;
  max: number;
  color: string;
  recent: FlareEntry[];
  valueOf: (e: FlareEntry) => number;
  width: number;
  dateRange: [number, number];
}

function SubChart({ title, max, color, recent, valueOf, width, dateRange }: SubChartProps) {
  const { tokens } = useTheme();
  if (width <= 0) return <View style={{ height: SUB_HEIGHT }} />;

  const xScale = scaleLinear(dateRange, [0, width]);
  const yScale = scaleLinear([0, max], [SUB_HEIGHT - PADDING_Y, PADDING_Y]);

  const points = recent.map((e) => ({
    x: xScale(new Date(e.entryDate).getTime()),
    y: yScale(valueOf(e)),
  }));

  const gradId = `grad_${title.replace(/[^a-zA-Z0-9]/g, '_')}`;

  return (
    <View style={{ marginBottom: 8 }}>
      <Text style={{ color: tokens.text, fontSize: 12, fontWeight: '700', marginBottom: 4 }}>
        {title}
      </Text>
      <Svg width={width} height={SUB_HEIGHT}>
        <Defs>
          <LinearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity="0.4" />
            <Stop offset="1" stopColor={color} stopOpacity="0.05" />
          </LinearGradient>
        </Defs>
        <Path d={areaPath(points, SUB_HEIGHT - PADDING_Y)} fill={`url(#${gradId})`} />
        <Path d={polylinePath(points)} stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </View>
  );
}
