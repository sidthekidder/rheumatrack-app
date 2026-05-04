import { SLOTS } from '@/constants/slots';

export type SlotId = 'morning' | 'afternoon' | 'evening' | 'night';
export type ScheduleType = 'daily' | 'weekly' | 'alternate' | 'tapering';

export type DoseSchedule = {
  morning: number;
  afternoon: number;
  evening: number;
  night: number;
};

export type TaperingPhase = { days: number; doseSchedule: DoseSchedule };

export interface Medicine {
  id: string;
  patientId: string;
  drugName: string;
  brandName: string;
  dose: string;
  scheduleType: ScheduleType;
  doseSchedule: DoseSchedule;
  weekDay?: number | null;
  excludeDays?: number[];
  taperingPhases?: TaperingPhase[] | null;
  startDate: string; // "YYYY-MM-DD"
  durationDays?: number | null;
  foodTimingId?: string | null;
  foodTimingLabel?: string | null;
  reminderTime?: string | null;
  route?: string | null;
  tip?: string | null;
  notes?: string | null;
  color?: string | null;
}

export type MedicationLog = Record<string, boolean>; // key: `${dateStr}_${medId}_${slot}`

export type ComplianceColor = 'none' | 'green' | 'yellow' | 'red';
export interface DayCompliance {
  color: ComplianceColor;
  due: number;
  taken: number;
}
export interface MedWithDoses extends Medicine {
  dosesToday: DoseSchedule;
}

// --- Date / formatting helpers ---

export const today = (): string => new Date().toISOString().split('T')[0];

export const fromStr = (s: string): Date => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const daysBetween = (a: string, b: string): number =>
  Math.floor((fromStr(b).getTime() - fromStr(a).getTime()) / 86400000);

export const waPhone = (p: string): string => {
  let n = p.replace(/\D/g, '');
  if (n.length === 10) n = '91' + n;
  else if (n.startsWith('0')) n = '91' + n.slice(1);
  return n;
};

export const greet = (): string => {
  const h = new Date().getHours();
  return h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening';
};

export const formatDose = (n: number): string =>
  n === 1 ? '1 tab' : n === 0.5 ? '½ tab' : n === 1.5 ? '1½ tab' : `${n} tabs`;

export const formatDoseShort = (n: number): string =>
  n === 0.5 ? '½' : n === 1.5 ? '1½' : `${n}`;

// --- Schedule resolver ---

export function getDosesForDate(med: Medicine, ds: string): DoseSchedule | null {
  if (!med.startDate) return null;
  const days = daysBetween(med.startDate, ds);
  if (days < 0) return null;
  if (med.scheduleType !== 'tapering' && med.durationDays && days >= med.durationDays) return null;
  const dow = fromStr(ds).getDay();
  switch (med.scheduleType) {
    case 'weekly':
      return dow !== med.weekDay ? null : med.doseSchedule;
    case 'alternate':
      return days % 2 !== 0 ? null : med.doseSchedule;
    case 'tapering': {
      let cum = 0;
      for (const ph of med.taperingPhases || []) {
        if (days < cum + ph.days) return ph.doseSchedule;
        cum += ph.days;
      }
      return null;
    }
    default:
      return med.excludeDays?.includes(dow) ? null : med.doseSchedule;
  }
}

export function getDayCompliance(
  meds: Medicine[],
  log: MedicationLog,
  ds: string
): DayCompliance {
  let due = 0;
  let taken = 0;
  for (const med of meds) {
    const doses = getDosesForDate(med, ds);
    if (!doses) continue;
    for (const slot of SLOTS) {
      if ((doses[slot] || 0) > 0) {
        due++;
        if (log[`${ds}_${med.id}_${slot}`]) taken++;
      }
    }
  }
  if (due === 0) return { color: 'none', due, taken };
  if (taken === due) return { color: 'green', due, taken };
  if (taken === 0) return { color: 'red', due, taken };
  return { color: 'yellow', due, taken };
}

export function getMedsForDate(meds: Medicine[], ds: string): MedWithDoses[] {
  return meds
    .map((m): MedWithDoses | null => {
      const doses = getDosesForDate(m, ds);
      if (!doses) return null;
      return { ...m, dosesToday: doses };
    })
    .filter((m): m is MedWithDoses => m !== null);
}
