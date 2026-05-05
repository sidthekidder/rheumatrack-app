export interface LabTest {
  id: string;
  name: string;
  cat: string;
  unit: string;
  nMin: number | null;
  nMax: number | null;
  qualitative?: boolean;
  warn: string;
}

export const LAB_TESTS: readonly LabTest[] = [
  { id: 'hb',         name: 'Hemoglobin',        cat: 'CBC',          unit: 'g/dL',   nMin: 11.5, nMax: 17.5, warn: 'Critical for all DMARDs and immunosuppressants' },
  { id: 'wbc',        name: 'WBC Count',         cat: 'CBC',          unit: 'x10/uL', nMin: 4.0,  nMax: 11.0, warn: 'Low WBC risk with MTX, Azathioprine, Cyclophosphamide' },
  { id: 'platelets',  name: 'Platelets',         cat: 'CBC',          unit: 'x10/uL', nMin: 150,  nMax: 400,  warn: 'Thrombocytopenia risk with MTX and immunosuppressants' },
  { id: 'esr',        name: 'ESR',               cat: 'Inflammatory', unit: 'mm/hr',  nMin: 0,    nMax: 20,   warn: 'Key disease activity marker in RA, AS, Vasculitis' },
  { id: 'crp',        name: 'CRP',               cat: 'Inflammatory', unit: 'mg/L',   nMin: 0,    nMax: 5,    warn: 'Acute phase reactant. More sensitive than ESR for flares' },
  { id: 'sgpt',       name: 'SGPT (ALT)',        cat: 'Liver',        unit: 'U/L',    nMin: 7,    nMax: 56,   warn: 'Monitor on MTX, Leflunomide, JAK inhibitors, NSAIDs' },
  { id: 'sgot',       name: 'SGOT (AST)',        cat: 'Liver',        unit: 'U/L',    nMin: 10,   nMax: 40,   warn: 'Monitor on MTX, Leflunomide, JAK inhibitors' },
  { id: 'creatinine', name: 'Creatinine',        cat: 'Kidney',       unit: 'mg/dL',  nMin: 0.6,  nMax: 1.2,  warn: 'Monitor on NSAIDs, Cyclosporine, Tacrolimus, Cyclophosphamide' },
  { id: 'urea',       name: 'Blood Urea',        cat: 'Kidney',       unit: 'mg/dL',  nMin: 15,   nMax: 45,   warn: 'Renal function monitoring alongside creatinine' },
  { id: 'rbs',        name: 'RBS',               cat: 'Metabolic',    unit: 'mg/dL',  nMin: 70,   nMax: 140,  warn: 'Steroid-induced hyperglycemia monitoring' },
  { id: 'vitd',       name: 'Vitamin D',         cat: 'Metabolic',    unit: 'ng/mL',  nMin: 30,   nMax: 100,  warn: 'Deficiency very common in autoimmune disease. Supplement if <20' },
  { id: 'vitb12',     name: 'Vitamin B12',       cat: 'Metabolic',    unit: 'pg/mL',  nMin: 200,  nMax: 900,  warn: 'Check on MTX. Neuropathy risk if deficient' },
  { id: 'uricacid',   name: 'Uric Acid',         cat: 'Metabolic',    unit: 'mg/dL',  nMin: 2.4,  nMax: 6.0,  warn: 'Target <6 in Gout. <5 in tophaceous gout' },
  { id: 'c3',         name: 'Complement C3',     cat: 'Immunology',   unit: 'mg/dL',  nMin: 90,   nMax: 180,  warn: 'Low C3 = active SLE nephritis. Monitor during flares' },
  { id: 'c4',         name: 'Complement C4',     cat: 'Immunology',   unit: 'mg/dL',  nMin: 16,   nMax: 47,   warn: 'Low C4 + low C3 = classical pathway activation in SLE' },
  { id: 'tchol',      name: 'Total Cholesterol', cat: 'Lipid Profile',unit: 'mg/dL',  nMin: 0,    nMax: 200,  warn: 'Monitor on steroids and JAK inhibitors' },
  { id: 'ldl',        name: 'LDL Cholesterol',   cat: 'Lipid Profile',unit: 'mg/dL',  nMin: 0,    nMax: 100,  warn: 'Target <100 in RA. <70 if prior cardiovascular event' },
  { id: 'hdl',        name: 'HDL Cholesterol',   cat: 'Lipid Profile',unit: 'mg/dL',  nMin: 40,   nMax: 999,  warn: 'Higher is better. Low HDL increases CV risk in RA' },
  { id: 'trig',       name: 'Triglycerides',     cat: 'Lipid Profile',unit: 'mg/dL',  nMin: 0,    nMax: 150,  warn: 'Elevated on steroids. Pancreatitis risk if >500' },
  { id: 'urine_p',    name: 'Urine Protein',     cat: 'Urine R/M',    unit: '',       nMin: null, nMax: null, qualitative: true, warn: 'Proteinuria = lupus nephritis or NSAID nephropathy' },
  { id: 'urine_rbc',  name: 'Urine RBC',         cat: 'Urine R/M',    unit: '',       nMin: null, nMax: null, qualitative: true, warn: 'Hematuria in vasculitis, SLE nephritis' },
  { id: 'ana',        name: 'ANA',               cat: 'Special',      unit: 'titre',  nMin: null, nMax: null, qualitative: true, warn: 'Positive titres >1:80 clinically significant' },
  { id: 'rf',         name: 'Rheumatoid Factor', cat: 'Special',      unit: 'IU/mL',  nMin: 0,    nMax: 14,   warn: 'Elevated in ~70% RA, Sjogrens, SLE, chronic infection' },
  { id: 'anticcp',    name: 'Anti-CCP',          cat: 'Special',      unit: 'U/mL',   nMin: 0,    nMax: 20,   warn: 'High specificity for RA (>95%). Predicts erosive disease' },
  { id: 'antidsdna',  name: 'Anti-dsDNA',        cat: 'Special',      unit: 'IU/mL',  nMin: 0,    nMax: 7,    warn: 'Rises before SLE flare. Correlates with lupus nephritis' },
  { id: 'anca',       name: 'ANCA',              cat: 'Special',      unit: 'titre',  nMin: null, nMax: null, qualitative: true, warn: 'PR3-ANCA in GPA. MPO-ANCA in MPA/EGPA' },
  { id: 'hlab27',     name: 'HLA-B27',           cat: 'Special',      unit: '',       nMin: null, nMax: null, qualitative: true, warn: 'Present in ~90% AS, reactive arthritis, uveitis' },
];

