// npm i pptxgenjs   (required for the offline PPTX export button)
import React, { useState, useMemo } from 'react';
import {
  Activity, Droplets, Map, ShieldAlert, Search, AlertTriangle,
  ChevronRight, ChevronLeft, Download, Beef, Loader2, Network
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Legend, ScatterChart, Scatter, ZAxis, Cell
} from 'recharts';

/* =====================  DATA  ===================== */
// NOTE: verify every figure against its primary source before presenting.
const globalCholeraData = [
  { year: '2021', cases: 223370, deaths: 4000 },
  { year: '2022', cases: 472697, deaths: 2349 },
  { year: '2023', cases: 535321, deaths: 4000 },
  { year: '2024', cases: 600000, deaths: 5500 },
  { year: '2025', cases: 451499, deaths: 7870 }
];

const pakFloodDiseaseData = [
  { disease: 'Malaria', prevalence: 44 },
  { disease: 'Diarrhea', prevalence: 17 },
  { disease: 'Skin Infections', prevalence: 11 },
  { disease: 'Eye Infections', prevalence: 8 },
  { disease: 'Typhoid (XDR)', prevalence: 5 }
];

type Domain = 'Human' | 'Veterinary' | 'Zoonotic';
const DOMAINS: Domain[] = ['Human', 'Veterinary', 'Zoonotic'];
const DOMAIN_COLOR: Record<Domain, string> = { Human: '#ef4444', Veterinary: '#8b5cf6', Zoonotic: '#10b981' };

// Semi-quantitative, ILLUSTRATIVE index (0-100) – replace with sourced data.
const bubbleData = [
  { disease: 'Cholera', domain: 'Human', cases: 451499, severity: 85, spreadRate: 90 },
  { disease: 'Typhoid XDR', domain: 'Human', cases: 150000, severity: 95, spreadRate: 65 },
  { disease: 'Hepatitis E', domain: 'Zoonotic', cases: 200000, severity: 60, spreadRate: 55 },
  { disease: 'Shigellosis', domain: 'Human', cases: 300000, severity: 55, spreadRate: 75 },
  { disease: 'Fascioliasis', domain: 'Veterinary', cases: 850000, severity: 40, spreadRate: 80 },
  { disease: 'Cryptosporidiosis', domain: 'Veterinary', cases: 600000, severity: 35, spreadRate: 85 },
  { disease: 'Leptospirosis', domain: 'Zoonotic', cases: 250000, severity: 75, spreadRate: 50 },
  { disease: 'Giardiasis', domain: 'Zoonotic', cases: 900000, severity: 20, spreadRate: 70 },
  { disease: 'Campylobacteriosis', domain: 'Zoonotic', cases: 500000, severity: 30, spreadRate: 60 },
  { disease: 'Salmonellosis (NTS)', domain: 'Zoonotic', cases: 450000, severity: 45, spreadRate: 65 }
] as { disease: string; domain: Domain; cases: number; severity: number; spreadRate: number }[];

