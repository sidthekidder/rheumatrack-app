// Mock heavy RN + data-layer deps so the pure helper is isolated
jest.mock('@/lib/supabase', () => ({ supabase: {} }));
jest.mock('@/lib/api', () => ({}));
jest.mock('@/lib/queries', () => ({
  useMedicines: jest.fn(),
  useMedicationLog: jest.fn(),
  usePatient: jest.fn(),
  useLabReports: jest.fn(),
}));
jest.mock('@/constants/labs', () => ({ LAB_TESTS: [], flagVal: jest.fn() }));
jest.mock('@/constants/slots', () => ({ TS_DATA: {} }));
jest.mock('@/lib/schedule', () => ({ getMedsForDate: jest.fn(), today: jest.fn() }));
jest.mock('@/lib/themeStore', () => ({ useTheme: jest.fn(() => ({ colors: {} })) }));
jest.mock('lucide-react-native', () => ({ Share2: 'Share2' }));

import { formatHealthCardForShare } from '../HealthCard';

const basePatient = {
  name: 'Asha',
  patientId: 'ABC123',
  age: 32,
  city: 'Mumbai',
  country: 'India',
  diagnosis: 'Rheumatoid Arthritis',
};

const baseInput = {
  patient: basePatient,
  compliance: { taken: 4, total: 5, pct: 80 },
  medicines: [
    { drugName: 'Methotrexate', dose: '7.5mg', scheduleSummary: 'once weekly' },
    { drugName: 'Folic Acid', dose: '5mg', scheduleSummary: 'once weekly' },
  ],
  abnormalLabs: [],
  generatedAt: '2026-05-06',
};

describe('formatHealthCardForShare', () => {
  it('includes patient name, ID, diagnosis', () => {
    const text = formatHealthCardForShare(baseInput);
    expect(text).toContain('Asha');
    expect(text).toContain('ABC123');
    expect(text).toContain('Rheumatoid Arthritis');
  });

  it("includes today's compliance percentage", () => {
    const text = formatHealthCardForShare(baseInput);
    expect(text).toContain("Today's Compliance: 80% (4/5)");
  });

  it('lists active medicines', () => {
    const text = formatHealthCardForShare(baseInput);
    expect(text).toContain('- Methotrexate 7.5mg — once weekly');
    expect(text).toContain('- Folic Acid 5mg — once weekly');
  });

  it('omits abnormal-lab section entirely when none', () => {
    const text = formatHealthCardForShare(baseInput);
    expect(text).not.toContain('Abnormal Labs');
  });

  it('includes abnormal-lab section only when results exceed normal ranges', () => {
    const text = formatHealthCardForShare({
      ...baseInput,
      abnormalLabs: [
        { testKey: 'esr', label: 'ESR', value: '45', normalRange: '<20' },
        { testKey: 'crp', label: 'CRP', value: '12.1', normalRange: '<5' },
      ],
    });
    expect(text).toContain('Abnormal Labs:');
    expect(text).toContain('- ESR: 45 (normal <20)');
    expect(text).toContain('- CRP: 12.1 (normal <5)');
  });

  it('handles missing optional patient fields gracefully', () => {
    const text = formatHealthCardForShare({
      ...baseInput,
      patient: { ...basePatient, patientId: null, age: null, city: null, country: null, diagnosis: null },
    });
    expect(text).toContain('Asha');
    expect(text).not.toContain('ID:');
    expect(text).not.toContain('Age:');
    expect(text).not.toContain('Diagnosis:');
  });
});
