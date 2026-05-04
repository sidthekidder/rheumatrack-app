export interface Drug {
  name: string;
  cat: string;
  brands: string[];
  doses: string[];
  route: string;
  tip: string;
}

export const DRUGS: readonly Drug[] = [
  { name: 'Methotrexate', cat: 'DMARD', brands: ['Folitrax', 'Neotrexate', 'Imutrex', 'Biotrexate'], doses: ['2.5mg', '5mg', '7.5mg', '10mg', '15mg', '20mg'], route: 'Oral/SC', tip: 'Same day every week. Take Folic Acid on a different day.' },
  { name: 'Hydroxychloroquine', cat: 'DMARD', brands: ['HCQ-200', 'HCQS-200', 'HCQS-400', 'Plaquenil'], doses: ['200mg', '400mg'], route: 'Oral', tip: 'Take with food. Eye checkup every 6 months.' },
  { name: 'Sulfasalazine', cat: 'DMARD', brands: ['Saaz', 'Saazx', 'Saaz-DS', 'Salazopyrin'], doses: ['500mg', '1000mg'], route: 'Oral', tip: 'Take with food. Drink plenty of water.' },
  { name: 'Leflunomide', cat: 'DMARD', brands: ['Lefno', 'Lupride', 'Leflomune', 'Arava'], doses: ['10mg', '20mg'], route: 'Oral', tip: 'Same time daily. Avoid alcohol.' },
  { name: 'Azathioprine', cat: 'Immunosuppressant', brands: ['Azoran', 'Imuran'], doses: ['25mg', '50mg', '75mg'], route: 'Oral', tip: 'Take with food. Regular blood counts needed.' },
  { name: 'Mycophenolate Mofetil', cat: 'Immunosuppressant', brands: ['Myfocept', 'Cellcept', 'Mycept-500'], doses: ['250mg', '500mg', '1000mg'], route: 'Oral', tip: 'Take on empty stomach.' },
  { name: 'Cyclophosphamide', cat: 'Immunosuppressant', brands: ['Endoxan', 'Cycloxan'], doses: ['50mg', '100mg'], route: 'Oral/IV', tip: 'Drink plenty of water.' },
  { name: 'Tacrolimus', cat: 'Immunosuppressant', brands: ['Pangraf', 'Prograf', 'Tacrograf'], doses: ['0.5mg', '1mg', '2mg'], route: 'Oral', tip: 'Same time daily on empty stomach.' },
  { name: 'Cyclosporine', cat: 'Immunosuppressant', brands: ['Panimun Bioral', 'Sandimmun', 'Imusporin'], doses: ['25mg', '50mg', '100mg'], route: 'Oral', tip: 'Avoid grapefruit.' },
  { name: 'Adalimumab', cat: 'Anti-TNF Biologic', brands: ['Exemptia', 'Cimtai', 'Hulio', 'Adfrar'], doses: ['40mg/0.8mL'], route: 'SC', tip: 'Refrigerate 2-8°C. Rotate sites.' },
  { name: 'Etanercept', cat: 'Anti-TNF Biologic', brands: ['Etacept', 'Enbrel', 'Intacept'], doses: ['25mg', '50mg'], route: 'SC', tip: 'Rotate sites. Refrigerate.' },
  { name: 'Infliximab', cat: 'Anti-TNF Biologic', brands: ['Remsima', 'Infimab', 'Remicade'], doses: ['100mg vial'], route: 'IV', tip: 'Hospital infusion.' },
  { name: 'Rituximab', cat: 'Anti-CD20 Biologic', brands: ['Reditux', 'Mabthera', 'Rituxirel'], doses: ['100mg', '500mg', '1000mg'], route: 'IV', tip: 'Hospital infusion. 2 doses 2 weeks apart.' },
  { name: 'Tocilizumab', cat: 'Anti-IL-6', brands: ['Actemra', 'Toclizum'], doses: ['162mg SC', '200mg IV', '400mg IV'], route: 'SC/IV', tip: 'SC: weekly. IV: hospital.' },
  { name: 'Secukinumab', cat: 'Anti-IL-17', brands: ['Cosentyx', 'Sekunib'], doses: ['150mg', '300mg'], route: 'SC', tip: 'Loading then monthly.' },
  { name: 'Tofacitinib', cat: 'JAK Inhibitor', brands: ['Xeljanz', 'Tofaday', 'Tofaheal', 'Jaktinib'], doses: ['5mg', '10mg', '11mg XR'], route: 'Oral', tip: 'With/without food. Report infections.' },
  { name: 'Baricitinib', cat: 'JAK Inhibitor', brands: ['Olumiant', 'Baricitab', 'Bari-2'], doses: ['2mg', '4mg'], route: 'Oral', tip: 'Same time daily.' },
  { name: 'Upadacitinib', cat: 'JAK Inhibitor', brands: ['Rinvoq', 'Upadoz'], doses: ['15mg', '30mg', '45mg'], route: 'Oral', tip: 'Same time daily. Do not crush.' },
  { name: 'Diclofenac', cat: 'NSAID', brands: ['Voveran', 'Diclomol', 'Reactin', 'Dynapar'], doses: ['50mg', '75mg', '100mg SR'], route: 'Oral', tip: 'Take with food.' },
  { name: 'Etoricoxib', cat: 'COX-2', brands: ['Nucoxia', 'Etova', 'Etorix'], doses: ['60mg', '90mg', '120mg'], route: 'Oral', tip: 'Avoid in heart disease.' },
  { name: 'Aceclofenac', cat: 'NSAID', brands: ['Zerodol', 'Hifenac', 'Acenac', 'Dolowin'], doses: ['100mg'], route: 'Oral', tip: 'Take with food.' },
  { name: 'Celecoxib', cat: 'COX-2', brands: ['Celact', 'Cobix', 'Celebrex'], doses: ['100mg', '200mg', '400mg'], route: 'Oral', tip: 'With food. Avoid sulfa allergy.' },
  { name: 'Naproxen', cat: 'NSAID', brands: ['Naprosyn', 'Naxdom', 'Napryn'], doses: ['250mg', '375mg', '500mg'], route: 'Oral', tip: 'With food or milk.' },
  { name: 'Indomethacin', cat: 'NSAID', brands: ['Indocap', 'Indocap SR', 'Indomet'], doses: ['25mg', '50mg', '75mg SR'], route: 'Oral', tip: 'Good for gout & AS.' },
  { name: 'Prednisolone', cat: 'Corticosteroid', brands: ['Wysolone', 'Omnacortil', 'Predsol'], doses: ['2.5mg', '5mg', '10mg', '20mg', '40mg'], route: 'Oral', tip: 'Morning with food. Never stop suddenly — taper as directed.' },
  { name: 'Methylprednisolone', cat: 'Corticosteroid', brands: ['Medrol', 'Solumedrol', 'Depo-Medrol'], doses: ['4mg', '8mg', '16mg', '32mg'], route: 'Oral/IV', tip: 'Morning with food.' },
  { name: 'Deflazacort', cat: 'Corticosteroid', brands: ['Defcort', 'Decortil', 'Flazacort'], doses: ['6mg', '12mg', '18mg', '24mg', '30mg', '36mg'], route: 'Oral', tip: 'Better bone profile than prednisolone.' },
  { name: 'Allopurinol', cat: 'Gout', brands: ['Zyloric', 'Aloric', 'Lopurin'], doses: ['100mg', '200mg', '300mg'], route: 'Oral', tip: 'With food. 2-3L water daily.' },
  { name: 'Febuxostat', cat: 'Gout', brands: ['Febuget', 'Urifit', 'Febutaz', 'Febuday'], doses: ['40mg', '80mg', '120mg'], route: 'Oral', tip: 'Monitor liver enzymes.' },
  { name: 'Colchicine', cat: 'Gout', brands: ['Colchicine', 'Colcout', 'Colchily'], doses: ['0.5mg', '1mg'], route: 'Oral', tip: 'Do not exceed prescribed dose.' },
  { name: 'Calcium + Vit D3', cat: 'Bone & Supplement', brands: ['Shelcal', 'Cipcal', 'Ostocalcium', 'Calcimax'], doses: ['500+250IU', '500+500IU', '1000+500IU'], route: 'Oral', tip: 'With meals. Separate from iron 2hrs.' },
  { name: 'Alendronate', cat: 'Bone & Supplement', brands: ['Osteofos', 'Alenost', 'Alendromax'], doses: ['5mg', '10mg', '35mg', '70mg'], route: 'Oral', tip: 'Empty stomach with water. Stay upright 30min.' },
  { name: 'Folic Acid', cat: 'Bone & Supplement', brands: ['Folvite', 'Fa-5', 'Folicip', 'Folinext'], doses: ['1mg', '5mg'], route: 'Oral', tip: 'On Methotrexate: take on different day than MTX.' },
  { name: 'Vitamin D3', cat: 'Bone & Supplement', brands: ['D-Rise', 'Calcirol', 'Arachitol', 'Uprise-D3'], doses: ['1000 IU', '2000 IU', '60000 IU sachet'], route: 'Oral', tip: 'Take with fatty meal.' },
  { name: 'Vitamin B12', cat: 'Bone & Supplement', brands: ['Mecobal', 'Methycobal', 'Nervijen'], doses: ['500mcg', '1000mcg', '1500mcg'], route: 'Oral', tip: 'With or without food.' },
  { name: 'Iron (Ferrous Sulphate)', cat: 'Bone & Supplement', brands: ['Autrin', 'Feronia-XT', 'Orofer'], doses: ['150mg', '200mg', '325mg'], route: 'Oral', tip: 'Empty stomach or with Vit C.' },
  { name: 'Pantoprazole', cat: 'Gastroprotective', brands: ['Pantocid', 'Pan-D', 'Pantop', 'Pantoday'], doses: ['20mg', '40mg'], route: 'Oral', tip: 'Before breakfast empty stomach.' },
  { name: 'Rabeprazole', cat: 'Gastroprotective', brands: ['Razo', 'Rablet', 'Rabeloc'], doses: ['10mg', '20mg'], route: 'Oral', tip: 'Before breakfast.' },
  { name: 'Esomeprazole', cat: 'Gastroprotective', brands: ['Nexium', 'Esomac', 'Raciper', 'Sompraz'], doses: ['20mg', '40mg'], route: 'Oral', tip: 'Before breakfast.' },
  { name: 'Pregabalin', cat: 'Pain/Neuropathic', brands: ['Lyrica', 'Pregalin', 'Nervilax', 'Pregastar'], doses: ['25mg', '50mg', '75mg', '150mg', '300mg'], route: 'Oral', tip: 'May cause drowsiness.' },
];

export const CATEGORIES: readonly string[] = ['All', ...Array.from(new Set(DRUGS.map((d) => d.cat)))];
