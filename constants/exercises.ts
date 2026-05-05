export interface ExerciseItem {
  n: string;
  d: string;
  s: string;
  l: 'Easy' | 'Medium' | 'Hard';
  desc: string;
}

export interface ExerciseGroup {
  con: string;
  ic: string;
  ac: string;
  warn: string;
  dos: string[];
  donts: string[];
  list: ExerciseItem[];
}

export const EXERCISES: readonly ExerciseGroup[] = [
  {
    con: 'Rheumatoid Arthritis',
    ic: '🦴',
    ac: '#EF4444',
    warn: 'Stop if any joint becomes acutely swollen or hot. Rest during active flares.',
    dos: [
      'Gentle range-of-motion daily — even during mild disease',
      'Low-impact cardio: swimming, walking, cycling',
      'Resistance training 2-3x/week during remission',
      'Warm water therapy reduces joint load ~50%',
    ],
    donts: [
      'High-impact sports and contact activities',
      'Exercising with acutely inflamed joints',
      'Prolonged static gripping',
    ],
    list: [
      { n: 'Hand and Wrist Circles', d: '2 min', s: '3x', l: 'Easy', desc: 'Slowly rotate wrists clockwise then counterclockwise. Open and close fists gently. Core daily exercise.' },
      { n: 'Shoulder Pendulum', d: '3 min', s: '2x', l: 'Easy', desc: 'Lean forward, arm hanging freely. Swing in small circles using gravity only. Ideal for RA shoulder.' },
      { n: 'Seated Knee Extension', d: '3 min', s: '3x10', l: 'Easy', desc: 'Sit upright, straighten one knee, hold 5 sec, lower slowly. Builds quads with zero axial joint load.' },
      { n: 'Pool Walking', d: '20 min', s: 'Daily', l: 'Medium', desc: 'Waist-deep water, 50% less joint load vs land. Best cardio during moderate disease activity.' },
      { n: 'Resistance Band Rows', d: '5 min', s: '3x12', l: 'Medium', desc: 'Band around fixed point, pull toward body elbows-first. Prevents forward-stooping posture in RA.' },
    ],
  },
  {
    con: 'Ankylosing Spondylitis',
    ic: '🔗',
    ac: '#F59E0B',
    warn: 'Daily exercise is NON-NEGOTIABLE in AS. Inactivity directly accelerates spinal fusion. Never skip.',
    dos: [
      'Prone lying 30 min/day counteracts forward flexion',
      'Daily chest expansion breathing',
      'Swimming backstroke is best overall for AS',
      'Posture awareness throughout the day',
    ],
    donts: [
      'Sitting more than 30 min without a break',
      'Deep spinal flexion without warm-up',
      'Thick pillow while sleeping',
    ],
    list: [
      { n: 'Prone Lying', d: '30 min', s: 'Every morning', l: 'Easy', desc: 'Face-down on firm surface after waking. Directly counteracts anterior spinal flexion. Most important exercise.' },
      { n: 'Chest Expansion Breathing', d: '5 min', s: '3x', l: 'Easy', desc: 'Stand tall, breathe maximally expanding chest, hold 5 sec. Normal expansion is 5+ cm — track it monthly.' },
      { n: 'Wall Stand', d: '5 min', s: '3x daily', l: 'Easy', desc: 'Heels, buttocks, shoulders and occiput all touching wall. Hold 30 sec. Note any gap between head and wall.' },
      { n: 'Hip Flexor Stretch', d: '3 min', s: '2x each side', l: 'Easy', desc: 'Kneeling lunge, push hip forward gently, hold 30 sec. Prevents hip flexion contracture.' },
      { n: 'Swimming Backstroke', d: '30 min', s: '3-4x/week', l: 'Medium', desc: 'Best overall for AS. Backstroke promotes spinal extension. Warm pool (32-35C) preferred.' },
    ],
  },
  {
    con: 'Osteoarthritis Knee',
    ic: '🦵',
    ac: '#10B981',
    warn: 'Exercise is more effective than paracetamol for knee OA in RCTs. Must be consistent.',
    dos: [
      'Quadriceps strengthening is top priority',
      'Low-impact aerobic 150 min/week',
      'Warm water exercise if pain is severe',
      '5% body weight loss reduces knee load 15-20%',
    ],
    donts: [
      'Deep squats past 90 degrees during pain',
      'Running on hard surfaces during flare',
      'Exercising with acute joint effusion',
    ],
    list: [
      { n: 'Straight Leg Raise', d: '3 min', s: '3x15', l: 'Easy', desc: 'Lie flat, tighten quad, raise to 45 degrees, hold 5 sec, lower slowly. Strongest evidence for knee OA.' },
      { n: 'Isometric Quad Set', d: '3 min', s: '5x10 sec', l: 'Easy', desc: 'Press back of knee into rolled towel. Hold 10 sec. Safe during flares. Activates VMO without joint movement.' },
      { n: 'Mini Squat (0-30 deg)', d: '4 min', s: '3x15', l: 'Medium', desc: 'Squat to 30 degrees only. Maximum safe muscle activation. Progress to 45 degrees over weeks.' },
      { n: 'Stationary Cycling', d: '20 min', s: 'Daily', l: 'Medium', desc: 'Raise seat so knee bends only 30-40 degrees. Zero impact. Lubricates articular cartilage.' },
    ],
  },
  {
    con: 'Gout',
    ic: '💧',
    ac: '#3B82F6',
    warn: 'ZERO exercise during acute flare. Complete rest, elevation and ice for the affected joint.',
    dos: [
      'Regular low-impact exercise between flares reduces frequency',
      'Target healthy BMI to reduce uric acid',
      'Walking 30 min/day between flares',
      'Hydrate well before, during and after exercise',
    ],
    donts: [
      'Any exercise during active flare — absolute rest',
      'High-intensity exercise increases lactic acid competing with urate',
      'Exercising while dehydrated',
    ],
    list: [
      { n: 'FLARE: RICE Protocol', d: 'Until resolved', s: 'As needed', l: 'Easy', desc: 'Rest completely. Ice 15 min x 3/day. Compression if tolerated. Elevate above heart. No weight-bearing until pain-free.' },
      { n: 'Walking Programme', d: '30 min', s: '5x/week', l: 'Medium', desc: 'Best exercise for gout prevention. Reduces weight and uric acid. Drink 500mL water before each walk.' },
      { n: 'Swimming', d: '30 min', s: '3x/week', l: 'Medium', desc: 'Non-weight-bearing. Avoids lactic acid accumulation that can precipitate gout flares.' },
    ],
  },
  {
    con: 'General Principles',
    ic: '💪',
    ac: '#0D9488',
    warn: 'Always inform your rheumatologist about your exercise programme. Movement is medicine but the dose matters.',
    dos: [
      'Warm up 5-10 min before every session',
      'Exercise at the same time daily for consistency',
      '3 days/week consistently beats 7 days then injury',
      'Keep exercise diary alongside medicine diary',
    ],
    donts: [
      'Start an intense programme during a flare',
      'Ignore post-exercise joint swelling or warmth',
      'Stop all exercise because of your diagnosis',
    ],
    list: [
      { n: 'Daily Step Goal', d: '30 min total', s: 'Daily', l: 'Easy', desc: '6000-8000 steps/day. Spread across the day — 3 short walks beat 1 long one. Track on your phone.' },
      { n: 'Morning Joint Warm-Up', d: '10 min', s: 'Daily (in bed)', l: 'Easy', desc: 'Ankle pumps, knee bends, hip rotations, hand circles, shoulder rolls before getting up. Reduces morning stiffness ~40%.' },
      { n: 'Hydrotherapy', d: '20-30 min', s: '2x/week', l: 'Easy', desc: 'Warm pool (32-36C). Reduces joint load 50-75%. Evidence across RA, OA, AS and fibromyalgia.' },
    ],
  },
];

export const GENERAL_EXERCISE_INDEX = EXERCISES.length - 1;

export function pickExerciseGroup(diag: string | null | undefined): number {
  const dl = (diag || '').toLowerCase();
  if (!dl) return GENERAL_EXERCISE_INDEX;
  if (dl.includes('rheumatoid') || dl.includes(' ra') || dl === 'ra') {
    return EXERCISES.findIndex(e => e.con.includes('Rheumatoid'));
  }
  if (dl.includes('ankylosing') || dl.includes('spondylitis')) {
    return EXERCISES.findIndex(e => e.con.includes('Ankylosing'));
  }
  if (dl.includes('osteoarthritis') || dl.includes(' oa')) {
    return EXERCISES.findIndex(e => e.con.includes('Osteoarthritis'));
  }
  if (dl.includes('gout')) {
    return EXERCISES.findIndex(e => e.con.includes('Gout'));
  }
  return GENERAL_EXERCISE_INDEX;
}
