import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Check, ChevronDown } from 'lucide-react-native';
import { DIET, type DietItem, type DiseaseTip } from '@/constants/diet';
import { useTheme } from '@/lib/themeStore';

type MainTab = 'eat' | 'avoid' | 'disease';

const TABS: ReadonlyArray<{ id: MainTab; emoji: string; label: string }> = [
  { id: 'eat', emoji: '🥗', label: 'Eat' },
  { id: 'avoid', emoji: '🚫', label: 'Avoid' },
  { id: 'disease', emoji: '🏥', label: 'Disease' },
];

export default function DietScreen() {
  const { tokens } = useTheme();
  const [openItem, setOpenItem] = useState<string | null>(null);
  const [openDisease, setOpenDisease] = useState<number | null>(null);
  const [mainTab, setMainTab] = useState<MainTab>('eat');

  return (
    <SafeAreaView
      edges={['left', 'right', 'bottom']}
      style={{ flex: 1, backgroundColor: tokens.bg }}
    >
      <StatusBar style="light" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Gradient header */}
        <LinearGradient
          colors={tokens.header.colors}
          start={tokens.header.start}
          end={tokens.header.end}
          style={{ paddingTop: 22, paddingHorizontal: 18, paddingBottom: 16 }}
        >
          <Text style={{ fontSize: 22, fontWeight: '900', color: 'white' }}>
            🥗 Diet Guide
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: 'white',
              opacity: 0.85,
              marginTop: 2,
            }}
          >
            For Autoimmune & Inflammatory Conditions
          </Text>
        </LinearGradient>

        {/* Segmented control */}
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: tokens.card,
            borderBottomWidth: 1,
            borderBottomColor: tokens.border,
          }}
        >
          {TABS.map((t) => {
            const active = mainTab === t.id;
            return (
              <Pressable
                key={t.id}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={t.label}
                onPress={() => setMainTab(t.id)}
                style={{
                  flex: 1,
                  paddingVertical: 11,
                  paddingHorizontal: 4,
                  alignItems: 'center',
                  gap: 1,
                  borderBottomWidth: 3,
                  borderBottomColor: active ? '#0D9488' : 'transparent',
                }}
              >
                <Text style={{ fontSize: 16 }}>{t.emoji}</Text>
                <Text
                  style={{
                    fontWeight: '700',
                    fontSize: 13,
                    color: active ? '#0D9488' : tokens.text2,
                  }}
                >
                  {t.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={{ padding: 13 }}>
          {mainTab === 'eat' ? (
            <>
              <Callout
                bg="#F0FDF4"
                border="#86EFAC"
                fg="#166534"
                title="🌿 Anti-Inflammatory Principles"
                body="Focus on whole, colourful foods. Cook at home, use good oils, add turmeric and ginger daily."
              />
              {DIET.eat.map((item, i) => (
                <ItemAccordion
                  key={`e${i}`}
                  item={item}
                  isOpen={openItem === `e${i}`}
                  onToggle={() =>
                    setOpenItem(openItem === `e${i}` ? null : `e${i}`)
                  }
                  tokens={tokens}
                />
              ))}
            </>
          ) : null}

          {mainTab === 'avoid' ? (
            <>
              <Callout
                bg="#FEF2F2"
                border="#FCA5A5"
                fg="#991B1B"
                title="⚠️ Critical Warning"
                body="On Methotrexate, Leflunomide or JAK inhibitors — alcohol is ABSOLUTELY contraindicated."
              />
              {DIET.avoid.map((item, i) => (
                <ItemAccordion
                  key={`a${i}`}
                  item={item}
                  isOpen={openItem === `a${i}`}
                  onToggle={() =>
                    setOpenItem(openItem === `a${i}` ? null : `a${i}`)
                  }
                  tokens={tokens}
                />
              ))}
            </>
          ) : null}

          {mainTab === 'disease' ? (
            <>
              <Callout
                bg={tokens.card2}
                border={tokens.border}
                fg={tokens.text}
                bodyFg={tokens.text2}
                title="🏥 Personalised Diet"
                body="Tap your condition for specific tips. Always follow your doctor's advice."
              />
              {DIET.diseases.map((d, i) => (
                <DiseaseAccordion
                  key={i}
                  disease={d}
                  isOpen={openDisease === i}
                  onToggle={() =>
                    setOpenDisease(openDisease === i ? null : i)
                  }
                  tokens={tokens}
                />
              ))}
            </>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

interface CalloutProps {
  bg: string;
  border: string;
  fg: string;
  bodyFg?: string;
  title: string;
  body: string;
}

function Callout({ bg, border, fg, bodyFg, title, body }: CalloutProps) {
  return (
    <View
      style={{
        backgroundColor: bg,
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 12,
        marginBottom: 11,
        borderWidth: 2,
        borderColor: border,
      }}
    >
      <Text
        style={{
          fontWeight: '800',
          color: fg,
          fontSize: 13,
          marginBottom: 3,
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          fontSize: 12,
          color: bodyFg ?? fg,
          lineHeight: 18,
        }}
      >
        {body}
      </Text>
    </View>
  );
}

interface ItemAccordionProps {
  item: DietItem;
  isOpen: boolean;
  onToggle: () => void;
  tokens: ReturnType<typeof useTheme>['tokens'];
}

function ItemAccordion({ item, isOpen, onToggle, tokens }: ItemAccordionProps) {
  return (
    <View
      style={{
        backgroundColor: tokens.card,
        borderRadius: 11,
        marginBottom: 6,
        borderWidth: 2,
        borderColor: tokens.border,
        overflow: 'hidden',
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: isOpen }}
        accessibilityLabel={item.name}
        onPress={onToggle}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          paddingVertical: 10,
          paddingHorizontal: 12,
        }}
      >
        <Text style={{ fontSize: 20 }}>{item.icon}</Text>
        <Text
          style={{
            fontWeight: '700',
            fontSize: 14,
            color: tokens.text,
            flex: 1,
          }}
        >
          {item.name}
        </Text>
        <ChevronDown
          size={15}
          color={tokens.text2}
          style={{ transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }}
        />
      </Pressable>
      {isOpen ? (
        <View
          style={{
            paddingHorizontal: 12,
            paddingBottom: 10,
            paddingTop: 8,
            borderTopWidth: 1,
            borderTopColor: tokens.border,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              color: tokens.text2,
              lineHeight: 18,
              fontWeight: '600',
            }}
          >
            {item.detail}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

interface DiseaseAccordionProps {
  disease: DiseaseTip;
  isOpen: boolean;
  onToggle: () => void;
  tokens: ReturnType<typeof useTheme>['tokens'];
}

function DiseaseAccordion({
  disease,
  isOpen,
  onToggle,
  tokens,
}: DiseaseAccordionProps) {
  return (
    <View
      style={{
        backgroundColor: tokens.card,
        borderRadius: 13,
        marginBottom: 8,
        borderWidth: 2,
        borderColor: isOpen ? disease.border : tokens.border,
        overflow: 'hidden',
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: isOpen }}
        accessibilityLabel={disease.disease}
        onPress={onToggle}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          paddingVertical: 12,
          paddingHorizontal: 12,
          backgroundColor: isOpen ? disease.color : 'transparent',
        }}
      >
        <Text style={{ fontSize: 22 }}>{disease.icon}</Text>
        <Text
          style={{
            fontWeight: '800',
            fontSize: 14,
            color: tokens.text,
            flex: 1,
          }}
        >
          {disease.disease}
        </Text>
        <ChevronDown
          size={16}
          color={tokens.text2}
          style={{ transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }}
        />
      </Pressable>
      {isOpen ? (
        <View
          style={{
            paddingTop: 8,
            paddingBottom: 12,
            paddingHorizontal: 12,
            backgroundColor: disease.color,
          }}
        >
          {disease.tips.map((tip, j) => (
            <View
              key={j}
              style={{
                flexDirection: 'row',
                gap: 7,
                marginBottom: 6,
                alignItems: 'flex-start',
              }}
            >
              <View
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 50,
                  backgroundColor: disease.border,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 1,
                }}
              >
                <Check size={10} color="white" />
              </View>
              <Text
                style={{
                  flex: 1,
                  fontSize: 12,
                  color: tokens.text,
                  lineHeight: 18,
                  fontWeight: '600',
                }}
              >
                {tip}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}
