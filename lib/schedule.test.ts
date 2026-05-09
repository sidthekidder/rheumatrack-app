import {
  canEditLogForDate,
  daysBetween,
  filterHistoryForDate,
  formatDose,
  formatDoseShort,
  waPhone,
  getDosesForDate,
  getDayCompliance,
  getMedsForDate,
  today,
  greet,
  fromStr,
  type Medicine,
  type MedicationLog,
  type DoseSchedule,
} from './schedule';
import type { MedicationLogHistoryEntry } from './api';

// 2026-01-01 is a Thursday (dow = 4). All test dates anchor to this.
const START = '2026-01-01'; // Thu
const DAY_1 = '2026-01-02'; // Fri (dow=5)
const DAY_2 = '2026-01-03'; // Sat (dow=6)
const DAY_3 = '2026-01-04'; // Sun (dow=0)
const DAY_4 = '2026-01-05'; // Mon (dow=1)
const BEFORE = '2025-12-31';

const makeMed = (overrides: Partial<Medicine> = {}): Medicine => ({
  id: 'med-1',
  patientId: 'patient-1',
  drugName: 'Test Drug',
  brandName: 'TestBrand',
  dose: '10mg',
  scheduleType: 'daily',
  doseSchedule: { morning: 1, afternoon: 0, evening: 0, night: 0 },
  startDate: START,
  ...overrides,
});