const pathogens = [
  { name: 'Vibrio cholerae', domain: 'Human', agent: 'Bacterium', hosts: 'Humans (aquatic reservoirs)', route: 'Contaminated water/food', impact: 'Profuse watery diarrhoea; CFR >1% when care is delayed', control: 'WASH, OCV, rapid ORS/IV rehydration' },
  { name: 'Salmonella Typhi (XDR)', domain: 'Human', agent: 'Bacterium', hosts: 'Humans', route: 'Faecal-oral via water/food', impact: 'Enteric fever; limited oral treatment options', control: 'TCV vaccine, WASH, culture-guided therapy' },
  { name: 'Shigella spp.', domain: 'Human', agent: 'Bacterium', hosts: 'Humans, primates', route: 'Faecal-oral; person-to-person', impact: 'Dysentery; very low infectious dose; rising AMR', control: 'Handwashing, sanitation, selective antibiotics' },
  { name: 'Hepatitis E virus', domain: 'Zoonotic', agent: 'Virus', hosts: 'Humans, swine, ruminants', route: 'Water (HEV-1/2); meat/zoonotic (HEV-3/4)', impact: 'High CFR in pregnancy; post-flood outbreaks', control: 'Safe water, meat hygiene, vaccine where licensed' },
  { name: 'Leptospira spp.', domain: 'Zoonotic', agent: 'Bacterium', hosts: 'Cattle, buffalo, rodents, dogs, humans', route: 'Urine-contaminated water/mud', impact: 'Abortion/infertility in herds; Weil’s disease in humans', control: 'Rodent control, vaccination, PPE, drainage' },
  { name: 'Cryptosporidium spp.', domain: 'Zoonotic', agent: 'Protozoan', hosts: 'Calves, humans', route: 'Oocysts in water/troughs', impact: 'Calf scours; chlorine-resistant', control: 'Filtration, calf-pen hygiene, colostrum' },
  { name: 'Giardia duodenalis', domain: 'Zoonotic', agent: 'Protozoan', hosts: 'Humans, livestock, dogs', route: 'Cysts in water', impact: 'Malabsorption, poor weight gain', control: 'Filtration, treat water sources, antiparasitics' },
  { name: 'Campylobacter spp.', domain: 'Zoonotic', agent: 'Bacterium', hosts: 'Poultry, cattle, humans', route: 'Farm runoff; raw milk', impact: 'Leading bacterial gastroenteritis', control: 'Runoff management, milk pasteurisation' },
  { name: 'Non-typhoidal Salmonella', domain: 'Zoonotic', agent: 'Bacterium', hosts: 'Cattle, poultry, humans', route: 'Faecal contamination of water/feed', impact: 'Herd enteritis; foodborne illness', control: 'Biosecurity, water sanitation, feed hygiene' },
  { name: 'Fasciola hepatica / gigantica', domain: 'Veterinary', agent: 'Liver fluke', hosts: 'Cattle, buffalo, sheep (snail host Lymnaea)', route: 'Metacercariae on flooded pasture', impact: 'Liver damage, lower milk/weight gain', control: 'Strategic fluke-icides, snail habitat control' },
  { name: 'Toxigenic cyanobacteria', domain: 'Veterinary', agent: 'Algal toxins', hosts: 'Livestock', route: 'Stagnant, nutrient-rich ponds', impact: 'Acute toxicosis and sudden death', control: 'Fence off ponds, trough water from clean sources' }
] as { name: string; domain: Domain; agent: string; hosts: string; route: string; impact: string; control: string }[];

const referencesDB = [
  { id: 1, title: 'WHO Cholera Upsurge Update', type: 'Report', date: 'Sept 2026' },
  { id: 2, title: 'PCRWR National Water Quality Report', type: 'Gov Data', date: '2025' },
  { id: 3, title: 'Veterinary Epidemiology of Fascioliasis in Punjab', type: 'Journal', date: '2026' },
  { id: 4, title: 'WER No 36: Cholera Situation', type: 'Journal', date: '2025' },
  { id: 5, title: 'BMJ Global Health (Koua et al.)', type: 'Journal', date: '2025' },
  { id: 6, title: 'Zoonotic Leptospirosis in Commercial Dairies', type: 'Veterinary Record', date: '2025' },
  { id: 7, title: 'Water Research (Wang et al.)', type: 'Journal', date: '2025' }
];

/* =====================  SLIDES (single source for web AND pptx)  ===================== */
const d = (stat: string, label: string, desc: string) => ({ stat, label, desc });

