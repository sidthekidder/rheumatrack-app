import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MessageCircle, Stethoscope } from 'lucide-react-native';
import Svg, { Circle } from 'react-native-svg';
import { useMedicines, useMedicationLog, usePatient, useLabReports } from '@/lib/queries';
import type { Medicine } from '@/lib/api';
import { LAB_TESTS, flagVal } from '@/constants/labs';
import { TS_DATA } from '@/constants/slots';
import { getMedsForDate, today, waPhone } from '@/lib/schedule';
import { useTheme } from '@/lib/themeStore';
import { useT } from '@/lib/i18n/useT';

// ────────────────────────────────────────────────────────────────────
// Pure helpers (unit-testable)
// ────────────────────────────────────────────────────────────────────

export interface AbnormalLabFlag {
  testKey: string;
  label: string;
  value: string;
  normalRange: string;
}

export interface ShareInput {
  patient: {
    name: string;
    patientId: string | null;
    age: number | null;
    city: string | null;
    country: string | null;
    diagnosis: string | null;
  };
  compliance: { taken: number; total: number; pct: number };
  medicines: Array<{ drugName: string; dose: string; scheduleSummary: string }>;
  abnormalLabs: AbnormalLabFlag[];
  generatedAt: string;
  forWhatsApp?: boolean;
  doctorName?: string | null;
}

export function formatHealthCardForShare(input: ShareInput): string {
  const { patient, compliance, medicines, abnormalLabs, generatedAt, forWhatsApp, doctorName } = input;
  const lines: string[] = [];

  if (forWhatsApp && doctorName) {
    lines.push(`Hello ${doctorName},`);
    lines.push('');
  }

  lines.push('RheumaTrack Health Card');
  lines.push(`Patient: ${patient.name}${patient.patientId ? ` (ID: ${patient.patientId})` : ''}`);
  if (patient.age) {
    const loc = [patient.city, patient.country].filter(Boolean).join(', ');
    lines.push(`Age: ${patient.age}${loc ? ` · ${loc}` : ''}`);
  }
  if (patient.diagnosis) lines.push(`Diagnosis: ${patient.diagnosis}`);
  lines.push('');
  lines.push(`Today's Compliance: ${compliance.pct}% (${compliance.taken}/${compliance.total})`);
  lines.push('');
  if (medicines.length > 0) {
    lines.push('Medicines:');
    for (const m of medicines) lines.push(`- ${m.drugName} ${m.dose} — ${m.scheduleSummary}`);
    lines.push('');
  }
  if (abnormalLabs.length > 0) {
    lines.push('Abnormal Labs:');
    for (const l of abnormalLabs) lines.push(`- ${l.label}: ${l.value} (normal ${l.normalRange})`);
    lines.push('');
  }
  if (!forWhatsApp) {
    lines.push(`Generated ${generatedAt} via RheumaTrack`);
  }
  return lines.join('\n');
}

// ────────────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────────────

const RING_R = 24;
const RING_C = 2 * Math.PI * RING_R;

function ringColor(pct: number): string {
  if (pct >= 80) return '#16A34A';
  if (pct >= 50) return '#F59E0B';
  return '#EF4444';
}

function flagBg(flag: 'low' | 'high' | 'normal'): string {
  return flag === 'high' ? '#FEE2E2' : flag === 'low' ? '#FEF3C7' : '#DCFCE7';
}
function flagBorder(flag: 'low' | 'high' | 'normal'): string {
  return flag === 'high' ? '#DC2626' : flag === 'low' ? '#D97706' : '#16A34A';
}