describe('today', () => {
  it('returns ISO YYYY-MM-DD for current date', () => {
    expect(today()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
  it('returns local-date YYYY-MM-DD (not UTC) for given system time', () => {
    // Local 2:30 PM on May 15, 2026 — local-date string must reflect that.
    jest.useFakeTimers().setSystemTime(new Date(2026, 4, 15, 14, 30));
    try {
      expect(today()).toBe('2026-05-15');
    } finally {
      jest.useRealTimers();
    }
  });
});

describe('fromStr', () => {
  it('parses YYYY-MM-DD into a local Date', () => {
    const d = fromStr('2026-01-01');
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(0);
    expect(d.getDate()).toBe(1);
    expect(d.getDay()).toBe(4); // Thursday
  });
});

describe('daysBetween', () => {
  it('returns 0 for same date', () => {
    expect(daysBetween('2026-01-01', '2026-01-01')).toBe(0);
  });
  it('returns positive when b after a', () => {
    expect(daysBetween('2026-01-01', '2026-01-05')).toBe(4);
  });
  it('returns negative when b before a', () => {
    expect(daysBetween('2026-01-05', '2026-01-01')).toBe(-4);
  });
});

describe('formatDose', () => {
  it('1 -> "1 tab"', () => expect(formatDose(1)).toBe('1 tab'));
  it('0.5 -> "½ tab"', () => expect(formatDose(0.5)).toBe('½ tab'));
  it('1.5 -> "1½ tab"', () => expect(formatDose(1.5)).toBe('1½ tab'));
  it('2 -> "2 tabs"', () => expect(formatDose(2)).toBe('2 tabs'));
  it('0 -> "0 tabs"', () => expect(formatDose(0)).toBe('0 tabs'));
});

describe('formatDoseShort', () => {
  it('0.5 -> "½"', () => expect(formatDoseShort(0.5)).toBe('½'));
  it('1.5 -> "1½"', () => expect(formatDoseShort(1.5)).toBe('1½'));
  it('2 -> "2"', () => expect(formatDoseShort(2)).toBe('2'));
});

describe('waPhone', () => {
  it('10-digit number gets 91 prefix', () => {
    expect(waPhone('9876543210')).toBe('919876543210');
  });
  it('leading 0 is stripped and 91 prefixed', () => {
    expect(waPhone('09876543210')).toBe('919876543210');
  });
  it('strips spaces and dashes', () => {
    expect(waPhone('+91 98765-43210')).toBe('919876543210');
  });
});

describe('greet', () => {
  it('returns one of the greetings', () => {
    expect(['Good Morning', 'Good Afternoon', 'Good Evening']).toContain(greet());
  });
});

describe('getDosesForDate', () => {
  describe('daily', () => {
    it('returns null before startDate', () => {
      const med = makeMed();
      expect(getDosesForDate(med, BEFORE)).toBeNull();
    });
    it('returns doseSchedule on startDate', () => {
      const med = makeMed();
      expect(getDosesForDate(med, START)).toEqual(med.doseSchedule);
    });
    it('returns doseSchedule after startDate', () => {
      const med = makeMed();
      expect(getDosesForDate(med, DAY_3)).toEqual(med.doseSchedule);
    });
    it('respects excludeDays', () => {
      // Exclude Friday (dow=5) — DAY_1 is Friday
      const med = makeMed({ excludeDays: [5] });
      expect(getDosesForDate(med, DAY_1)).toBeNull();
      expect(getDosesForDate(med, START)).toEqual(med.doseSchedule); // Thu, not excluded
    });
    it('returns null on day == durationDays', () => {
      const med = makeMed({ durationDays: 3 });
      // days 0,1,2 active; day 3 inactive (>= durationDays)
      expect(getDosesForDate(med, START)).toEqual(med.doseSchedule); // day 0
      expect(getDosesForDate(med, DAY_2)).toEqual(med.doseSchedule); // day 2
      expect(getDosesForDate(med, DAY_3)).toBeNull(); // day 3
    });
  });

  describe('weekly', () => {
    it('returns doseSchedule only on weekDay', () => {
      // weekDay = 0 (Sunday). DAY_3 = Sun.
      const med = makeMed({ scheduleType: 'weekly', weekDay: 0 });
      expect(getDosesForDate(med, DAY_3)).toEqual(med.doseSchedule);
      expect(getDosesForDate(med, START)).toBeNull(); // Thu
      expect(getDosesForDate(med, DAY_1)).toBeNull(); // Fri
    });
  });

  describe('alternate', () => {
    it('returns doseSchedule on day 0, 2, 4 — null on 1, 3', () => {
      const med = makeMed({ scheduleType: 'alternate' });
      expect(getDosesForDate(med, START)).toEqual(med.doseSchedule); // day 0
      expect(getDosesForDate(med, DAY_1)).toBeNull(); // day 1
      expect(getDosesForDate(med, DAY_2)).toEqual(med.doseSchedule); // day 2
      expect(getDosesForDate(med, DAY_3)).toBeNull(); // day 3
      expect(getDosesForDate(med, DAY_4)).toEqual(med.doseSchedule); // day 4
    });
  });

  describe('tapering', () => {
    it('rolls through phases', () => {
      const phase1: DoseSchedule = { morning: 2, afternoon: 0, evening: 0, night: 0 };
      const phase2: DoseSchedule = { morning: 1, afternoon: 0, evening: 0, night: 0 };
      const med = makeMed({
        scheduleType: 'tapering',
        taperingPhases: [
          { days: 2, doseSchedule: phase1 }, // days 0,1
          { days: 2, doseSchedule: phase2 }, // days 2,3
        ],
      });
      expect(getDosesForDate(med, START)).toEqual(phase1); // day 0
      expect(getDosesForDate(med, DAY_1)).toEqual(phase1); // day 1
      expect(getDosesForDate(med, DAY_2)).toEqual(phase2); // day 2
      expect(getDosesForDate(med, DAY_3)).toEqual(phase2); // day 3
      expect(getDosesForDate(med, DAY_4)).toBeNull(); // past all phases
    });
    it('ignores durationDays', () => {
      const phase1: DoseSchedule = { morning: 1, afternoon: 0, evening: 0, night: 0 };
      const med = makeMed({
        scheduleType: 'tapering',
        durationDays: 1, // would cap daily at day >=1
        taperingPhases: [{ days: 5, doseSchedule: phase1 }],
      });
      // Despite durationDays=1, tapering ignores it and uses phases
      expect(getDosesForDate(med, DAY_2)).toEqual(phase1);
      expect(getDosesForDate(med, DAY_4)).toEqual(phase1);
    });
    it('returns null when no phases match', () => {
      const med = makeMed({
        scheduleType: 'tapering',
        taperingPhases: [],
      });
      expect(getDosesForDate(med, START)).toBeNull();
    });
  });

  it('returns null when startDate missing', () => {
    const med = makeMed({ startDate: '' });
    expect(getDosesForDate(med, START)).toBeNull();
  });
});

describe('getDayCompliance', () => {
  it('returns none when no meds due', () => {
    const log: MedicationLog = {};
    expect(getDayCompliance([], log, START)).toEqual({ color: 'none', due: 0, taken: 0 });
  });

  it('returns none when meds present but none active that day', () => {
    const med = makeMed({ startDate: '2027-01-01' }); // not yet started
    expect(getDayCompliance([med], {}, START)).toEqual({ color: 'none', due: 0, taken: 0 });
  });

  it('returns green when all due slots taken', () => {
    const med = makeMed({
      doseSchedule: { morning: 1, afternoon: 1, evening: 0, night: 0 },
    });
    const log: MedicationLog = {
      [`${START}_${med.id}_morning`]: true,
      [`${START}_${med.id}_afternoon`]: true,
    };
    expect(getDayCompliance([med], log, START)).toEqual({ color: 'green', due: 2, taken: 2 });
  });

  it('returns red when due > 0 and taken == 0', () => {
    const med = makeMed({
      doseSchedule: { morning: 1, afternoon: 1, evening: 0, night: 0 },
    });
    expect(getDayCompliance([med], {}, START)).toEqual({ color: 'red', due: 2, taken: 0 });
  });

  it('returns yellow when partially taken', () => {
    const med = makeMed({
      doseSchedule: { morning: 1, afternoon: 1, evening: 0, night: 0 },
    });
    const log: MedicationLog = {
      [`${START}_${med.id}_morning`]: true,
    };
    expect(getDayCompliance([med], log, START)).toEqual({ color: 'yellow', due: 2, taken: 1 });
  });
});

describe('getMedsForDate', () => {
  it('filters out meds not due and attaches dosesToday', () => {
    const due = makeMed({ id: 'm-due' });
    const notDue = makeMed({ id: 'm-not-due', startDate: '2027-01-01' });
    const result = getMedsForDate([due, notDue], START);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('m-due');
    expect(result[0].dosesToday).toEqual(due.doseSchedule);
  });

  it('returns empty array when nothing due', () => {
    const med = makeMed({ startDate: '2027-01-01' });
    expect(getMedsForDate([med], START)).toEqual([]);
  });
});

describe('canEditLogForDate', () => {
  const TODAY = '2026-05-08';

  it('allows editing today', () => {
    expect(canEditLogForDate(TODAY, TODAY)).toBe(true);
  });

  it('allows editing a past day', () => {
    expect(canEditLogForDate('2026-05-01', TODAY)).toBe(true);
  });

  it('allows editing a day far in the past', () => {
    expect(canEditLogForDate('2024-01-15', TODAY)).toBe(true);
  });

  it('blocks editing a future day', () => {
    expect(canEditLogForDate('2026-05-09', TODAY)).toBe(false);
  });

  it('blocks editing a day far in the future', () => {
    expect(canEditLogForDate('2027-01-01', TODAY)).toBe(false);
  });

  it('returns false when dateStr is null', () => {
    expect(canEditLogForDate(null, TODAY)).toBe(false);
  });
});

describe('filterHistoryForDate', () => {
  const mkEntry = (overrides: Partial<MedicationLogHistoryEntry> = {}): MedicationLogHistoryEntry => ({
    id: 'h-1',
    logId: 'l-1',
    patientId: 'p-1',
    medicineId: 'm-1',
    logDate: '2026-05-08',
    slot: 'morning',
    priorTaken: null,
    newTaken: true,
    editedByUserId: 'u-1',
    editedAt: '2026-05-08T10:00:00Z',
    ...overrides,
  });

  it('returns empty array when dateStr is null', () => {
    expect(filterHistoryForDate([mkEntry()], null)).toEqual([]);
  });

  it('returns empty array when no entries match the date', () => {
    expect(filterHistoryForDate([mkEntry({ logDate: '2026-05-07' })], '2026-05-08')).toEqual([]);
  });

  it('returns only entries matching the date', () => {
    const entries = [
      mkEntry({ id: 'h-a', logDate: '2026-05-08' }),
      mkEntry({ id: 'h-b', logDate: '2026-05-07' }),
      mkEntry({ id: 'h-c', logDate: '2026-05-08' }),
    ];
    const result = filterHistoryForDate(entries, '2026-05-08');
    expect(result.map((e) => e.id).sort()).toEqual(['h-a', 'h-c']);
  });

  it('sorts results newest editedAt first', () => {
    const entries = [
      mkEntry({ id: 'old', editedAt: '2026-05-08T08:00:00Z' }),
      mkEntry({ id: 'new', editedAt: '2026-05-08T12:00:00Z' }),
      mkEntry({ id: 'mid', editedAt: '2026-05-08T10:00:00Z' }),
    ];
    expect(filterHistoryForDate(entries, '2026-05-08').map((e) => e.id)).toEqual([
      'new',
      'mid',
      'old',
    ]);
  });
});
