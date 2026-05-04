import { Pressable, Text, View } from 'react-native';
import { DOW_SHORT } from '@/constants/dow';
import { useTheme } from '@/lib/themeStore';
import type { ComplianceColor } from '@/lib/schedule';

export type MonthCellColor = ComplianceColor | 'future';

export interface MonthCell {
  day: number;
  dateStr: string;
  isToday: boolean;
  isFuture: boolean;
  color: MonthCellColor;
  due: number;
  taken: number;
}

interface MonthGridProps {
  cells: Array<MonthCell | null>;
  onDayPress: (dateStr: string) => void;
}

const COLOR_BG: Record<Exclude<MonthCellColor, 'future'>, string> = {
  green: '#16A34A',
  yellow: '#F59E0B',
  red: '#EF4444',
  none: 'transparent',
};

const COLOR_FG_WHITE = new Set<MonthCellColor>(['green', 'yellow', 'red']);

export default function MonthGrid({ cells, onDayPress }: MonthGridProps) {
  const { tokens } = useTheme();

  return (
    <View
      style={{
        backgroundColor: tokens.card,
        borderRadius: 13,
        padding: 11,
        borderWidth: 2,
        borderColor: tokens.border,
      }}
    >
      {/* Day-of-week header */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 7 }}>
        {DOW_SHORT.map((d) => (
          <View key={d} style={{ width: `${100 / 7}%`, padding: 4 }}>
            <Text
              style={{
                textAlign: 'center',
                fontSize: 11,
                fontWeight: '800',
                color: tokens.text2,
              }}
            >
              {d}
            </Text>
          </View>
        ))}
      </View>

      {/* Grid */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {cells.map((c, i) => {
          if (!c) {
            return (
              <View
                key={`blank-${i}`}
                style={{ width: `${100 / 7}%`, aspectRatio: 1, padding: 2 }}
              />
            );
          }

          const bg =
            c.isFuture || c.color === 'future'
              ? 'transparent'
              : c.color === 'none'
                ? tokens.card2
                : COLOR_BG[c.color];
          const textColor = COLOR_FG_WHITE.has(c.color) ? 'white' : tokens.text2;

          // Uniform 1px border on every cell so today's teal ring doesn't shrink the inner area.
          const borderWidth = 1;
          const borderColor = c.isFuture ? tokens.border : 'transparent';
          const borderStyle: 'solid' | 'dashed' = c.isFuture ? 'dashed' : 'solid';

          return (
            <View
              key={c.dateStr}
              style={{ width: `${100 / 7}%`, aspectRatio: 1, padding: 2 }}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Day ${c.day}`}
                onPress={() => onDayPress(c.dateStr)}
                style={{
                  flex: 1,
                  backgroundColor: bg,
                  borderRadius: 9,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth,
                  borderColor,
                  borderStyle,
                  opacity: c.isFuture ? 0.4 : 1,
                }}
              >
                {c.isToday ? (
                  <View
                    pointerEvents="none"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      borderRadius: 9,
                      borderWidth: 3,
                      borderColor: '#0D9488',
                    }}
                  />
                ) : null}
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: c.isToday ? '900' : '700',
                    color: textColor,
                  }}
                >
                  {c.day}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}