const slides: any[] = [
  { type: 'title', category: 'Overview' },
  { type: 'header', category: 'Overview', title: 'The Global Burden', subtitle: 'Analyzing the 2021-2026 Cholera Upsurge.', Icon: Activity },
  { type: 'data', category: 'Global Data', title: 'Global Cholera Snapshot (2026)',
    alert: 'CFR above 1% signals people are not reaching treatment in time.',
    content: [
      d('451,499', 'Reported Cases', 'In 47 countries, up from 35 countries in 2021.'),
      d('7,870', 'Reported Deaths', 'Deaths rose every year from 2022 to 2026.'),
      d('1.3M+', 'Estimated Cases', 'Reported figures understate true burden.'),
      d('2.2%', 'African Region CFR', 'Far above the WHO target (<1%).')] },
  { type: 'chart', chart: 'cholera', category: 'Global Data', title: 'Cholera Mortality Surge (2021-2026)',
    description: 'Deaths rose ~43% from 2024 to 2026 even though reported cases fell.' },

  // One Health
  { type: 'header', category: 'One Health', title: 'One Health Interface', subtitle: 'Humans, livestock and shared water sources: one transmission system.', Icon: Network },
  { type: 'data', category: 'One Health', title: 'Shared Transmission Pathways',
    alert: 'Over half of human infectious diseases have animal origins; water is a common bridge.',
    content: [
      d('Faecal-oral', 'Human', 'Contaminated drinking water, food and hands drive cholera, typhoid and shigellosis.'),
      d('Runoff', 'Livestock → Water', 'Manure and urine enter ponds and canals, loading water with Campylobacter, Cryptosporidium and Leptospira.'),
      d('Flooding', 'Amplifier', 'Floods mix human, animal and sewage waste and displace populations and herds together.'),
      d('Spillback', 'Water → Both', 'The same pond serves people, trough and field: reinfection cycles continue.')] },
  { type: 'explorer', category: 'One Health', title: 'Interactive Pathogen Explorer',
    description: 'Search or filter by host domain. Click a column-heading free text search to find agent, host or route.' },
  { type: 'bubble', category: 'One Health', title: 'Interactive Analysis: Waterborne Disease Matrix',
    description: 'Transmission speed (X) vs clinical severity (Y); bubble size = estimated annual cases. Toggle domains. Illustrative index.' },

  // Veterinary
  { type: 'header', category: 'Veterinary', title: 'Veterinary Epidemiology', subtitle: 'Herd health, zoonotic spillovers, and communal water troughs.', Icon: Beef },
  { type: 'data', category: 'Veterinary', title: 'Waterborne Pathogens in Livestock',
    alert: 'Large ruminant exposure to stagnant ponds rapidly amplifies environmental pathogen loads.',
    content: [
      d('Leptospirosis', 'Zoonotic Threat', 'Shed in urine; hazard for dairy workers, vets and flooded communities.'),
      d('Fascioliasis', 'Liver Fluke', 'Lymnaea snails multiply in flooded fields, cutting cattle/buffalo productivity.'),
      d('Cryptosporidium', 'Calf Diarrhea', 'High morbidity in calf rearing; resistant to standard chlorination.'),
      d('Campylobacter', 'Enteric Runoff', 'Spread through agricultural runoff; major cause of human gastroenteritis.')] },
  { type: 'data', category: 'Veterinary', title: 'Herd-Level Epidemiology: Key Concepts',
    content: [
      d('Point source', 'Common Trough', 'One contaminated water source produces a sharp, herd-wide epidemic curve.'),
      d('Herd prevalence', 'Beyond Individuals', 'Sample by pen and age group; calves are the usual amplifiers.'),
      d('Subclinical', 'Hidden Losses', 'Reduced feed conversion and milk yield often precede visible disease.'),
      d('Biosecurity', 'Control Lever', 'Trough cleaning, separate calf water, fenced ponds and drainage.')] },

  // Pakistan
  { type: 'header', category: 'Pakistan', title: 'Pakistan Focus (2024-2026)', subtitle: 'Post-flood contagion, XDR Typhoid, and the Punjab/Sindh agricultural impact.', Icon: Map },
  { type: 'data', category: 'Pakistan', title: 'Pakistan Baseline & Post-Flood Reality',
    alert: 'PCRWR data indicates less than half the country has access to uncontaminated water sources.',
    content: [
      d('47%', 'Safe Water Access', 'National average per PCRWR.'),
      d('90,000+', 'Diarrhea Cases/Day', 'Recorded in Sindh immediately post-floods.'),
      d('Endemic', 'XDR Typhoid', 'Complicates empirical therapy in urban centres.'),
      d('One Health', 'Missing Link', 'No integrated human-veterinary surveillance; spillovers go untracked.')] },
  { type: 'data', category: 'Pakistan', title: 'Veterinary Impact in Punjab & Sindh',
    alert: 'Livestock health is inextricably linked to human public health in rural tehsils.',
    content: [
      d('Fasciola', 'Large Ruminants', 'Snail proliferation in post-monsoon stagnant water damages livers of cattle and buffaloes.'),
      d('Water Troughs', 'Commercial Dairies', 'Communal sources in 1,000+ head herds drive rapid pathogen transmission.'),
      d('Milk Yield Drop', 'Economic Loss', 'Enteric disease reduces nutrient absorption and milk output.'),
      d('Mastitis', 'Environmental Pathogens', 'Contaminated mud and water expose udders to coliforms.')] },
  { type: 'chart', chart: 'pakFlood', category: 'Pakistan', title: 'Post-Flood Human Disease Prevalence',
    description: 'Proportional breakdown of clinical presentations in flood-affected districts.' },

  // Surveillance & prevention
  { type: 'header', category: 'Surveillance', title: 'Molecular Surveillance', subtitle: 'Genomics and wastewater tracking.', Icon: Search },
  { type: 'data', category: 'Surveillance', title: 'Wastewater Surveillance (WWS)',
    content: [
      d('1 Week', 'Lead Time', 'Detects pathogen spikes before clinical hospitalizations.'),
      d('90%+', 'Viral Detection', 'Detects shedding even from asymptomatic carriers.'),
      d('76.4%', 'NTS-Positive', 'Non-typhoidal Salmonella in influent samples.'),
      d('CholGEN', 'Genomics', 'Genomic networks trace regional spread.')] },
  { type: 'header', category: 'Prevention', title: 'Prevention & Control', subtitle: 'Vaccines buy time; WASH provides the cure.', Icon: ShieldAlert },
  { type: 'data', category: 'Prevention', title: 'WHO Roadmap to 2030',
    content: [
      d('90%', 'Mortality Target', 'Cut cholera deaths 90% vs 2017 baseline.'),
      d('20', 'Country Elimination', 'Eliminate transmission in 20 endemic countries.'),
      d('OCV', 'Vaccine Bottleneck', 'Oral Cholera Vaccine supply lags demand.'),
      d('WASH', 'Sustainable Solution', 'Infrastructure is the only permanent fix.')] },
  { type: 'data', category: 'Prevention', title: 'One Health Control Toolkit',
    content: [
      d('Human', 'Clinical + WASH', 'ORS, vaccines (OCV, TCV), safe water, handwashing, case isolation.'),
      d('Livestock', 'Herd Management', 'Vaccination (e.g. leptospirosis), strategic deworming, clean troughs, calf hygiene.'),
      d('Environment', 'Water Source', 'Fence ponds, drain stagnant water, manage manure and runoff.'),
      d('Surveillance', 'Joint Reporting', 'Share data between public health and veterinary services.')] },

  // Pathogen deep dives
  { type: 'data', category: 'Pathogens', title: 'Deep Dive: Typhoid Fever',
    content: [d('S. Typhi', 'Agent', 'Systemic infection.'), d('11-20M', 'Cases', 'Annual estimates.'), d('XDR', 'Resistance', 'Fluoroquinolone and cephalosporin resistance.'), d('TCV', 'Vaccine', 'Conjugate vaccine highly effective.')] },
  { type: 'data', category: 'Pathogens', title: 'Deep Dive: Hepatitis E',
    content: [d('Viral', 'Classification', 'Faecal-oral transmission.'), d('20%', 'Pregnancy CFR', 'High risk in 3rd trimester.'), d('Outbreaks', 'Post-Flood', 'Common after displacement.'), d('Zoonotic', 'Reservoirs', 'Swine and other domestic animals.')] },
  { type: 'data', category: 'Pathogens', title: 'Deep Dive: Shigellosis',
    content: [d('Shigella', 'Agent', 'Contagious bacterial dysentery.'), d('10-100', 'Infectious Dose', 'Extremely low inoculum.'), d('<5 yrs', 'Vulnerability', 'Children disproportionately affected.'), d('AMR', 'Resistance', 'Increasing globally.')] },
  { type: 'data', category: 'Pathogens', title: 'Deep Dive: Giardiasis',
    content: [d('G. duodenalis', 'Agent', 'Protozoan forming cysts.'), d('Chlorine', 'Resistance', 'Cysts survive standard chlorination.'), d('Zoonotic', 'Transmission', 'Humans and livestock cross-infect.'), d('Chronic', 'Impact', 'Malabsorption and weight loss.')] },
  { type: 'data', category: 'Climate', title: 'Climate Change Amplification',
    content: [d('Warming', 'Pathogen Survival', 'Warmer water favours Vibrio.'), d('Flooding', 'Contamination', 'Flushes faecal matter into supplies.'), d('Drought', 'Stagnation', 'Concentrates pathogens in remaining sources.'), d('Extremes', 'Hydrometeorological', 'Strong drivers of diarrhoeal disease.')] },
  { type: 'data', category: 'Climate', title: 'Climate Forecasting',
    content: [d('Bangladesh', 'Coastal Peaks', 'Admissions peak in hot months.'), d('Bacterial', 'Projections', 'Diarrhoeal burden projected to rise.'), d('Viral', 'Projections', 'Viral etiology projected to fall.'), d('Adaptation', 'Urgency', 'Impacts multiply without adaptation.')] },
  { type: 'references', category: 'References' }
].map((s, i) => ({ ...s, id: i + 1 }));

