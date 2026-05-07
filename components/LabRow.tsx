import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import LineGraph from '@/components/charts/LineGraph';
import type { LabTest } from '@/constants/labs';
import { flagBg, flagClr, flagLbl, flagVal } from '@/constants/labs';
import { useTheme } from '@/lib/themeStore';

interface Props {
  test: LabTest;
  latestValue: string | null;
  history: Array<{ date: string; value: number }>;
}

export default function LabRow({ test, latestValue, history }: Props) {
  const { tokens } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const flag = latestValue ? flagVal(test, latestValue) : 'none';

  return (
    <Pressable
      onPress={() => setExpanded((e) => !e)}
      style={{
        backgroundColor: tokens.card,
        borderRadius: 8,
        padding: 12,
        marginBottom: 6,
        borderWidth: 1,
        borderColor: tokens.border,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Text style={{ color: tokens.text, fontWeight: '700', flex: 1 }}>{test.name}</Text>
        {latestValue ? (
          <View
            style={{
              backgroundColor: flagBg(flag),
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 6,
            }}
          >
            <Text style={{ color: flagClr(flag), fontWeight: '700', fontSize: 12 }}>
              {latestValue}
              {test.unit ? ` ${test.unit}` : ''}
              {flag !== 'normal' && flag !== 'qual' && flag !== 'none' ? ` (${flagLbl(flag)})` : ''}
            </Text>
          </View>
        ) : (
          <Text style={{ color: tokens.text2, fontSize: 12 }}>—</Text>
        )}
        {expanded ? <ChevronUp color={tokens.text2} size={16} /> : <ChevronDown color={tokens.text2} size={16} />}
      </View>
      {test.nMin != null && test.nMax != null ? (
        <Text style={{ color: tokens.text2, fontSize: 11, marginTop: 2 }}>
          Normal: {test.nMin}–{test.nMax}{test.unit ? ` ${test.unit}` : ''}
        </Text>
      ) : null}
      {expanded ? (
        <View style={{ marginTop: 10 }}>
          <LineGraph test={test} results={history} />
        </View>
      ) : null}
    </Pressable>
  );
}