export const LAB_CATS: readonly string[] = ['All', ...Array.from(new Set(LAB_TESTS.map(t => t.cat)))];

export const QUAL_OPTS: readonly string[] = [
  'Nil', 'Trace', '+', '++', '+++', 'Positive', 'Negative',
  '1:40', '1:80', '1:160', '1:320', '1:640', 'Detected', 'Not Detected',
];

export type LabFlag = 'normal' | 'low' | 'high' | 'qual' | 'none';

export function flagVal(t: LabTest, v: string): LabFlag {
  if (t.qualitative) return 'qual';
  const n = parseFloat(v);
  if (isNaN(n)) return 'none';
  if (t.nMin !== null && n < t.nMin) return 'low';
  if (t.nMax !== null && t.nMax < 999 && n > t.nMax) return 'high';
  return 'normal';
}

const FLAG_CLR: Record<LabFlag, string> = {
  normal: '#16A34A', low: '#3B82F6', high: '#EF4444', qual: '#8B5CF6', none: '#94A3B8',
};
const FLAG_BG: Record<LabFlag, string> = {
  normal: '#F0FDF4', low: '#EFF6FF', high: '#FEF2F2', qual: '#F5F3FF', none: '#F8FAFC',
};
const FLAG_LBL: Record<LabFlag, string> = {
  normal: 'Normal', low: 'Low', high: 'High', qual: 'Result', none: '--',
};

export const flagClr = (f: LabFlag): string => FLAG_CLR[f] ?? '#94A3B8';
export const flagBg = (f: LabFlag): string => FLAG_BG[f] ?? '#F8FAFC';
export const flagLbl = (f: LabFlag): string => FLAG_LBL[f] ?? '--';
