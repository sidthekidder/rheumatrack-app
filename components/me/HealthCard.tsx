import { useMemo } from 'react';
import {
  ActivityIndicator, Linking, Pressable, Text, View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle as SvgCircle } from 'react-native-svg';
import { Share2, Stethoscope } from 'lucide-react-native';
import { LAB_TESTS, flagBg, flagClr, flagLbl, flagVal } from '@/constants/labs';
import {
  useLabReports, useMedicationLog, useMedicines, usePatient,
} from '@/lib/queries';
import type { MedicationLogEntry } from '@/lib/api';
import { TS_DATA } from '@/constants/slots';
import { getMedsForDate, today, waPhone } from '@/lib/schedule';
import { useTheme } from '@/lib/themeStore';

export default function HealthCard() {
  const { tokens } = useTheme();
  const todayStr = useMemo(() => today(), []);

  const patientQ = usePatient();
  const medsQ = useMedicines();
  const labsQ = useLabReports();
  const logQ = useMedicationLog(todayStr, todayStr);

  const patient = patientQ.data ?? null;
  const meds = medsQ.data ?? [];
  const labs = labsQ.data ?? [];

  const log = useMemo<Record<string, boolean>>(() => {
    const out: Record<string, boolean> = {};
    for (const e of (logQ.data ?? []) as MedicationLogEntry[]) {
      out[`${e.logDate}_${e.medicineId}_${e.slot}`] = e.taken;
    }
    return out;
  }, [logQ.data]);

  const todayMeds = useMemo(
    () => getMedsForDate(meds, todayStr),
    [meds, todayStr],
  );

  const { due, taken } = useMemo(() => {
    let d = 0, t = 0;
    for (const m of todayMeds) {
      for (const slot of TS_DATA) {
        const qty = m.dosesToday[slot.id] ?? 0;
        if (qty > 0) {
          d++;
          if (log[`${todayStr}_${m.id}_${slot.id}`]) t++;
        }
      }
    }
    return { due: d, taken: t };
  }, [todayMeds, log, todayStr]);

  const pct = due > 0 ? Math.round((taken / due) * 100) : 0;
  const ringColor = pct >= 80 ? '#16A34A' : pct >= 50 ? '#F59E0B' : '#EF4444';

  const latest = useMemo(() => {
    const out: Record<string, { v: string; date: string }> = {};
    [...labs]
      .sort((a, b) => (a.reportDate < b.reportDate ? -1 : 1))
      .forEach((e) => e.results.forEach((r) => { out[r.testId] = { v: r.value, date: e.reportDate }; }));
    return out;
  }, [labs]);

  const abnormal = useMemo(
    () => LAB_TESTS.filter((t) => {
      const lv = latest[t.id];
      if (!lv) return false;
      const f = flagVal(t, lv.v);
      return f === 'low' || f === 'high';
    }).slice(0, 5),
    [latest],
  );

  const initials = (patient?.name || '?')
    .split(' ').map((n) => n[0] || '').join('').slice(0, 2).toUpperCase();

  const shareCard = () => {
    const lines = [
      '🏥 RheumaTrack Health Card',
      '━━━━━━━━━━━━━━━━━',
      `Patient: ${patient?.name || '—'}${patient?.patientId ? ` | ID: ${patient.patientId}` : ''}`,
      [patient?.age && `Age: ${patient.age}`, patient?.city].filter(Boolean).join(' | '),
      patient?.diagnosis ? `Diagnosis: ${patient.diagnosis}` : '',
      '━━━━━━━━━━━━━━━━━',
      `💊 Current Medicines (${todayMeds.length}):`,
      ...todayMeds.slice(0, 8).map((m) => `• ${m.drugName} ${m.dose}`),
      todayMeds.length > 8 ? `• +${todayMeds.length - 8} more` : '',
      '━━━━━━━━━━━━━━━━━',
      `📊 Today's Compliance: ${pct}% (${taken}/${due} doses)`,
      abnormal.length
        ? `⚠️ Abnormal Labs: ${abnormal.map((t) => `${t.name} ${latest[t.id].v}${t.unit ? ` ${t.unit}` : ''}`).join(', ')}`
        : '',
      patient?.doctorName ? `\n👨‍⚕️ Dr. ${patient.doctorName} (${patient.doctorSpecialty || 'Doctor'})` : '',
      `\nGenerated ${todayStr} via RheumaTrack`,
    ].filter(Boolean).join('\n');

    const msg = encodeURIComponent(lines);
    const url = patient?.doctorPhone
      ? `https://wa.me/${waPhone(patient.doctorPhone)}?text=${msg}`
      : `https://wa.me/?text=${msg}`;
    Linking.openURL(url).catch(() => undefined);
  };

  if (patientQ.isLoading || medsQ.isLoading) {
    return (
      <View style={{ alignItems: 'center', padding: 30 }}>
        <ActivityIndicator color="#0D9488" />
      </View>
    );
  }

  return (
    <View style={{ padding: 13 }}>
      <View style={{
        backgroundColor: tokens.card, borderRadius: 15,
        borderWidth: 2, borderColor: tokens.border, overflow: 'hidden', marginBottom: 12,
      }}>
        <LinearGradient
          colors={tokens.header.colors}
          start={tokens.header.start}
          end={tokens.header.end}
          style={{ paddingHorizontal: 15, paddingVertical: 14 }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11 }}>
            <View style={{
              width: 50, height: 50, borderRadius: 12,
              backgroundColor: 'rgba(255,255,255,0.25)',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Text style={{ fontSize: 20, fontWeight: '900', color: 'white' }}>{initials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: 'white', fontWeight: '900', fontSize: 17 }}>
                {patient?.name || 'Patient'}
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '600', marginTop: 2 }}>
                {[
                  patient?.age && `Age ${patient.age}`,
                  patient?.patientId && `ID: ${patient.patientId}`,
                  patient?.city,
                ].filter(Boolean).join(' · ') || '—'}
              </Text>
            </View>
          </View>
          {patient?.diagnosis ? (
            <View style={{
              marginTop: 9, backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, alignSelf: 'flex-start',
            }}>
              <Text style={{ color: 'white', fontWeight: '800', fontSize: 12 }}>
                🔬 {patient.diagnosis}
              </Text>
            </View>
          ) : null}
        </LinearGradient>

        <View style={{
          padding: 13, borderBottomWidth: 1, borderBottomColor: tokens.border,
          flexDirection: 'row', alignItems: 'center', gap: 12,
        }}>
          <View style={{ width: 58, height: 58 }}>
            <Svg width={58} height={58} viewBox="0 0 58 58">
              <SvgCircle cx={29} cy={29} r={24} fill="none" stroke={tokens.border} strokeWidth={5} />
              <SvgCircle
                cx={29} cy={29} r={24} fill="none" stroke={ringColor} strokeWidth={5}
                strokeDasharray={`${(pct / 100) * 150.8} 150.8`} strokeLinecap="round"
                transform="rotate(-90 29 29)"
              />
            </Svg>
            <View style={{
              position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center',
            }}>
              <Text style={{ fontWeight: '900', fontSize: 13, color: tokens.text }}>{pct}%</Text>
            </View>
          </View>
          <View>
            <Text style={{ fontWeight: '800', fontSize: 13, color: tokens.text }}>
              Today&apos;s Compliance
            </Text>
            <Text style={{ fontSize: 11, color: tokens.text2, fontWeight: '600', marginTop: 1 }}>
              {taken} of {due} doses taken
            </Text>
            <Text style={{ fontSize: 10, color: tokens.text2, marginTop: 2 }}>
              {todayMeds.length} medicine{todayMeds.length !== 1 ? 's' : ''} scheduled
            </Text>
          </View>
        </View>

        <View style={{ padding: 13, borderBottomWidth: 1, borderBottomColor: tokens.border }}>
          <Text style={{
            fontWeight: '800', fontSize: 10, color: tokens.text2, marginBottom: 7,
            textTransform: 'uppercase', letterSpacing: 0.4,
          }}>Current Medicines ({todayMeds.length})</Text>
          {todayMeds.length === 0 ? (
            <Text style={{ fontSize: 12, color: tokens.text2, fontWeight: '600' }}>
              No medicines scheduled today
            </Text>
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
              {todayMeds.map((m) => (
                <View key={m.id} style={{
                  backgroundColor: m.color || '#D1FAE5',
                  borderRadius: 7, paddingHorizontal: 8, paddingVertical: 3,
                  borderWidth: 1, borderColor: 'rgba(0,0,0,0.07)',
                }}>
                  <Text style={{ fontWeight: '800', fontSize: 11, color: '#1E293B' }}>
                    {m.drugName}
                    <Text style={{ fontWeight: '600', fontSize: 10, color: '#334155' }}> {m.dose}</Text>
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {abnormal.length > 0 ? (
          <View style={{ padding: 13, borderBottomWidth: 1, borderBottomColor: tokens.border }}>
            <Text style={{
              fontWeight: '800', fontSize: 10, color: tokens.text2, marginBottom: 7,
              textTransform: 'uppercase', letterSpacing: 0.4,
            }}>⚠️ Abnormal Labs</Text>
            {abnormal.map((t) => {
              const lv = latest[t.id];
              const f = flagVal(t, lv.v);
              return (
                <View key={t.id} style={{
                  flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4,
                }}>
                  <Text style={{ flex: 1, fontWeight: '700', fontSize: 12, color: tokens.text }}>
                    {t.name}
                  </Text>
                  <Text style={{ fontWeight: '900', fontSize: 13, color: flagClr(f) }}>
                    {lv.v}{t.unit ? ` ${t.unit}` : ''}
                  </Text>
                  <View style={{
                    backgroundColor: flagBg(f), borderWidth: 1, borderColor: flagClr(f),
                    borderRadius: 5, paddingHorizontal: 6, paddingVertical: 1,
                  }}>
                    <Text style={{ fontSize: 10, fontWeight: '800', color: flagClr(f) }}>
                      {flagLbl(f)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        ) : null}

        {patient?.doctorName ? (
          <View style={{
            padding: 12, flexDirection: 'row', alignItems: 'center', gap: 8,
          }}>
            <Stethoscope size={15} color="#0D9488" />
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '800', fontSize: 12, color: tokens.text }}>
                {patient.doctorName}
              </Text>
              <Text style={{ fontSize: 10, color: tokens.text2, fontWeight: '600' }}>
                {patient.doctorSpecialty}
                {patient.doctorHospital ? ` · ${patient.doctorHospital}` : ''}
              </Text>
            </View>
          </View>
        ) : null}
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={shareCard}
        style={{
          backgroundColor: '#25D366', borderRadius: 12, padding: 13,
          flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
          marginBottom: 10,
        }}>
        <Share2 size={18} color="white" />
        <Text style={{ color: 'white', fontWeight: '900', fontSize: 15 }}>
          Share Health Card via WhatsApp
        </Text>
      </Pressable>
      <Text style={{ fontSize: 11, color: tokens.text2, textAlign: 'center', fontWeight: '600' }}>
        Sends name, medicines, compliance and abnormal labs — no typing needed
      </Text>
    </View>
  );
}
