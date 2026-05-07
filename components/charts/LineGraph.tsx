import { useState } from 'react';
import { LayoutChangeEvent, Text, View } from 'react-native';
import { Circle, Path, Rect, Svg } from 'react-native-svg';
import type { LabTest } from '@/constants/labs';
import { useTheme } from '@/lib/themeStore';
import { useT } from '@/lib/i18n/useT';
import { polylinePath, scaleLinear } from './svgUtils';

interface Point {
  date: string;
  value: number;
}

interface LineGraphProps {
  test: LabTest;
  results: Point[];
}

const HEIGHT = 140;
const PADDING_X = 12;
const PADDING_Y = 12;

export default function LineGraph({ test, results }: LineGraphProps) {
  const { tokens } = useTheme();
  const t = useT();
  const [width, setWidth] = useState(0);

  if (results.length === 0) {
    return (
      <View style={{ padding: 16, alignItems: 'center', backgroundColor: tokens.card2, borderRadius: 8 }}>
        <Text style={{ color: tokens.text2, fontSize: 12 }}>{t('no_history_for_test')}</Text>
      </View>
    );
  }

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const sorted = [...results].sort((a, b) => a.date.localeCompare(b.date));

  const minTime = new Date(sorted[0].date).getTime();
  const maxTime = new Date(sorted[sorted.length - 1].date).getTime();
  const xRange: [number, number] = [minTime, maxTime || minTime + 1];

  const values = sorted.map((p) => p.value);
  const dataMax = Math.max(...values);
  const dataMin = Math.min(...values);
  const yTopCandidate = test.nMax ?? -Infinity;
  const yBotCandidate = test.nMin ?? Infinity;
  const yTop = Math.max(yTopCandidate, dataMax) * 1.1;
  const yBot = Math.min(yBotCandidate, dataMin) * 0.9;
  const yMin = Number.isFinite(yBot) ? yBot : 0;
  const yMax = Number.isFinite(yTop) ? yTop : dataMax + 1;

  const innerWidth = Math.max(width - PADDING_X * 2, 1);
  const innerHeight = HEIGHT - PADDING_Y * 2;

  if (width <= 0) {
    return <View style={{ height: HEIGHT, backgroundColor: tokens.card2, borderRadius: 8 }} onLayout={onLayout} />;
  }

  const xScale = scaleLinear(xRange, [PADDING_X, PADDING_X + innerWidth]);
  const yScale = scaleLinear([yMin, yMax], [PADDING_Y + innerHeight, PADDING_Y]);

  const points = sorted.map((p, i) => ({
    x: xScale(new Date(p.date).getTime()),
    y: yScale(p.value),
    inRange: (test.nMin == null || p.value >= test.nMin) && (test.nMax == null || p.value <= test.nMax),
    isLatest: i === sorted.length - 1,
  }));

  const bandY1 = test.nMax != null ? yScale(test.nMax) : null;
  const bandY2 = test.nMin != null ? yScale(test.nMin) : null;
  const showBand = bandY1 != null && bandY2 != null;

  return (
    <View style={{ backgroundColor: tokens.card2, borderRadius: 8, padding: 8 }} onLayout={onLayout}>
      <Text style={{ color: tokens.text2, fontSize: 11, marginBottom: 4 }}>
        {test.name} ({test.unit}) · last {sorted.length} {sorted.length === 1 ? 'result' : 'results'}
      </Text>
      <Svg width={width - 16} height={HEIGHT}>
        {showBand ? (
          <>
            <Rect
              x={PADDING_X}
              y={Math.min(bandY1!, bandY2!)}
              width={innerWidth}
              height={Math.abs(bandY2! - bandY1!)}
              fill="#10B981"
              fillOpacity={0.15}
            />
            <Path d={`M ${PADDING_X} ${bandY1} L ${PADDING_X + innerWidth} ${bandY1}`} stroke="#EF4444" strokeWidth={1} strokeDasharray="4 4" />
            <Path d={`M ${PADDING_X} ${bandY2} L ${PADDING_X + innerWidth} ${bandY2}`} stroke="#EF4444" strokeWidth={1} strokeDasharray="4 4" />
          </>
        ) : null}
        {points.length > 1 ? (
          <Path
            d={polylinePath(points.map(({ x, y }) => ({ x, y })))}
            stroke="#0D9488"
            strokeWidth={2}
            fill="none"
          />
        ) : null}
        {points.map((p, i) => (
          <Circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={p.isLatest ? 5 : 3.5}
            fill={p.inRange ? '#0D9488' : '#EF4444'}
            stroke={p.isLatest ? 'white' : 'none'}
            strokeWidth={p.isLatest ? 2 : 0}
          />
        ))}
      </Svg>
    </View>
  );
}