/* =====================  PPTX EXPORT (runs fully in the browser, no network needed)  ===================== */
async function exportPptx() {
  const { default: PptxGenJS } = await import('pptxgenjs');
  const p = new PptxGenJS();
  p.layout = 'LAYOUT_WIDE'; // 13.33 x 7.5 in
  const NAVY = '0F172A', BLUE = '2563EB', SLATE = '475569';

  const base = (title: string, desc?: string) => {
    const s = p.addSlide();
    s.background = { color: 'F8FAFC' };
    s.addText(title, { x: 0.5, y: 0.3, w: 12.3, h: 0.7, fontSize: 28, bold: true, color: NAVY });
    if (desc) s.addText(desc, { x: 0.5, y: 0.95, w: 12.3, h: 0.5, fontSize: 14, color: SLATE });
    return s;
  };
  const pagedTable = (title: string, header: string[], rows: string[][], per: number, widths: number[]) => {
    for (let i = 0; i < rows.length; i += per) {
      const s = base(rows.length > per ? `${title} (${Math.floor(i / per) + 1}/${Math.ceil(rows.length / per)})` : title);
      const head = header.map(h => ({ text: h, options: { bold: true, color: 'FFFFFF', fill: { color: NAVY } } }));
      s.addTable([head, ...rows.slice(i, i + per).map(r => r.map(c => ({ text: c })))],
        { x: 0.5, y: 1.3, w: 12.3, colW: widths, fontSize: 11, border: { type: 'solid', color: 'CBD5E1', pt: 0.5 }, valign: 'middle' });
    }
  };

  for (const sl of slides) {
    if (sl.type === 'title') {
      const s = p.addSlide(); s.background = { color: NAVY };
      s.addText('Epidemiology of Waterborne Diseases', { x: 0.7, y: 2.2, w: 12, h: 1, fontSize: 40, bold: true, color: 'FFFFFF' });
      s.addText('Global Burden, Zoonotic Spillovers, and the Pakistan Post-Flood Reality', { x: 0.7, y: 3.3, w: 12, h: 0.7, fontSize: 20, color: '93C5FD' });
      s.addText('Clinical & Veterinary Overview', { x: 0.7, y: 4.2, w: 12, h: 0.5, fontSize: 14, color: 'CBD5E1' });
    } else if (sl.type === 'header') {
      const s = p.addSlide(); s.background = { color: 'EFF6FF' };
      s.addShape(p.ShapeType.rect, { x: 0.5, y: 2.3, w: 0.15, h: 2.2, fill: { color: BLUE } });
      s.addText(sl.title, { x: 0.9, y: 2.3, w: 11.5, h: 1.1, fontSize: 36, bold: true, color: NAVY });
      s.addText(sl.subtitle, { x: 0.9, y: 3.5, w: 11, h: 1, fontSize: 20, color: SLATE });
    } else if (sl.type === 'data') {
      const s = base(sl.title);
      sl.content.forEach((c: any, i: number) => {
        const x = 0.5 + (i % 2) * 6.25, y = 1.3 + Math.floor(i / 2) * 2.35;
        s.addShape(p.ShapeType.rect, { x, y, w: 6.05, h: 2.2, fill: { color: 'FFFFFF' }, line: { color: 'E2E8F0', width: 1 } });
        s.addText(c.stat, { x: x + 0.2, y: y + 0.1, w: 5.6, h: 0.65, fontSize: 26, bold: true, color: BLUE });
        s.addText(c.label, { x: x + 0.2, y: y + 0.75, w: 5.6, h: 0.4, fontSize: 15, bold: true, color: NAVY });
        s.addText(c.desc, { x: x + 0.2, y: y + 1.15, w: 5.6, h: 0.95, fontSize: 12, color: SLATE, valign: 'top' });
      });
      if (sl.alert) {
        s.addShape(p.ShapeType.rect, { x: 0.5, y: 6.1, w: 12.3, h: 0.9, fill: { color: 'FEF2F2' }, line: { color: 'EF4444', width: 1 } });
        s.addText(sl.alert, { x: 0.7, y: 6.1, w: 11.9, h: 0.9, fontSize: 13, bold: true, color: '991B1B' });
      }
    } else if (sl.type === 'chart') {
      const s = base(sl.title, sl.description);
      if (sl.chart === 'cholera') {
        const labels = globalCholeraData.map(r => r.year);
        s.addChart(p.charts.AREA, [{ name: 'Reported Cases', labels, values: globalCholeraData.map(r => r.cases) }],
          { x: 0.5, y: 1.6, w: 6.1, h: 5.2, chartColors: ['3B82F6'], showLegend: true, legendPos: 'b', showTitle: true, title: 'Cases' });
        s.addChart(p.charts.BAR, [{ name: 'Reported Deaths', labels, values: globalCholeraData.map(r => r.deaths) }],
          { x: 6.8, y: 1.6, w: 6, h: 5.2, chartColors: ['EF4444'], showLegend: true, legendPos: 'b', showTitle: true, title: 'Deaths' });
      } else {
        s.addChart(p.charts.BAR, [{ name: 'Prevalence (%)', labels: pakFloodDiseaseData.map(r => r.disease), values: pakFloodDiseaseData.map(r => r.prevalence) }],
          { x: 0.5, y: 1.6, w: 12.3, h: 5.2, barDir: 'bar', chartColors: ['0369A1'], showValue: true, showLegend: false });
      }
    } else if (sl.type === 'bubble') {
      const s = base(sl.title, 'Bubble plot is interactive in the web app; values shown as a table here (illustrative index).');
      const head = ['Disease', 'Domain', 'Est. annual cases', 'Severity', 'Spread'].map(h => ({ text: h, options: { bold: true, color: 'FFFFFF', fill: { color: NAVY } } }));
      s.addTable([head, ...bubbleData.map(b => [b.disease, b.domain, b.cases.toLocaleString(), String(b.severity), String(b.spreadRate)].map(t => ({ text: t })))],
        { x: 0.5, y: 1.6, w: 12.3, colW: [3.6, 2, 2.7, 2, 2], fontSize: 12, border: { type: 'solid', color: 'CBD5E1', pt: 0.5 } });
    } else if (sl.type === 'explorer') {
      pagedTable(sl.title, ['Pathogen', 'Domain', 'Hosts', 'Route', 'Impact', 'Control'],
        pathogens.map(x => [x.name, x.domain, x.hosts, x.route, x.impact, x.control]), 4, [1.9, 1.1, 2.2, 2.2, 2.5, 2.4]);
    } else if (sl.type === 'references') {
      pagedTable('References', ['Source / Title', 'Type', 'Year'], referencesDB.map(r => [r.title, r.type, r.date]), 10, [8, 2.5, 1.8]);
    }
  }
  await p.writeFile({ fileName: 'Waterborne_Disease_Epidemiology.pptx' });
}

