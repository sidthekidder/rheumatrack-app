export interface Drug {
  name: string;
  cat: string;
  brands: string[];
  doses: string[];
  route: string;
  tip: string;
}

export const DRUGS: readonly Drug[] = [
  { name: 'Methotrexate', cat: 'DMARD', brands: ['Folitrax', 'Neotrexate', 'Imutrex'], doses: ['2.5mg', '5mg', '7.5mg', '10mg', '15mg', '20mg'], route: 'Oral/SC', tip: 'Same day every week. Take Folic Acid on a DIFFERENT day.' },
  { name: 'Hydroxychloroquine', cat: 'DMARD', brands: ['HCQ-200', 'HCQS-200', 'HCQS-400', 'Plaquenil'], doses: ['200mg', '400mg'], route: 'Oral', tip: 'Take with food. Eye checkup every 6 months.' },
  { name: 'Sulfasalazine', cat: 'DMARD', brands: ['Saaz', 'Saazx', 'Saaz-DS'], doses: ['500mg', '1000mg'], route: 'Oral', tip: 'Take with food. Drink plenty of water.' },
  { name: 'Leflunomide', cat: 'DMARD', brands: ['Lefno', 'Lupride', 'Leflomune', 'Arava'], doses: ['10mg', '20mg'], route: 'Oral', tip: 'Same time daily. Avoid alcohol completely.' },
  { name: 'Azathioprine', cat: 'Immunosuppressant', brands: ['Azoran', 'Imuran'], doses: ['25mg', '50mg', '75mg'], route: 'Oral', tip: 'Take with food. Regular blood counts essential.' },
  { name: 'Mycophenolate Mofetil', cat: 'Immunosuppressant', brands: ['Myfocept', 'Cellcept', 'Mycept-500'], doses: ['250mg', '500mg', '1000mg'], route: 'Oral', tip: 'Take on empty stomach.' },
  { name: 'Cyclophosphamide', cat: 'Immunosuppressant', brands: ['Endoxan', 'Cycloxan'], doses: ['50mg', '100mg'], route: 'Oral/IV', tip: 'Drink plenty of water.' },
  { name: 'Tacrolimus', cat: 'Immunosuppressant', brands: ['Pangraf', 'Prograf', 'Tacrograf'], doses: ['0.5mg', '1mg', '2mg'], route: 'Oral', tip: 'Same time daily on empty stomach.' },
  { name: 'Adalimumab', cat: 'Anti-TNF Biologic', brands: ['Exemptia', 'Cimtai', 'Hulio'], doses: ['40mg/0.8mL'], route: 'SC', tip: 'Refrigerate 2-8C. Rotate injection sites.' },
  { name: 'Etanercept', cat: 'Anti-TNF Biologic', brands: ['Etacept', 'Enbrel', 'Intacept'], doses: ['25mg', '50mg'], route: 'SC', tip: 'Rotate sites. Refrigerate.' },
  { name: 'Infliximab', cat: 'Anti-TNF Biologic', brands: ['Remsima', 'Infimab', 'Remicade'], doses: ['100mg vial'], route: 'IV', tip: 'Hospital infusion only.' },
  { name: 'Rituximab', cat: 'Anti-CD20 Biologic', brands: ['Reditux', 'Mabthera', 'Rituxirel'], doses: ['100mg', '500mg', '1000mg'], route: 'IV', tip: 'Hospital infusion. 2 doses 2 weeks apart.' },
  { name: 'Tocilizumab', cat: 'Anti-IL-6', brands: ['Actemra', 'Toclizum'], doses: ['162mg SC', '200mg IV', '400mg IV'], route: 'SC/IV', tip: 'SC: weekly. IV: hospital infusion.' },
  { name: 'Secukinumab', cat: 'Anti-IL-17', brands: ['Cosentyx', 'Sekunib'], doses: ['150mg', '300mg'], route: 'SC', tip: 'Loading doses then monthly.' },
  { name: 'Tofacitinib', cat: 'JAK Inhibitor', brands: ['Xeljanz', 'Tofaday', 'Tofaheal'], doses: ['5mg', '10mg', '11mg XR'], route: 'Oral', tip: 'With or without food. Report infections promptly.' },
  { name: 'Baricitinib', cat: 'JAK Inhibitor', brands: ['Olumiant', 'Baricitab'], doses: ['2mg', '4mg'], route: 'Oral', tip: 'Same time daily.' },
  { name: 'Upadacitinib', cat: 'JAK Inhibitor', brands: ['Rinvoq', 'Upadoz'], doses: ['15mg', '30mg', '45mg'], route: 'Oral', tip: 'Same time daily. Do not crush.' },
  { name: 'Diclofenac', cat: 'NSAID', brands: ['Voveran', 'Diclomol', 'Reactin'], doses: ['50mg', '75mg', '100mg SR'], route: 'Oral', tip: 'Always take with food.' },
  { name: 'Etoricoxib', cat: 'COX-2', brands: ['Nucoxia', 'Etova', 'Etorix'], doses: ['60mg', '90mg', '120mg'], route: 'Oral', tip: 'Avoid in heart disease.' },
  { name: 'Aceclofenac', cat: 'NSAID', brands: ['Zerodol', 'Hifenac', 'Acenac'], doses: ['100mg'], route: 'Oral', tip: 'Take with food.' },
  { name: 'Celecoxib', cat: 'COX-2', brands: ['Celact', 'Cobix', 'Celebrex'], doses: ['100mg', '200mg', '400mg'], route: 'Oral', tip: 'With food. Avoid if sulfa allergy.' },
  { name: 'Prednisolone', cat: 'Corticosteroid', brands: ['Wysolone', 'Omnacortil'], doses: ['2.5mg', '5mg', '10mg', '20mg', '40mg'], route: 'Oral', tip: 'Morning with food. Never stop suddenly, taper as directed.' },
  { name: 'Methylprednisolone', cat: 'Corticosteroid', brands: ['Medrol', 'Solumedrol'], doses: ['4mg', '8mg', '16mg', '32mg'], route: 'Oral/IV', tip: 'Morning with food.' },
  { name: 'Deflazacort', cat: 'Corticosteroid', brands: ['Defcort', 'Decortil', 'Flazacort'], doses: ['6mg', '12mg', '18mg', '24mg', '30mg'], route: 'Oral', tip: 'Better bone profile than prednisolone.' },
  { name: 'Allopurinol', cat: 'Gout', brands: ['Zyloric', 'Aloric', 'Lopurin'], doses: ['100mg', '200mg', '300mg'], route: 'Oral', tip: 'With food. 2-3L water daily.' },
  { name: 'Febuxostat', cat: 'Gout', brands: ['Febuget', 'Urifit', 'Febutaz'], doses: ['40mg', '80mg', '120mg'], route: 'Oral', tip: 'Monitor liver enzymes periodically.' },
  { name: 'Colchicine', cat: 'Gout', brands: ['Colchicine', 'Colcout'], doses: ['0.5mg', '1mg'], route: 'Oral', tip: 'Do not exceed prescribed dose.' },
  { name: 'Calcium + Vit D3', cat: 'Bone & Supplement', brands: ['Shelcal', 'Cipcal', 'Calcimax'], doses: ['500+250IU', '500+500IU', '1000+500IU'], route: 'Oral', tip: 'With meals. Separate from iron by 2 hours.' },
  { name: 'Folic Acid', cat: 'Bone & Supplement', brands: ['Folvite', 'Fa-5', 'Folicip'], doses: ['1mg', '5mg'], route: 'Oral', tip: 'On MTX: take on a DIFFERENT day than Methotrexate.' },
  { name: 'Vitamin D3', cat: 'Bone & Supplement', brands: ['D-Rise', 'Calcirol', 'Arachitol'], doses: ['1000 IU', '2000 IU', '60000 IU sachet'], route: 'Oral', tip: 'Take with fatty meal for best absorption.' },
  { name: 'Vitamin B12', cat: 'Bone & Supplement', brands: ['Mecobal', 'Methycobal', 'Nervijen'], doses: ['500mcg', '1000mcg', '1500mcg'], route: 'Oral', tip: 'With or without food.' },
  { name: 'Pantoprazole', cat: 'Gastroprotective', brands: ['Pantocid', 'Pan-D', 'Pantop'], doses: ['20mg', '40mg'], route: 'Oral', tip: 'Before breakfast on empty stomach.' },
  { name: 'Rabeprazole', cat: 'Gastroprotective', brands: ['Razo', 'Rablet', 'Rabeloc'], doses: ['10mg', '20mg'], route: 'Oral', tip: 'Before breakfast.' },
  { name: 'Pregabalin', cat: 'Pain/Neuropathic', brands: ['Lyrica', 'Pregalin', 'Nervilax'], doses: ['25mg', '50mg', '75mg', '150mg', '300mg'], route: 'Oral', tip: 'May cause drowsiness. Avoid driving initially.' },
];

export const CATEGORIES: readonly string[] = ['All', ...Array.from(new Set(DRUGS.map((d) => d.cat)))];