export default function HealthCard() {
  const { tokens } = useTheme();
  const t = useT();
  const todayStr = today();
  const patientQ = usePatient();
  const medsQ = useMedicines();
  const logQ = useMedicationLog(todayStr, todayStr);
  const labsQ = useLabReports();

  const patient = patientQ.data ?? null;
  const medicines = medsQ.data ?? [];
  const log = logQ.data ?? [];
  const labs = labsQ.data ?? [];

  // Compute today's compliance
  const todayMeds = getMedsForDate(medicines, todayStr);
  let totalDue = 0;
  let totalTaken = 0;
  const logSet = new Set<string>();
  for (const entry of log) {
    if (entry.taken) logSet.add(`${entry.logDate}_${entry.medicineId}_${entry.slot}`);
  }
  for (const m of todayMeds) {
    for (const slot of TS_DATA) {
      const qty = m.dosesToday[slot.id] ?? 0;
      if (qty > 0) {
        totalDue++;
        if (logSet.has(`${todayStr}_${m.id}_${slot.id}`)) totalTaken++;
      }
    }
  }
  const compliancePct = totalDue > 0 ? Math.round((totalTaken / totalDue) * 100) : 0;

  // Compute abnormal labs (last 30 days)
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const recentLabs = labs.filter((r) => r.reportDate >= cutoff);
  const abnormalLabs: AbnormalLabFlag[] = [];
  const abnormalDisplay: Array<{ testKey: string; label: string; value: string; flag: 'low' | 'high' }> = [];
  for (const report of recentLabs) {
    for (const r of report.results) {
      const test = LAB_TESTS.find((tt) => tt.id === r.testId);
      if (!test) continue;
      const flag = flagVal(test, r.value);
      if (flag === 'low' || flag === 'high') {
        if (!abnormalLabs.some((a) => a.testKey === r.testId)) {
          const normalRange =
            test.nMin !== null && test.nMax !== null
              ? `${test.nMin}–${test.nMax} ${test.unit}`
              : test.nMin !== null
              ? `>${test.nMin} ${test.unit}`
              : test.nMax !== null
              ? `<${test.nMax} ${test.unit}`
              : '';
          abnormalLabs.push({
            testKey: r.testId,
            label: test.name,
            value: `${r.value} ${test.unit}`.trim(),
            normalRange,
          });
          abnormalDisplay.push({
            testKey: r.testId,
            label: test.name,
            value: `${r.value}${test.unit ? ` ${test.unit}` : ''}`,
            flag,
          });
        }
      }
    }
  }

  const scheduleSummary = (m: Medicine): string => {
    if (m.scheduleType === 'daily') return 'daily';
    if (m.scheduleType === 'weekly') return 'once weekly';
    if (m.scheduleType === 'alternate') return 'alternate days';
    if (m.scheduleType === 'tapering') return 'tapering';
    return m.scheduleType;
  };

  if (patientQ.isLoading || medsQ.isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: tokens.bg }}>
        <Text style={{ color: tokens.text2 }}>{t('loading')}</Text>
      </View>
    );
  }
  if (!patient) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: tokens.bg, padding: 24 }}>
        <Text style={{ color: tokens.text2 }}>{t('complete_onboarding')}</Text>
      </View>
    );
  }

  const initials = (patient.name || '?').split(' ').map((n) => n[0] ?? '').join('').slice(0, 2).toUpperCase();
  const subParts = [
    patient.age ? `${t('age')} ${patient.age}` : null,
    patient.patientId ? `ID: ${patient.patientId}` : null,
    patient.city ?? null,
  ].filter(Boolean);

  const shareText = formatHealthCardForShare({
    patient: {
      name: patient.name,
      patientId: patient.patientId ?? null,
      age: patient.age ?? null,
      city: patient.city ?? null,
      country: patient.country ?? null,
      diagnosis: patient.diagnosis ?? null,
    },
    compliance: { taken: totalTaken, total: totalDue, pct: compliancePct },
    medicines: medicines.map((m) => ({
      drugName: m.drugName,
      dose: m.dose,
      scheduleSummary: scheduleSummary(m),
    })),
    abnormalLabs,
    generatedAt: todayStr,
    forWhatsApp: true,
    doctorName: patient.doctorName ?? null,
  });

  const onShare = () => {
    const encoded = encodeURIComponent(shareText);
    const url = patient.doctorPhone
      ? `https://wa.me/${waPhone(patient.doctorPhone)}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;
    Linking.openURL(url);
  };

  const ring = ringColor(compliancePct);
  const ringDash = (compliancePct / 100) * RING_C;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: tokens.bg }} contentContainerStyle={{ padding: 12 }}>
      <View
        style={{
          backgroundColor: tokens.card,
          borderRadius: 15,
          borderWidth: 2,
          borderColor: tokens.border,
          overflow: 'hidden',
          marginBottom: 12,
        }}
      >
        {/* Gradient header */}
        <LinearGradient
          colors={['#0D9488', '#0284C7']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ padding: 15, paddingBottom: 13 }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11 }}>
            <View
              style={{
                width: 50, height: 50, borderRadius: 12,
                backgroundColor: 'rgba(255,255,255,0.25)',
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 20, fontWeight: '900', color: 'white' }}>{initials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: 'white', fontWeight: '900', fontSize: 17 }}>{patient.name}</Text>
              {subParts.length > 0 ? (
                <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 11, fontWeight: '600', marginTop: 2 }}>
                  {subParts.join(' · ')}
                </Text>
              ) : null}
            </View>
          </View>
          {patient.diagnosis ? (
            <View
              style={{
                marginTop: 9, alignSelf: 'flex-start',
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: 8, paddingVertical: 5, paddingHorizontal: 10,
              }}
            >
              <Text style={{ color: 'white', fontWeight: '800', fontSize: 12 }}>🔬 {patient.diagnosis}</Text>
            </View>
          ) : null}
        </LinearGradient>

        {/* Compliance row */}
        <View
          style={{
            flexDirection: 'row', alignItems: 'center', gap: 12,
            paddingVertical: 12, paddingHorizontal: 14,
            borderBottomWidth: 1, borderBottomColor: tokens.border,
          }}
        >
          <View style={{ width: 58, height: 58 }}>
            <Svg width={58} height={58} viewBox="0 0 58 58">
              <Circle cx={29} cy={29} r={RING_R} fill="none" stroke={tokens.border} strokeWidth={5} />
              <Circle
                cx={29} cy={29} r={RING_R} fill="none"
                stroke={ring} strokeWidth={5}
                strokeDasharray={`${ringDash} ${RING_C}`}
                strokeLinecap="round"
                transform="rotate(-90 29 29)"
              />
            </Svg>
            <View
              style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Text style={{ fontWeight: '900', fontSize: 13, color: tokens.text }}>{compliancePct}%</Text>
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: '800', fontSize: 13, color: tokens.text }}>{t('todays_compliance')}</Text>
            <Text style={{ fontSize: 11, color: tokens.text2, fontWeight: '600', marginTop: 1 }}>
              {t('doses_taken_of', { taken: totalTaken, due: totalDue })}
            </Text>
            <Text style={{ fontSize: 10, color: tokens.text2, marginTop: 2 }}>
              {todayMeds.length === 0
                ? t('no_medicines_scheduled_today')
                : todayMeds.length === 1
                ? t('medicine_scheduled_singular')
                : t('medicines_scheduled', { n: todayMeds.length })}
            </Text>
          </View>
        </View>

        {/* Current Medicines */}
        <View
          style={{
            paddingVertical: 11, paddingHorizontal: 14,
            borderBottomWidth: 1, borderBottomColor: tokens.border,
          }}
        >
          <Text
            style={{
              fontWeight: '800', fontSize: 10, color: tokens.text2,
              marginBottom: 7, textTransform: 'uppercase', letterSpacing: 0.4,
            }}
          >
            {t('current_medicines')} ({todayMeds.length})
          </Text>
          {todayMeds.length === 0 ? (
            <Text style={{ fontSize: 12, color: tokens.text2, fontWeight: '600' }}>
              {t('no_meds_today')}
            </Text>
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
              {todayMeds.map((m) => (
                <View
                  key={m.id}
                  style={{
                    backgroundColor: m.color ?? '#E2E8F0',
                    borderRadius: 7,
                    paddingVertical: 3, paddingHorizontal: 8,
                    borderWidth: 1, borderColor: 'rgba(0,0,0,0.07)',
                  }}
                >
                  <Text style={{ fontSize: 11, color: '#1E293B' }}>
                    <Text style={{ fontWeight: '800' }}>{m.drugName}</Text>
                    <Text style={{ fontWeight: '600', fontSize: 10, color: '#334155' }}>  {m.dose}</Text>
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Abnormal Labs (conditional) */}
        {abnormalDisplay.length > 0 ? (
          <View
            style={{
              paddingVertical: 11, paddingHorizontal: 14,
              borderBottomWidth: 1, borderBottomColor: tokens.border,
            }}
          >
            <Text
              style={{
                fontWeight: '800', fontSize: 10, color: tokens.text2,
                marginBottom: 7, textTransform: 'uppercase', letterSpacing: 0.4,
              }}
            >
              ⚠️ {t('abnormal_labs_30')}
            </Text>
            {abnormalDisplay.map((l) => (
              <View
                key={l.testKey}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}
              >
                <Text style={{ fontWeight: '700', fontSize: 12, color: tokens.text, flex: 1 }}>{l.label}</Text>
                <Text style={{ fontWeight: '900', fontSize: 13, color: flagBorder(l.flag) }}>{l.value}</Text>
                <View
                  style={{
                    backgroundColor: flagBg(l.flag),
                    borderWidth: 1,
                    borderColor: flagBorder(l.flag),
                    borderRadius: 5,
                    paddingVertical: 1,
                    paddingHorizontal: 6,
                  }}
                >
                  <Text style={{ fontSize: 10, fontWeight: '800', color: flagBorder(l.flag) }}>
                    {l.flag.toUpperCase()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : null}

        {/* Doctor row */}
        {patient.doctorName ? (
          <View style={{ paddingVertical: 10, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Stethoscope size={15} color="#0D9488" />
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '800', fontSize: 12, color: tokens.text }}>{patient.doctorName}</Text>
              <Text style={{ fontSize: 10, color: tokens.text2, fontWeight: '600' }}>
                {[patient.doctorSpecialty, patient.doctorHospital].filter(Boolean).join(' · ')}
              </Text>
            </View>
          </View>
        ) : null}
      </View>

      {/* Big WhatsApp share button */}
      <Pressable
        onPress={onShare}
        accessibilityRole="button"
        style={{
          backgroundColor: '#25D366',
          borderRadius: 12,
          paddingVertical: 13,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          marginBottom: 10,
        }}
      >
        <MessageCircle color="white" size={18} />
        <Text style={{ color: 'white', fontWeight: '900', fontSize: 15 }}>{t('share_health_card')}</Text>
      </Pressable>
      <Text style={{ fontSize: 11, color: tokens.text2, textAlign: 'center', fontWeight: '600', marginBottom: 24 }}>
        {t('sends_health_card_hint')}
      </Text>
    </ScrollView>
  );
}
