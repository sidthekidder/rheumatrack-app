import { Platform, Pressable, ScrollView, Share, Text, View } from 'react-native';
import { Share2 } from 'lucide-react-native';
import { useMedicines, useMedicationLog, usePatient, useLabReports } from '@/lib/queries';
import type { Medicine } from '@/lib/api';
import { LAB_TESTS, flagVal } from '@/constants/labs';
import { TS_DATA } from '@/constants/slots';
import { getMedsForDate, today } from '@/lib/schedule';
import { useTheme } from '@/lib/themeStore';

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
}

export function formatHealthCardForShare(input: ShareInput): string {
  const { patient, compliance, medicines, abnormalLabs, generatedAt } = input;
  const lines: string[] = [];
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
  lines.push(`Generated ${generatedAt} via RheumaTrack`);
  return lines.join('\n');
}

// ────────────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────────────

export default function HealthCard() {
  const { tokens } = useTheme();
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
  for (const report of recentLabs) {
    for (const r of report.results) {
      const test = LAB_TESTS.find((t) => t.id === r.testId);
      if (!test) continue;
      const flag = flagVal(test, r.value);
      if (flag === 'low' || flag === 'high') {
        // Avoid duplicates — only push first occurrence per testId
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
        }
      }
    }
  }

  // Schedule summary
  const scheduleSummary = (m: Medicine): string => {
    if (m.scheduleType === 'daily') return 'daily';
    if (m.scheduleType === 'weekly') return 'once weekly';
    if (m.scheduleType === 'alternate') return 'alternate days';
    if (m.scheduleType === 'tapering') return 'tapering';
    return m.scheduleType;
  };

  const onShare = async () => {
    if (!patient) return;
    const text = formatHealthCardForShare({
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
    });

    if (Platform.OS === 'web' && typeof navigator !== 'undefined') {
      if (typeof navigator.share === 'function') {
        try {
          await navigator.share({ text });
        } catch {
          /* user cancelled */
        }
        return;
      }
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        alert('Health card copied to clipboard');
        return;
      }
    }
    await Share.share({ message: text });
  };

  if (patientQ.isLoading || medsQ.isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: tokens.bg }}>
        <Text style={{ color: tokens.text2 }}>Loading…</Text>
      </View>
    );
  }
  if (!patient) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: tokens.bg, padding: 24 }}>
        <Text style={{ color: tokens.text2 }}>Complete onboarding to view your Health Card.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: tokens.bg }} contentContainerStyle={{ padding: 16 }}>
      <View style={{ backgroundColor: tokens.card, borderRadius: 16, padding: 16, marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: tokens.text, fontSize: 20, fontWeight: '800' }}>{patient.name}</Text>
            {patient.patientId ? <Text style={{ color: tokens.text2, fontSize: 13 }}>ID: {patient.patientId}</Text> : null}
          </View>
          <Pressable
            onPress={onShare}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, backgroundColor: '#0D9488' }}
          >
            <Share2 color="white" size={16} />
            <Text style={{ color: 'white', fontWeight: '700' }}>Share</Text>
          </Pressable>
        </View>
        {patient.age || patient.city ? (
          <Text style={{ color: tokens.text2, marginTop: 6, fontSize: 13 }}>
            {patient.age ? `Age ${patient.age}` : ''}
            {patient.age && (patient.city || patient.country) ? ' · ' : ''}
            {[patient.city, patient.country].filter(Boolean).join(', ')}
          </Text>
        ) : null}
        {patient.diagnosis ? (
          <Text style={{ color: tokens.text, marginTop: 8, fontSize: 14 }}>
            <Text style={{ fontWeight: '700' }}>Diagnosis: </Text>{patient.diagnosis}
          </Text>
        ) : null}
      </View>

      <View style={{ backgroundColor: tokens.card, borderRadius: 16, padding: 16, marginBottom: 16 }}>
        <Text style={{ color: tokens.text, fontWeight: '700', fontSize: 14 }}>Today's Compliance</Text>
        <Text style={{ color: '#0D9488', fontSize: 28, fontWeight: '800', marginTop: 4 }}>
          {compliancePct}%
          <Text style={{ color: tokens.text2, fontSize: 14, fontWeight: '600' }}>  ({totalTaken}/{totalDue})</Text>
        </Text>
      </View>

      {medicines.length > 0 ? (
        <View style={{ backgroundColor: tokens.card, borderRadius: 16, padding: 16, marginBottom: 16 }}>
          <Text style={{ color: tokens.text, fontWeight: '700', fontSize: 14, marginBottom: 8 }}>Current Medicines ({medicines.length})</Text>
          {medicines.map((m) => (
            <Text key={m.id} style={{ color: tokens.text, fontSize: 13, paddingVertical: 4 }}>
              • <Text style={{ fontWeight: '700' }}>{m.drugName} {m.dose}</Text> — {scheduleSummary(m)}
            </Text>
          ))}
        </View>
      ) : null}

      {abnormalLabs.length > 0 ? (
        <View style={{ backgroundColor: tokens.card, borderRadius: 16, padding: 16, marginBottom: 16 }}>
          <Text style={{ color: tokens.text, fontWeight: '700', fontSize: 14, marginBottom: 8 }}>Abnormal Labs (last 30 days)</Text>
          {abnormalLabs.map((l) => (
            <Text key={l.testKey} style={{ color: tokens.text, fontSize: 13, paddingVertical: 4 }}>
              • <Text style={{ fontWeight: '700' }}>{l.label}:</Text> {l.value}  <Text style={{ color: tokens.text2 }}>(normal {l.normalRange})</Text>
            </Text>
          ))}
        </View>
      ) : null}

      <Text style={{ color: tokens.text2, fontSize: 11, textAlign: 'center', marginTop: 8, marginBottom: 24 }}>
        Generated {todayStr} · RheumaTrack
      </Text>
    </ScrollView>
  );
}
