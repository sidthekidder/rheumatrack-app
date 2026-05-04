export interface DietItem {
  icon: string;
  name: string;
  detail: string;
}

export interface DiseaseTip {
  disease: string;
  icon: string;
  color: string;
  border: string;
  tips: string[];
}

export interface DietContent {
  eat: DietItem[];
  avoid: DietItem[];
  diseases: DiseaseTip[];
}

export const DIET: DietContent = {
  eat: [
    { icon: '🐟', name: 'Fatty Fish', detail: 'Salmon, mackerel, sardines — richest source of Omega-3. Strongest evidence for RA pain relief. 2-3 servings/week.' },
    { icon: '🥬', name: 'Leafy Greens', detail: 'Spinach, kale, methi, palak — antioxidants and folate. Especially important on Methotrexate.' },
    { icon: '🌿', name: 'Turmeric + Black Pepper', detail: 'Curcumin equals low-dose NSAIDs. ALWAYS combine with black pepper for 20× absorption.' },
    { icon: '🫚', name: 'Ginger (Adrak)', detail: 'Reduces TNF-α and IL-6 — same cytokines targeted by biologics. Use daily.' },
    { icon: '🫒', name: 'Olive Oil (EVOO)', detail: 'Oleocanthal has COX-inhibiting effect like ibuprofen. Replace refined oil.' },
    { icon: '🫐', name: 'Berries & Amla', detail: 'Anthocyanins and Vitamin C reduce oxidative stress in joints.' },
    { icon: '🥜', name: 'Walnuts & Almonds', detail: 'Plant Omega-3 and Vit E. Reduces CRP in RA patients.' },
    { icon: '🍵', name: 'Green Tea', detail: 'EGCG reduces IL-1β and TNF-α. 2-3 cups daily.' },
  ],
  avoid: [
    { icon: '🍔', name: 'Processed & Junk Food', detail: 'Trans fats and refined carbs raise TNF-α and CRP.' },
    { icon: '🥤', name: 'Sugar & Cold Drinks', detail: 'Fructose raises uric acid AND CRP. Avoid in gout.' },
    { icon: '🥩', name: 'Red Meat & Organ Meats', detail: 'High purines. Critical to reduce in Gout, RA, Lupus.' },
    { icon: '🍺', name: 'Alcohol', detail: 'STRICTLY AVOID on Methotrexate, Leflunomide, JAK inhibitors — severe hepatotoxicity risk.' },
    { icon: '🧂', name: 'Excess Salt', detail: 'Worsens hypertension on steroids. Avoid papad, pickle.' },
    { icon: '🍞', name: 'Maida & Refined Carbs', detail: 'Rapid glucose spikes feed inflammation.' },
  ],
  diseases: [
    { disease: 'Rheumatoid Arthritis', icon: '🦴', color: '#FEE2E2', border: '#FCA5A5', tips: ['Mediterranean diet has strongest evidence', 'Omega-3 (1-3g/day) reduces morning stiffness', 'STRICTLY avoid alcohol on Methotrexate', 'Vitamin D and folate per doctor', 'Probiotic-rich foods (dahi, chaas)'] },
    { disease: 'Gout', icon: '💧', color: '#DBEAFE', border: '#93C5FD', tips: ['Avoid organ meats, red meat, shellfish', 'NO alcohol especially beer', 'Drink 3-4 litres water daily', 'Low-fat dairy is protective', 'Tart cherry juice during flares'] },
    { disease: 'Lupus (SLE)', icon: '🌙', color: '#F5F3FF', border: '#C4B5FD', tips: ['Vitamin D supplementation crucial', 'Omega-3 reduces disease activity', 'Avoid alfalfa sprouts', 'SPF 50 sunscreen daily', 'Antioxidant-rich diet'] },
    { disease: 'Ankylosing Spondylitis', icon: '🔗', color: '#FEF3C7', border: '#FCD34D', tips: ['Calcium + Vit D critical for spine', 'Anti-inflammatory foods', 'Maintain healthy weight', 'Probiotics for gut dysbiosis', 'Avoid alcohol with NSAIDs'] },
    { disease: "Sjogren's", icon: '💦', color: '#CCFBF1', border: '#5EEAD4', tips: ['3+ litres water daily', 'Omega-3 reduces dry eye', 'Avoid caffeine and alcohol', 'Sugar-free gum for saliva', 'Use humidifier at home'] },
    { disease: 'Vasculitis (Takayasu)', icon: '🩸', color: '#FCE7F3', border: '#F9A8D4', tips: ['Anti-inflammatory Mediterranean diet', 'Calcium + Vit D on long-term steroids', 'Low-salt diet on antihypertensives', 'Heart-healthy diet', 'Strict alcohol avoidance'] },
  ],
};