/* =====================  UI COMPONENTS  ===================== */
const Chip = ({ active, color, onClick, children }: any) => (
  <button onClick={onClick}
    className={`px-3 py-1 text-sm font-medium border rounded-full transition-colors ${active ? 'text-white border-transparent' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}
    style={active ? { background: color || '#2563eb' } : undefined}>
    {children}
  </button>
);

const TitleSlide = () => {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const run = async () => {
    setBusy(true); setErr('');
    try { await exportPptx(); } catch (e) { console.error(e); setErr('Could not build the PPTX. Please try again.'); }
    setBusy(false);
  };
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 text-center">
      <div className="p-6 mb-6 text-blue-700 bg-blue-100 rounded-full"><Droplets size={64} /></div>
      <h1 className="mb-6 text-5xl font-bold text-slate-800">Epidemiology of Waterborne Diseases</h1>
      <h2 className="mb-8 text-2xl text-slate-600">Global Burden, Zoonotic Spillovers, and the Pakistan Post-Flood Reality</h2>
      <span className="px-4 py-2 text-sm font-medium rounded-full bg-slate-100 text-slate-600">Human & Veterinary Overview</span>
      <button onClick={run} disabled={busy}
        className="inline-flex items-center gap-2 px-6 py-3 mt-8 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60">
        {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
        {busy ? 'Building PPTX…' : 'Download as PPTX (offline copy)'}
      </button>
      {err && <p className="mt-3 text-sm text-red-600">{err}</p>}
    </div>
  );
};

const SectionHeader = ({ title, subtitle, Icon }: any) => (
  <div className="flex flex-col justify-center h-full pl-8 border-l-8 border-blue-600">
    {Icon && <Icon size={48} className="mb-4 text-blue-600" />}
    <h2 className="mb-4 text-4xl font-bold text-slate-800">{title}</h2>
    <p className="max-w-2xl text-xl text-slate-600">{subtitle}</p>
  </div>
);

const DataCardSlide = ({ title, content, alert }: any) => (
  <div className="flex flex-col h-full">
    <h2 className="pb-4 mb-8 text-3xl font-bold border-b text-slate-800">{title}</h2>
    <div className="grid flex-grow grid-cols-2 gap-8">
      {content.map((item: any, i: number) => (
        <div key={i} className="flex flex-col justify-center p-6 bg-white border shadow-sm rounded-xl">
          <div className="mb-2 text-3xl font-bold text-blue-600">{item.stat}</div>
          <div className="mb-2 text-xl font-semibold text-slate-700">{item.label}</div>
          <p className="text-slate-500">{item.desc}</p>
        </div>
      ))}
    </div>
    {alert && (
      <div className="flex items-start gap-4 p-4 mt-8 border-l-4 border-red-500 rounded-r-lg bg-red-50">
        <AlertTriangle className="text-red-500 shrink-0" />
        <p className="font-medium text-red-800">{alert}</p>
      </div>
    )}
  </div>
);

const Frame = ({ title, description, children }: any) => (
  <div className="flex flex-col h-full">
    <div className="mb-6">
      <h2 className="mb-2 text-3xl font-bold text-slate-800">{title}</h2>
      {description && <p className="text-lg text-slate-600">{description}</p>}
    </div>
    <div className="flex flex-col flex-grow min-h-0 p-6 overflow-hidden bg-white border shadow-sm rounded-xl">{children}</div>
  </div>
);

const CholeraChart = () => (
  <ResponsiveContainer width="100%" height="100%">
    <AreaChart data={globalCholeraData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
      <CartesianGrid strokeDasharray="3 3" vertical={false} />
      <XAxis dataKey="year" />
      <YAxis yAxisId="left" stroke="#3b82f6" label={{ value: 'Cases', angle: -90, position: 'insideLeft' }} />
      <YAxis yAxisId="right" orientation="right" stroke="#ef4444" label={{ value: 'Deaths', angle: 90, position: 'insideRight' }} />
      <RechartsTooltip /><Legend />
      <Area yAxisId="left" type="monotone" dataKey="cases" stroke="#3b82f6" fill="#bfdbfe" name="Reported Cases" />
      <Area yAxisId="right" type="monotone" dataKey="deaths" stroke="#ef4444" fill="#fecaca" name="Reported Deaths" />
    </AreaChart>
  </ResponsiveContainer>
);

const PakFloodChart = () => (
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={pakFloodDiseaseData} layout="vertical" margin={{ top: 20, right: 30, left: 80, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} />
      <XAxis type="number" unit="%" />
      <YAxis dataKey="disease" type="category" width={100} />
      <RechartsTooltip />
      <Bar dataKey="prevalence" name="Prevalence (%)" fill="#0369a1" radius={[0, 4, 4, 0]} />
    </BarChart>
  </ResponsiveContainer>
);

const BubbleSlide = ({ title, description }: any) => {
  const [active, setActive] = useState<Domain[]>([...DOMAINS]);
  const toggle = (dm: Domain) => setActive(a => (a.includes(dm) ? a.filter(x => x !== dm) : [...a, dm]));
  return (
    <Frame title={title} description={description}>
      <div className="flex flex-wrap gap-2 mb-3">
        {DOMAINS.map(dm => <Chip key={dm} active={active.includes(dm)} color={DOMAIN_COLOR[dm]} onClick={() => toggle(dm)}>{dm}</Chip>)}
      </div>
      <div className="flex-grow min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 30, bottom: 30, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" dataKey="spreadRate" name="Spread Rate" domain={[40, 100]} label={{ value: 'Transmission Speed (index)', position: 'bottom', offset: 0 }} />
            <YAxis type="number" dataKey="severity" name="Severity" domain={[0, 100]} label={{ value: 'Clinical Severity (index)', angle: -90, position: 'insideLeft' }} />
            <ZAxis type="number" dataKey="cases" range={[200, 2600]} name="Cases" />
            <RechartsTooltip cursor={{ strokeDasharray: '3 3' }}
              content={({ active: a, payload }: any) => a && payload?.length ? (
                <div className="p-3 text-sm bg-white border rounded-lg shadow">
                  <div className="font-bold">{payload[0].payload.disease}</div>
                  <div style={{ color: DOMAIN_COLOR[payload[0].payload.domain as Domain] }}>{payload[0].payload.domain}</div>
                  <div>Est. cases: {payload[0].payload.cases.toLocaleString()}</div>
                  <div>Severity {payload[0].payload.severity} · Spread {payload[0].payload.spreadRate}</div>
                </div>) : null} />
            <Scatter data={bubbleData.filter(b => active.includes(b.domain))}>
              {bubbleData.filter(b => active.includes(b.domain)).map((b, i) => <Cell key={i} fill={DOMAIN_COLOR[b.domain]} fillOpacity={0.75} />)}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </Frame>
  );
};

const ExplorerSlide = ({ title, description }: any) => {
  const [q, setQ] = useState('');
  const [dom, setDom] = useState<'All' | Domain>('All');
  const rows = useMemo(() => pathogens.filter(x =>
    (dom === 'All' || x.domain === dom) &&
    Object.values(x).join(' ').toLowerCase().includes(q.toLowerCase())), [q, dom]);
  return (
    <Frame title={title} description={description}>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <div className="relative flex-grow max-w-sm">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search pathogen, host, route…"
            className="w-full py-2 pl-10 pr-3 border rounded-lg border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        {(['All', ...DOMAINS] as const).map(dm => (
          <Chip key={dm} active={dom === dm} color={dm === 'All' ? '#334155' : DOMAIN_COLOR[dm as Domain]} onClick={() => setDom(dm)}>{dm}</Chip>
        ))}
      </div>
      <div className="flex-grow overflow-auto">
        <table className="w-full text-sm text-left">
          <thead className="sticky top-0 border-b bg-slate-50">
            <tr>{['Pathogen', 'Domain', 'Hosts', 'Route', 'Impact', 'Control'].map(h => <th key={h} className="p-3 font-semibold text-slate-600">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y">
            {rows.map(r => (
              <tr key={r.name} className="align-top hover:bg-slate-50">
                <td className="p-3 font-medium italic text-slate-800">{r.name}</td>
                <td className="p-3"><span className="px-2 py-0.5 text-xs font-medium text-white rounded-full" style={{ background: DOMAIN_COLOR[r.domain] }}>{r.domain}</span></td>
                <td className="p-3 text-slate-600">{r.hosts}</td>
                <td className="p-3 text-slate-600">{r.route}</td>
                <td className="p-3 text-slate-600">{r.impact}</td>
                <td className="p-3 text-slate-600">{r.control}</td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={6} className="p-6 text-center text-slate-500">No match. Clear the search or choose “All”.</td></tr>}
          </tbody>
        </table>
      </div>
    </Frame>
  );
};

const ReferencesSlide = () => {
  const [q, setQ] = useState('');
  const list = referencesDB.filter(r => (r.title + r.type).toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="flex flex-col h-full">
      <h2 className="mb-6 text-3xl font-bold text-slate-800">Interactive Reference Database</h2>
      <div className="relative mb-6">
        <Search className="absolute text-slate-400 left-3 top-3" size={20} />
        <input type="text" placeholder="Search authors, journals, or topics..." value={q} onChange={e => setQ(e.target.value)}
          className="w-full py-3 pl-10 pr-4 border rounded-lg border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div className="flex-grow overflow-y-auto bg-white border shadow-sm rounded-xl">
        <table className="w-full text-left">
          <thead className="sticky top-0 border-b bg-slate-50">
            <tr>{['Source / Title', 'Type', 'Year'].map(h => <th key={h} className="p-4 font-semibold text-slate-600">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y">
            {list.map(r => (
              <tr key={r.id} className="hover:bg-slate-50">
                <td className="p-4 font-medium text-slate-800">{r.title}</td>
                <td className="p-4"><span className="px-3 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-600">{r.type}</span></td>
                <td className="p-4 text-slate-600">{r.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* =====================  APP  ===================== */
export default function App() {
  const [cur, setCur] = useState(0);
  const next = () => setCur(c => Math.min(c + 1, slides.length - 1));
  const prev = () => setCur(c => Math.max(c - 1, 0));
  const categories = [...new Set(slides.map(s => s.category))];

  const renderSlide = () => {
    const s = slides[cur];
    switch (s.type) {
      case 'title': return <TitleSlide />;
      case 'header': return <SectionHeader {...s} />;
      case 'data': return <DataCardSlide {...s} />;
      case 'chart': return <Frame title={s.title} description={s.description}>{s.chart === 'cholera' ? <CholeraChart /> : <PakFloodChart />}</Frame>;
      case 'bubble': return <BubbleSlide {...s} />;
      case 'explorer': return <ExplorerSlide {...s} />;
      case 'references': return <ReferencesSlide />;
      default: return <div>Slide type not found</div>;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden font-sans bg-slate-50 text-slate-900">
      <div className="z-10 flex flex-col flex-shrink-0 w-64 shadow-xl bg-slate-900 text-slate-300">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-2 text-lg font-bold text-white"><Activity className="text-blue-500" /> EPI-DASH</div>
        </div>
        <div className="flex-grow py-4 overflow-y-auto">
          {categories.map(cat => (
            <div key={cat} className="mb-4">
              <div className="px-6 mb-2 text-xs font-bold tracking-wider uppercase text-slate-500">{cat}</div>
              {slides.map((s, i) => s.category === cat && (
                <button key={s.id} onClick={() => setCur(i)}
                  className={`w-full text-left px-6 py-2 text-sm transition-colors border-l-4 ${cur === i ? 'bg-blue-600 text-white font-medium border-blue-400' : 'hover:bg-slate-800 border-transparent'}`}>
                  {s.title || 'Title Slide'}
                </button>
              ))}
            </div>
          ))}
        </div>
        <div className="p-4 text-xs text-center border-t border-slate-800 text-slate-500">Slide {cur + 1} of {slides.length}</div>
      </div>

      <div className="flex flex-col flex-grow min-w-0">
        <div className="flex-grow p-8 overflow-hidden md:p-12">
          <div className="w-full h-full max-w-6xl mx-auto">{renderSlide()}</div>
        </div>
        <div className="flex items-center justify-between flex-shrink-0 p-4 bg-white border-t">
          <button onClick={prev} disabled={cur === 0}
            className="flex items-center gap-2 px-6 py-2 font-medium transition-colors rounded-lg text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed">
            <ChevronLeft size={20} /> Previous
          </button>
          <div className="flex gap-1">
            {slides.map((_, i) => <div key={i} className={`h-1.5 rounded-full transition-all ${i === cur ? 'w-6 bg-blue-600' : 'w-2 bg-slate-200'}`} />)}
          </div>
          <button onClick={next} disabled={cur === slides.length - 1}
            className="flex items-center gap-2 px-6 py-2 font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
            Next <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}