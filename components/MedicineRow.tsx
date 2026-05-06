import { Pressable, Text, View } from 'react-native';
import { ChevronDown, Info, Pencil, Trash2 } from 'lucide-react-native';
import { DOW_LONG, DOW_SHORT } from '@/constants/dow';
import { SLOTS, TS_DATA } from '@/constants/slots';
import type { Medicine } from '@/lib/api';
import { formatDose } from '@/lib/schedule';
import { useTheme } from '@/lib/themeStore';

interface Props {
  med: Medicine;
  isExpanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onEdit: () => void;
}

function slotsTxt(med: Medicine): string {
  return SLOTS.filter((s) => (med.doseSchedule?.[s] ?? 0) > 0)
    .map((s) => {
      const qty = med.doseSchedule[s] ?? 0;
      const label = TS_DATA.find((x) => x.id === s)?.label ?? s;
      return `${formatDose(qty)} ${label}`;
    })
    .join(', ');
}

function describeSchedule(med: Medicine): string {
  const txt = slotsTxt(med);
  if (med.scheduleType === 'weekly' && typeof med.weekDay === 'number') {
    return `Every ${DOW_LONG[med.weekDay] ?? ''}: ${txt}`;
  }
  if (med.scheduleType === 'alternate') {
    return `Alternate days: ${txt}`;
  }
  if (med.scheduleType === 'tapering') {
    return `Tapering: ${med.taperingPhases?.length ?? 0} phases`;
  }
  if (med.excludeDays && med.excludeDays.length > 0) {
    const days = med.excludeDays
      .map((d) => DOW_SHORT[d] ?? '')
      .filter(Boolean)
      .join(', ');
    return `Daily except ${days}: ${txt}`;
  }
  return `Daily: ${txt}`;
}

interface InfoRowProps {
  label: string;
  value: string;
}

function InfoRow({ label, value }: InfoRowProps) {
  const { tokens } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingVertical: 4,
        gap: 12,
      }}
    >
      <Text
        style={{
          fontSize: 12,
          fontWeight: '700',
          color: tokens.text2,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontSize: 13,
          fontWeight: '600',
          color: tokens.text,
          flexShrink: 1,
          textAlign: 'right',
        }}
      >
        {value}
      </Text>
    </View>
  );
}

export default function MedicineRow({
  med,
  isExpanded,
  onToggle,
  onDelete,
  onEdit,
}: Props) {
  const { tokens } = useTheme();
  const barColor = med.color ?? tokens.text2;

  return (
    <View
      style={{
        backgroundColor: tokens.card,
        borderRadius: 14,
        marginBottom: 9,
        borderWidth: 2,
        borderColor: tokens.border,
        overflow: 'hidden',
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: isExpanded }}
        accessibilityLabel={`${med.drugName}, ${describeSchedule(med)}`}
        onPress={onToggle}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 9,
          paddingVertical: 12,
          paddingHorizontal: 13,
        }}
      >
        <View
          style={{
            width: 10,
            height: 46,
            borderRadius: 5,
            backgroundColor: barColor,
            flexShrink: 0,
          }}
        />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text
            style={{
              fontWeight: '800',
              fontSize: 16,
              color: tokens.text,
            }}
          >
            {med.drugName}
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: tokens.text2,
              fontWeight: '600',
              marginTop: 1,
            }}
          >
            {med.brandName} · {med.dose}
          </Text>
          <View
            style={{
              alignSelf: 'flex-start',
              marginTop: 4,
              paddingVertical: 2,
              paddingHorizontal: 7,
              backgroundColor: '#F0FDFA',
              borderRadius: 6,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                color: '#0D9488',
                fontWeight: '700',
              }}
            >
              {describeSchedule(med)}
            </Text>
          </View>
        </View>
        <View
          style={{
            transform: [{ rotate: isExpanded ? '180deg' : '0deg' }],
          }}
        >
          <ChevronDown size={17} color={tokens.text2} />
        </View>
      </Pressable>

      {isExpanded ? (
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: tokens.border,
            paddingVertical: 11,
            paddingHorizontal: 13,
            backgroundColor: tokens.card2,
          }}
        >
          <InfoRow label="Food" value={med.foodTimingLabel || '—'} />
          <InfoRow
            label="Duration"
            value={`${med.durationDays ?? '—'} days`}
          />
          <InfoRow label="Started" value={med.startDate} />
          <InfoRow label="Route" value={med.route || 'Oral'} />
          {med.reminderTime ? (
            <InfoRow label="Reminder" value={med.reminderTime} />
          ) : null}
          {med.notes ? <InfoRow label="Notes" value={med.notes} /> : null}

          {med.tip ? (
            <View
              style={{
                backgroundColor: '#FEF3C7',
                borderWidth: 1,
                borderColor: '#F59E0B',
                borderRadius: 9,
                paddingVertical: 8,
                paddingHorizontal: 11,
                marginTop: 7,
                flexDirection: 'row',
                gap: 7,
              }}
            >
              <View style={{ marginTop: 2 }}>
                <Info size={14} color="#D97706" />
              </View>
              <Text
                style={{
                  flex: 1,
                  fontSize: 12,
                  color: '#92400E',
                  fontWeight: '600',
                  lineHeight: 18,
                }}
              >
                {med.tip}
              </Text>
            </View>
          ) : null}

          <View style={{ flexDirection: 'row', gap: 8, marginTop: 9 }}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Edit ${med.drugName}`}
              onPress={onEdit}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                paddingVertical: 10,
                borderRadius: 9,
                backgroundColor: '#3B82F6',
              }}
            >
              <Pencil color="white" size={14} />
              <Text style={{ color: 'white', fontWeight: '700', fontSize: 14 }}>
                Edit
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Remove ${med.drugName}`}
              onPress={onDelete}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                paddingVertical: 10,
                borderRadius: 9,
                backgroundColor: '#FEE2E2',
              }}
            >
              <Trash2 size={14} color="#DC2626" />
              <Text style={{ color: '#DC2626', fontWeight: '700', fontSize: 14 }}>
                Remove
              </Text>
            </Pressable>
          </View>
        </View>
      ) : null}
    </View>
  );
}
