export interface ThemeTokens {
  bg: string;
  card: string;
  card2: string;
  text: string;
  text2: string;
  border: string;
  input: string;
  // expo-linear-gradient takes start/end as {x,y} unit-vector points;
  // 135deg ~ (0,0)->(1,1); 160deg ~ (0.17,0)->(0.83,1).
  header: { colors: [string, string]; start: { x: number; y: number }; end: { x: number; y: number } };
  bgGradient: { colors: [string, string, string]; start: { x: number; y: number }; end: { x: number; y: number } };
}

const angle135 = { start: { x: 0, y: 0 }, end: { x: 1, y: 1 } };
const angle160 = { start: { x: 0.17, y: 0 }, end: { x: 0.83, y: 1 } };

export const lightTokens: ThemeTokens = {
  bg: '#F0FDFA',
  card: '#FFFFFF',
  card2: '#F8FAFC',
  text: '#1E293B',
  text2: '#64748B',
  border: '#E2E8F0',
  input: '#FFFFFF',
  header: { colors: ['#0D9488', '#0284C7'], ...angle135 },
  bgGradient: { colors: ['#F0FDFA', '#E0F2FE', '#F5F3FF'], ...angle160 },
};

export const darkTokens: ThemeTokens = {
  bg: '#0F172A',
  card: '#1E293B',
  card2: '#263348',
  text: '#F1F5F9',
  text2: '#94A3B8',
  border: '#334155',
  input: '#263348',
  header: { colors: ['#0F766E', '#0369A1'], ...angle135 },
  bgGradient: { colors: ['#0F172A', '#111827', '#0F172A'], ...angle160 },
};
