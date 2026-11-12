// npm i pptxgenjs   (required for the offline PPTX export button)
import React, { useState, useMemo } from 'react';
import {
  Activity, Droplets, Map, ShieldAlert, Search, AlertTriangle,
  ChevronRight, ChevronLeft, Download, Beef, Loader2, Network, Menu, X,
  BookOpen, Waves, Bug, Thermometer, Users, Globe, Skull, Stethoscope, Microscope, TrendingUp, ShieldCheck
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

// Service-ladder breakdown of people lacking SAFELY MANAGED services, 2024, millions (WHO/UNICEF JMP 2025).
const washLadderData = [
  { level: 'Basic service', water: 1400, sanitation: 1900 },
  { level: 'Limited service', water: 287, sanitation: 560 },
  { level: 'Unimproved', water: 302, sanitation: 555 },
  { level: 'Surface / open defecation', water: 106, sanitation: 354 }
];

const INTRO = 'A guided tour of how contaminated water makes people and animals ill: key definitions, the global snapshot, cholera and other waterborne pathogens, the One Health links between humans and livestock, Pakistan’s post-flood reality, and the prevention and surveillance toolkit.';

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
  { id: 7, title: 'Water Research (Wang et al.)', type: 'Journal', date: '2025' },
  { id: 8, title: 'WHO/UNICEF JMP: Progress on Household Drinking Water, Sanitation and Hygiene 2000-2024', type: 'Report', date: '2025' },
  { id: 9, title: 'WHO Fact Sheet: Diarrhoeal Disease', type: 'Fact Sheet', date: '2024' },
  { id: 10, title: 'WHO: Burden of Disease Attributable to Unsafe Drinking-Water, Sanitation and Hygiene (2019 update)', type: 'Report', date: '2023' },
  { id: 11, title: 'GTFCC: Ending Cholera, A Global Roadmap to 2030', type: 'Report', date: '2017' },
  { id: 12, title: 'WHO Fact Sheet: Cholera', type: 'Fact Sheet', date: 'n.d.' },
  { id: 13, title: 'WHO Fact Sheet: Hepatitis E', type: 'Fact Sheet', date: 'n.d.' },
  { id: 14, title: 'Bradley classification of water-related disease (Bradley, 1977; Cairncross & Feachem)', type: 'Textbook', date: '1977' }
];

/* =====================  ILLUSTRATIONS (inline SVG: offline, crisp, also rasterised for the PPTX export)  ===================== */
type Illustration = { w: number; h: number; svg: string; alt: string; caption: string };
const mk = (w: number, h: number, alt: string, caption: string, body: string): Illustration => ({
  w, h, alt, caption,
  svg: `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" font-family="Inter,Segoe UI,Helvetica,Arial,sans-serif">${body}</svg>`
});
const svgUri = (svg: string) => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);

const PERSON = '<g id="p"><circle cx="12" cy="8" r="7"/><path d="M2 40V26a10 10 0 0 1 20 0v14z"/></g>';
const washRow = (y: number, n: number, k: number, big: string, small: string) => {
  let s = '';
  for (let i = 0; i < n; i++) s += `<use xlink:href="#p" transform="translate(${20 + i * 46},${y}) scale(1.4)" fill="${i < k ? '#ef4444' : '#cbd5e1'}"/>`;
  return s + `<text x="300" y="${y + 26}" font-size="24" font-weight="700" fill="#0f172a">${big}</text><text x="300" y="${y + 50}" font-size="14" fill="#475569">${small}</text>`;
};
const germ = (x: number, y: number) =>
  `<g transform="translate(${x},${y})" stroke="#ef4444" stroke-width="2" stroke-linecap="round"><circle r="4.5" fill="#ef4444"/><path d="M0-8v-3M0 8v3M-8 0h-3M8 0h3M-6-6l-2-2M6 6l2 2M6-6l2-2M-6 6l-2 2"/></g>`;
const FARROW = '<defs><marker id="a" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="12" markerHeight="12" orient="auto"><path d="M0 0L10 5L0 10z" fill="#64748b"/></marker></defs>';

const fPills = ['Fluids (water)', 'Fields (soil, crops)', 'Flies', 'Fingers (hands)', 'Food'].map((n, i) => {
  const y = 80 + i * 62;
  return `<line x1="150" y1="215" x2="270" y2="${y}" stroke="#94a3b8" stroke-width="2.5" marker-end="url(#a)"/>` +
    `<line x1="440" y1="${y}" x2="568" y2="215" stroke="#94a3b8" stroke-width="2.5" marker-end="url(#a)"/>` +
    `<rect x="270" y="${y - 22}" width="170" height="44" rx="22" fill="#dbeafe" stroke="#2563eb" stroke-width="2"/>` +
    `<text x="355" y="${y + 5}" text-anchor="middle" font-size="14" font-weight="600" fill="#1e3a8a">${n}</text>`;
}).join('');

const fStage = (col: number, row: number, color: string, n: number, title: string, l: string[]) => {
  const x = 20 + col * 240, y = 30 + row * 200;
  return `<rect x="${x}" y="${y}" width="200" height="130" rx="12" fill="#fff" stroke="#cbd5e1" stroke-width="2"/>` +
    `<path d="M${x} ${y + 34}V${y + 12}a12 12 0 0 1 12-12h176a12 12 0 0 1 12 12v22z" fill="${color}"/>` +
    `<text x="${x + 12}" y="${y + 23}" font-size="14" font-weight="700" fill="#fff">${n}. ${title}</text>` +
    l.map((t, i) => `<text x="${x + 12}" y="${y + 60 + i * 20}" font-size="12" fill="#334155">${t}</text>`).join('');
};

const wwStep = (cx: number, color: string, glyph: string, title: string, a: string, b: string) =>
  `<circle cx="${cx}" cy="64" r="38" fill="${color}"/><g transform="translate(${cx},64)" fill="#fff" stroke="#fff">${glyph}</g>` +
  `<text x="${cx}" y="134" text-anchor="middle" font-size="14" font-weight="700" fill="#0f172a">${title}</text>` +
  `<text x="${cx}" y="154" text-anchor="middle" font-size="12" fill="#475569">${a}</text><text x="${cx}" y="170" text-anchor="middle" font-size="12" fill="#475569">${b}</text>`;

const barrier = (i: number, color: string, glyph: string, title: string, l: string[]) => {
  const x = 20 + i * 175;
  return `<rect x="${x}" y="14" width="155" height="140" rx="12" fill="#fff" stroke="#cbd5e1" stroke-width="2"/>` +
    `<path d="M${x} 46V26a12 12 0 0 1 12-12h131a12 12 0 0 1 12 12v20z" fill="${color}"/>` +
    `<text x="${x + 10}" y="36" font-size="13.5" font-weight="700" fill="#fff">${title}</text>` +
    `<g transform="translate(${x + 77.5},68)">${glyph}</g>` +
    l.map((t, j) => `<text x="${x + 77.5}" y="${108 + j * 17}" text-anchor="middle" font-size="12" fill="#334155">${t}</text>`).join('') +
    (i < 3 ? `<path d="M${x + 157} 84h16" stroke="#64748b" stroke-width="3" marker-end="url(#a)"/>` : '');
};

const ILLUS: Record<string, Illustration> = {
  globalWash: mk(720, 300, 'Pictogram of people lacking safe water, sanitation and hygiene',
    'Global access gaps, 2024 (WHO/UNICEF JMP 2025). Red figures lack the service; ratios are rounded.',
    `<defs>${PERSON}</defs><rect width="720" height="300" rx="16" fill="#f8fafc"/>` +
    washRow(20, 4, 1, '1 in 4 people', 'lack safely managed drinking water (2.1 billion)') +
    washRow(100, 5, 2, '2 in 5 people', 'lack safely managed sanitation (3.4 billion)') +
    washRow(180, 5, 1, '1 in 5 people', 'lack basic hygiene services at home (1.7 billion)') +
    `<use xlink:href="#p" transform="translate(20,258) scale(.7)" fill="#ef4444"/><text x="46" y="274" font-size="12" fill="#475569">without the service</text>` +
    `<use xlink:href="#p" transform="translate(200,258) scale(.7)" fill="#cbd5e1"/><text x="226" y="274" font-size="12" fill="#475569">with the service</text>`),

  oneHealth: mk(640, 450, 'Triangle diagram linking humans, livestock and the environment through shared water',
    'One Health: people, livestock and the environment are linked by the water they share.',
    `<rect width="640" height="450" rx="16" fill="#f8fafc"/>` +
    `<g stroke="#94a3b8" stroke-width="3" stroke-dasharray="6 6"><line x1="320" y1="80" x2="125" y2="335"/><line x1="320" y1="80" x2="515" y2="335"/><line x1="125" y1="335" x2="515" y2="335"/></g>` +
    `<path d="M320 190C320 190 290 228 290 248a30 30 0 0 0 60 0C350 228 320 190 320 190z" fill="#38bdf8" stroke="#0369a1" stroke-width="3"/>` +
    `<text x="320" y="302" text-anchor="middle" font-size="14" font-weight="700" fill="#0369a1">Shared water</text>` +
    `<rect x="172" y="196" width="100" height="24" rx="12" fill="#fff" stroke="#e2e8f0"/><text x="222" y="213" text-anchor="middle" font-size="12" fill="#475569">zoonoses</text>` +
    `<rect x="363" y="196" width="110" height="24" rx="12" fill="#fff" stroke="#e2e8f0"/><text x="418" y="213" text-anchor="middle" font-size="12" fill="#475569">drinking water</text>` +
    `<rect x="255" y="323" width="130" height="24" rx="12" fill="#fff" stroke="#e2e8f0"/><text x="320" y="340" text-anchor="middle" font-size="12" fill="#475569">manure, runoff</text>` +
    `<circle cx="320" cy="80" r="62" fill="#ef4444"/><text x="320" y="86" text-anchor="middle" font-size="18" font-weight="700" fill="#fff">Humans</text>` +
    `<circle cx="125" cy="335" r="62" fill="#8b5cf6"/><text x="125" y="341" text-anchor="middle" font-size="18" font-weight="700" fill="#fff">Livestock</text>` +
    `<circle cx="515" cy="335" r="62" fill="#0ea5e9"/><text x="515" y="341" text-anchor="middle" font-size="16" font-weight="700" fill="#fff">Environment</text>` +
    `<g font-size="12.5" fill="#334155"><text x="392" y="74">cholera, typhoid,</text><text x="392" y="92">shigellosis, hepatitis E</text>` +
    `<g text-anchor="middle"><text x="125" y="420">Leptospira, Fasciola,</text><text x="125" y="437">Cryptosporidium</text>` +
    `<text x="515" y="420">ponds, canals,</text><text x="515" y="437">floodwater, troughs</text></g></g>`),

  faecalOral: mk(720, 400, 'Diagram of faecal-oral transmission routes and the barriers that block them',
    'The five Fs: each route carries pathogens from faeces to a new mouth; barriers interrupt them.',
    `${FARROW}<rect width="720" height="400" rx="16" fill="#f8fafc"/>` + fPills +
    `<rect x="20" y="165" width="130" height="100" rx="14" fill="#92400e"/><text x="85" y="208" text-anchor="middle" font-size="17" font-weight="700" fill="#fff">Faeces</text>` +
    `<text x="85" y="228" text-anchor="middle" font-size="12" fill="#fde68a">infected person</text><text x="85" y="244" text-anchor="middle" font-size="12" fill="#fde68a">or animal</text>` +
    `<rect x="570" y="165" width="130" height="100" rx="14" fill="#ef4444"/><text x="635" y="208" text-anchor="middle" font-size="17" font-weight="700" fill="#fff">New host</text>` +
    `<text x="635" y="228" text-anchor="middle" font-size="12" fill="#fee2e2">swallows the</text><text x="635" y="244" text-anchor="middle" font-size="12" fill="#fee2e2">pathogen</text>` +
    `<g stroke="#10b981" stroke-width="3.5" stroke-dasharray="8 6"><line x1="210" y1="52" x2="210" y2="372"/><line x1="505" y1="52" x2="505" y2="372"/></g>` +
    `<g text-anchor="middle" font-size="12" font-weight="600" fill="#047857"><text x="210" y="18">Primary barrier:</text><text x="210" y="34">sanitation, safe excreta disposal</text>` +
    `<text x="505" y="18">Secondary barriers:</text><text x="505" y="34">safe water, handwashing, food hygiene</text></g>` +
    `<text x="360" y="392" text-anchor="middle" font-size="12" fill="#64748b">Each route is a chance to intervene: the earlier the barrier, the fewer pathogens reach the next step.</text>`),

  iconWaterborne: mk(120, 120, 'Glass of contaminated water', 'Waterborne: swallowed in contaminated water',
    `<circle cx="60" cy="60" r="56" fill="#eff6ff"/><path d="M36 26h48l-7 68a6 6 0 0 1-6 5H49a6 6 0 0 1-6-5z" fill="#bfdbfe" stroke="#2563eb" stroke-width="3"/>` +
    `<path d="M39 52h42l-4 42a6 6 0 0 1-6 5H49a6 6 0 0 1-6-5z" fill="#60a5fa" opacity=".65"/>` + germ(54, 72) + germ(68, 86) + germ(62, 62)),

  iconWashed: mk(120, 120, 'Tap with running water over hands', 'Water-washed: too little water for hygiene',
    `<circle cx="60" cy="60" r="56" fill="#f0fdf4"/><path d="M26 34h40a10 10 0 0 1 10 10v6" fill="none" stroke="#475569" stroke-width="9" stroke-linecap="round"/>` +
    `<rect x="68" y="48" width="18" height="10" rx="3" fill="#475569"/>` +
    `<path d="M77 64c-4 6-5 9-5 11a5 5 0 0 0 10 0c0-2-1-5-5-11z" fill="#38bdf8"/><path d="M77 84c-3 4-4 6-4 8a4 4 0 0 0 8 0c0-2-1-4-4-8z" fill="#7dd3fc"/>` +
    `<path d="M30 104q0-16 12-16h30q12 0 12 11v5z" fill="#fcd9b6" stroke="#b45309" stroke-width="2.5"/>` +
    `<circle cx="38" cy="78" r="6" fill="none" stroke="#22c55e" stroke-width="2.5"/><circle cx="96" cy="76" r="4" fill="none" stroke="#22c55e" stroke-width="2.5"/>`),

  iconBased: mk(120, 120, 'Freshwater snail', 'Water-based: part of the life cycle is in an aquatic host',
    `<circle cx="60" cy="60" r="56" fill="#f5f3ff"/><path d="M12 100q10-8 20 0t20 0t20 0t20 0t20 0" fill="none" stroke="#0ea5e9" stroke-width="4" stroke-linecap="round"/>` +
    `<path d="M22 92q4-14 22-14h36q14 0 18 14z" fill="#a78bfa"/><circle cx="56" cy="62" r="25" fill="#7c3aed"/>` +
    `<path d="M56 62a4 4 0 1 1 5 4a9 9 0 1 1-12-10a15 15 0 1 1 20 21" fill="none" stroke="#ede9fe" stroke-width="3" stroke-linecap="round"/>` +
    `<path d="M92 80l6-18M99 82l12-12" stroke="#7c3aed" stroke-width="3" stroke-linecap="round"/><circle cx="98" cy="60" r="3.5" fill="#7c3aed"/><circle cx="112" cy="69" r="3.5" fill="#7c3aed"/>`),

  iconVector: mk(120, 120, 'Mosquito above water', 'Water-related insect vector: breeds in or bites near water',
    `<circle cx="60" cy="60" r="56" fill="#fffbeb"/><g fill="none" stroke="#0ea5e9" stroke-width="3" stroke-linecap="round"><ellipse cx="60" cy="102" rx="38" ry="5"/><ellipse cx="60" cy="102" rx="22" ry="3"/></g>` +
    `<ellipse cx="68" cy="40" rx="20" ry="7" transform="rotate(-25 68 40)" fill="#bae6fd" stroke="#0284c7" stroke-width="2" opacity=".9"/>` +
    `<ellipse cx="58" cy="44" rx="18" ry="6" transform="rotate(-10 58 44)" fill="#bae6fd" stroke="#0284c7" stroke-width="2" opacity=".9"/>` +
    `<ellipse cx="42" cy="64" rx="24" ry="8" fill="#475569"/><circle cx="72" cy="60" r="9" fill="#334155"/><circle cx="88" cy="57" r="6" fill="#334155"/>` +
    `<path d="M93 58l18-9" stroke="#334155" stroke-width="2.5" stroke-linecap="round"/><path d="M68 68l-6 24M74 68l8 24M80 65l20 24" stroke="#475569" stroke-width="2.5" stroke-linecap="round" fill="none"/>`),

  floodScene: mk(720, 300, 'Flooded village with a buffalo standing in muddy water full of pathogens',
    'Monsoon flooding mixes sewage, manure and runoff and puts people and herds on the same water.',
    `<defs><linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cbd5e1"/><stop offset="1" stop-color="#e2e8f0"/></linearGradient><clipPath id="cp"><rect width="720" height="300" rx="16"/></clipPath></defs>` +
    `<g clip-path="url(#cp)"><rect width="720" height="300" fill="url(#sk)"/>` +
    `<g fill="#94a3b8"><ellipse cx="150" cy="48" rx="62" ry="22"/><ellipse cx="192" cy="38" rx="40" ry="20"/><ellipse cx="520" cy="44" rx="72" ry="24"/><ellipse cx="572" cy="32" rx="44" ry="20"/></g>` +
    `<g stroke="#64748b" stroke-width="2" stroke-linecap="round"><path d="M120 80l-6 18M150 80l-6 18M180 80l-6 18M210 80l-6 18M500 80l-6 18M535 80l-6 18M570 80l-6 18M605 80l-6 18"/></g>` +
    `<rect x="70" y="125" width="120" height="100" fill="#e7d3b5" stroke="#8b6b3d" stroke-width="2"/><polygon points="58,127 130,72 202,127" fill="#9a3412"/><rect x="116" y="165" width="26" height="60" fill="#78350f"/>` +
    `<rect x="250" y="148" width="92" height="77" fill="#ead9bd" stroke="#8b6b3d" stroke-width="2"/><polygon points="240,150 296,108 352,150" fill="#b45309"/><rect x="284" y="180" width="22" height="45" fill="#78350f"/>` +
    `<rect x="478" y="150" width="124" height="56" rx="26" fill="#334155"/><ellipse cx="614" cy="162" rx="22" ry="17" fill="#334155"/><path d="M604 148q-14-22-34-14M622 148q10-20 28-16" stroke="#e2e8f0" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M480 164q-16 4-18 26" stroke="#334155" stroke-width="5" fill="none" stroke-linecap="round"/>` +
    `<rect x="0" y="188" width="720" height="120" fill="#8d7b68" opacity=".92"/><g stroke="#cbbba7" stroke-width="2.5" fill="none" stroke-linecap="round"><path d="M10 205q14-8 28 0t28 0t28 0t28 0t28 0t28 0t28 0t28 0t28 0t28 0t28 0t28 0t28 0t28 0t28 0t28 0t28 0t28 0t28 0t28 0t28 0t28 0t28 0t28 0"/></g>` +
    `<g fill="#ef4444"><circle cx="110" cy="236" r="5"/><circle cx="200" cy="254" r="5"/><circle cx="300" cy="226" r="5"/><circle cx="410" cy="248" r="5"/><circle cx="500" cy="232" r="5"/><circle cx="590" cy="256" r="5"/><circle cx="660" cy="228" r="5"/><circle cx="60" cy="266" r="5"/><circle cx="640" cy="270" r="5"/></g>` +
    `<rect x="150" y="262" width="420" height="28" rx="14" fill="#0f172a" opacity=".7"/><text x="360" y="281" text-anchor="middle" font-size="14" fill="#fff">Floodwater mixes sewage, manure and runoff (red dots = pathogens)</text></g>`),

  vibrio: mk(360, 240, 'Microscope-style illustration of a comma-shaped Vibrio cholerae bacterium with a flagellum',
    'Vibrio cholerae: a curved (comma-shaped) bacterium that swims with a single polar flagellum.',
    `<rect width="360" height="240" rx="16" fill="#0f172a"/><g fill="#1e293b"><circle cx="50" cy="60" r="5"/><circle cx="310" cy="190" r="6"/><circle cx="90" cy="190" r="4"/><circle cx="320" cy="110" r="4"/><circle cx="200" cy="40" r="3"/></g>` +
    `<path d="M112 172C100 100 170 62 236 96" fill="none" stroke="#fb7185" stroke-width="38" stroke-linecap="round"/><path d="M118 168C110 108 168 76 228 100" fill="none" stroke="#fda4af" stroke-width="10" stroke-linecap="round" opacity=".7"/>` +
    `<path d="M252 88C276 74 266 52 292 50S320 72 336 42" fill="none" stroke="#fda4af" stroke-width="3" stroke-linecap="round"/><text x="296" y="90" font-size="12" fill="#cbd5e1">flagellum</text>` +
    `<text x="22" y="34" font-size="20" font-style="italic" font-weight="700" fill="#fff">Vibrio cholerae</text><text x="22" y="210" font-size="12.5" fill="#cbd5e1">Curved Gram-negative rod, about 2 µm long</text><text x="22" y="228" font-size="12.5" fill="#cbd5e1">Swims fast in water using one polar flagellum</text>`),

  fascioliasis: mk(720, 390, 'Six-stage life cycle of the liver fluke Fasciola through snails and grazing livestock',
    'Liver fluke cycle: wet pasture, Lymnaea snails and grazing keep the cycle turning.',
    `${FARROW}<rect width="720" height="390" rx="16" fill="#f8fafc"/>` +
    `<g stroke="#64748b" stroke-width="3" fill="none"><path d="M222 95h34" marker-end="url(#a)"/><path d="M462 95h34" marker-end="url(#a)"/><path d="M600 162v62" marker-end="url(#a)"/><path d="M496 295h-34" marker-end="url(#a)"/><path d="M256 295h-34" marker-end="url(#a)"/><path d="M120 228v-62" marker-end="url(#a)"/></g>` +
    fStage(0, 0, '#0ea5e9', 1, 'Eggs', ['Shed in faeces of infected', 'cattle, buffalo, sheep;', 'develop in fresh water.']) +
    fStage(1, 0, '#0284c7', 2, 'Miracidium', ['Larva hatches and swims;', 'must reach a Lymnaea snail', 'within hours.']) +
    fStage(2, 0, '#8b5cf6', 3, 'Snail host', ['Multiplies inside the snail,', 'which releases cercariae', 'in flooded fields.']) +
    fStage(2, 1, '#16a34a', 4, 'Metacercariae', ['Cercariae encyst on grass', 'and water plants and stay', 'infective on wet pasture.']) +
    fStage(1, 1, '#ef4444', 5, 'Ingestion', ['Livestock swallow cysts', 'while grazing; people can be', 'infected via water plants.']) +
    fStage(0, 1, '#b91c1c', 6, 'Adult fluke', ['Migrates to liver and bile', 'ducts; sheds eggs and the', 'cycle starts again.']) +
    `<text x="360" y="200" text-anchor="middle" font-size="12.5" font-style="italic" fill="#64748b">Wet pasture + snails + grazing = a continuous cycle</text>`),

  wastewater: mk(720, 190, 'Five-step flow from community waste to wastewater sampling, laboratory testing and public-health action',
    'Wastewater surveillance: from shared sewage to an early-warning signal.',
    `${FARROW}<rect width="720" height="190" rx="16" fill="#f8fafc"/>` +
    `<g stroke="#64748b" stroke-width="3"><path d="M116 64h28" marker-end="url(#a)"/><path d="M260 64h28" marker-end="url(#a)"/><path d="M404 64h28" marker-end="url(#a)"/><path d="M548 64h28" marker-end="url(#a)"/></g>` +
    wwStep(72, '#2563eb', '<path d="M-20 2L0-20L20 2zM-14 2h28v18h-28z" stroke="none"/>', 'Community', 'People and animals', 'shed pathogens') +
    wwStep(216, '#0ea5e9', '<rect x="-22" y="-8" width="44" height="16" rx="8" stroke="none"/><path d="M0-22c-5 7-6 9-6 11a6 6 0 0 0 12 0c0-2-1-4-6-11z" stroke="none"/>', 'Sewer', 'Waste is pooled', 'at plant inlet') +
    wwStep(360, '#0d9488', '<path d="M-6-22h12v10l10 24a6 6 0 0 1-6 8h-20a6 6 0 0 1-6-8l10-24z" stroke="none"/>', 'Sampling', 'Influent collected', 'and concentrated') +
    wwStep(504, '#7c3aed', '<rect x="-20" y="2" width="9" height="18" stroke="none"/><rect x="-5" y="-12" width="9" height="32" stroke="none"/><rect x="10" y="-22" width="9" height="42" stroke="none"/>', 'Laboratory', 'PCR detects targets,', 'genomes compared') +
    wwStep(648, '#16a34a', '<path d="M0-22L20-14V4C20 14 10 20 0 24C-10 20-20 14-20 4V-14z" fill="none" stroke-width="4"/><path d="M-9 0l7 7l12-14" fill="none" stroke-width="4" stroke-linecap="round"/>', 'Action', 'Early warning,', 'vaccination, WASH')),

  waterBarriers: mk(720, 214, 'Four layers of protection: protect the source, treat the water, store it safely, and practise hygiene, with a clinical safety net',
    'Multi-barrier protection: each layer catches what the previous one missed.',
    `${FARROW}<rect width="720" height="214" rx="16" fill="#f8fafc"/>` +
    barrier(0, '#16a34a', '<g stroke="#16a34a" stroke-width="3" stroke-linecap="round" fill="none"><path d="M-14-6v22M-4-8v24M6-8v24M16-6v22M-16 0h34M-16 10h34"/></g>', 'Protect the source', ['Fence ponds, wells,', 'drain stagnant water,', 'manage manure runoff']) +
    barrier(1, '#2563eb', '<path d="M0-12c-8 10-10 14-10 18a10 10 0 0 0 20 0c0-4-2-8-10-18z" fill="#38bdf8" stroke="#0369a1" stroke-width="2.5"/><path d="M-5 6l4 4l7-8" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>', 'Treat the water', ['Filter, chlorinate;', 'boil when unsure;', 'cysts need filtration']) +
    barrier(2, '#7c3aed', '<rect x="-12" y="-6" width="26" height="26" rx="5" fill="#ddd6fe" stroke="#7c3aed" stroke-width="2.5"/><path d="M-8-6v-6h18v6" fill="none" stroke="#7c3aed" stroke-width="2.5"/>', 'Store safely', ['Covered, narrow-neck', 'containers; clean', 'troughs and tanks']) +
    barrier(3, '#d97706', '<path d="M-14 18q0-12 10-12h12q10 0 10 9v3z" fill="#fcd9b6" stroke="#b45309" stroke-width="2"/><circle cx="-6" cy="-4" r="4" fill="none" stroke="#d97706" stroke-width="2"/><circle cx="8" cy="-8" r="3" fill="none" stroke="#d97706" stroke-width="2"/>', 'Hygiene and food', ['Soap after toilet and', 'before eating; cook', 'thoroughly; boil milk']) +
    `<rect x="20" y="168" width="680" height="32" rx="16" fill="#fef2f2" stroke="#fca5a5" stroke-width="2"/><text x="360" y="189" text-anchor="middle" font-size="13" font-weight="600" fill="#991b1b">Safety net when barriers fail: ORS, OCV and TCV vaccines, early case reporting</text>`),

  climateDrivers: mk(720, 250, 'Three panels: warming, flooding and drought and how each raises waterborne disease risk',
    'Climate extremes raise waterborne risk in three different ways.',
    `<rect width="720" height="250" rx="16" fill="#f8fafc"/>` +
    [0, 1, 2].map(i => `<rect x="${20 + i * 240}" y="14" width="200" height="222" rx="14" fill="#fff" stroke="#cbd5e1" stroke-width="2"/>`).join('') +
    `<g text-anchor="middle" font-size="16" font-weight="700" fill="#0f172a"><text x="120" y="44">Warming</text><text x="360" y="44">Flooding</text><text x="600" y="44">Drought</text></g>` +
    `<g transform="translate(100,100)"><circle r="20" fill="#f59e0b"/><path d="M0-30v-8M0 30v8M-30 0h-8M30 0h8M-21-21l-6-6M21 21l6 6M21-21l6-6M-21 21l-6 6" stroke="#f59e0b" stroke-width="4" stroke-linecap="round"/></g>` +
    `<g transform="translate(160,100)"><rect x="-5" y="-26" width="10" height="42" rx="5" fill="#fff" stroke="#475569" stroke-width="3"/><circle cy="22" r="9" fill="#ef4444" stroke="#475569" stroke-width="3"/><rect x="-2" y="-8" width="4" height="30" fill="#ef4444"/></g>` +
    `<g transform="translate(360,92)"><g fill="#94a3b8"><ellipse cx="-14" cy="-10" rx="26" ry="14"/><ellipse cx="14" cy="-16" rx="22" ry="14"/></g><path d="M-26 12l-5 14M-10 12l-5 14M6 12l-5 14M22 12l-5 14" stroke="#38bdf8" stroke-width="3" stroke-linecap="round"/></g>` +
    `<path d="M300 140q15-10 30 0t30 0t30 0t30 0" fill="none" stroke="#0ea5e9" stroke-width="4" stroke-linecap="round"/><path d="M300 154q15-10 30 0t30 0t30 0t30 0" fill="none" stroke="#7dd3fc" stroke-width="4" stroke-linecap="round"/>` +
    `<g transform="translate(600,96)"><circle cx="-30" cy="-14" r="14" fill="#f59e0b"/><rect x="-60" y="14" width="120" height="30" rx="6" fill="#b45309"/><path d="M-40 14l8 12l-6 10M-8 14l-6 14l8 8M22 14l8 10l-8 12M44 14l-6 10" stroke="#78350f" stroke-width="2.5" fill="none" stroke-linecap="round"/></g>` +
    `<g text-anchor="middle" font-size="13" fill="#475569"><text x="120" y="184">Warmer water favours</text><text x="120" y="202">Vibrio survival</text><text x="360" y="184">Floods flush faeces</text><text x="360" y="202">into water supplies</text><text x="600" y="184">Low flows concentrate</text><text x="600" y="202">pathogens in sources</text></g>`)
};

/* =====================  SLIDES (single source for web AND pptx)  ===================== */
const d = (stat: string, label: string, desc: string) => ({ stat, label, desc });

const slides: any[] = [
  { type: 'title', category: 'Overview' },

  // Definitions
  { type: 'header', category: 'Definitions', title: 'Definitions & Key Concepts', subtitle: 'A shared vocabulary for waterborne and water-related disease.', Icon: BookOpen,
    blurb: 'Waterborne disease is one branch of a larger family of water-related diseases. Before any data appears, this section fixes the vocabulary so that every later number (cases, case fatality, WASH coverage) means the same thing to every reader.' },
  { type: 'terms', category: 'Definitions', title: 'What Is a Waterborne Disease?',
    intro: 'Six core ideas that frame the rest of this presentation.',
    items: [
      { term: 'Waterborne disease', Icon: Droplets, def: 'An infectious illness caused by bacteria, viruses, protozoa or helminths that people swallow in contaminated water, or in food washed or prepared with it. The water acts as a carrier of the pathogen.', ex: 'Cholera, typhoid fever, hepatitis A and E, giardiasis, shigellosis.' },
      { term: 'Water-related disease', Icon: Waves, def: 'The umbrella term for any disease whose spread depends on water: through drinking it, lacking enough of it for hygiene, living in it, or being bitten by insects that breed in it. Waterborne disease is only one subset.', ex: 'Cholera (waterborne) plus trachoma (water-washed) plus malaria (vector).' },
      { term: 'Faecal-oral transmission', Icon: Bug, def: 'Pathogens leave one host in faeces and enter another through the mouth, carried by water, hands, food, soil or flies. It is the dominant route for most diseases in this deck.', ex: 'Cholera, typhoid, Shigella, hepatitis E.' },
      { term: 'Waterborne zoonosis', Icon: Beef, def: 'A disease shared between animals and humans in which contaminated water is the bridge: animal faeces or urine enter the water, and people (or other animals) are infected by drinking or contact.', ex: 'Leptospirosis, cryptosporidiosis, campylobacteriosis.' },
      { term: 'Diarrhoeal disease', Icon: Stethoscope, def: 'Defined by WHO as passing three or more loose or liquid stools in a day. It is the main clinical expression of most waterborne infections, and the danger is dehydration.', ex: 'Acute watery diarrhoea (cholera); dysentery (Shigella).' },
      { term: 'Microbial contamination', Icon: Microscope, def: 'The presence of disease-causing organisms in water, as opposed to chemical contamination. Safety is checked with an indicator organism: E. coli should not be detectable in any 100 mL sample of drinking water.', ex: 'Faecal indicator bacteria in a village well.' }
    ],
    detail: [
      'Waterborne diseases are infectious, so they can cause outbreaks. This separates them from chemical hazards such as arsenic or fluoride, which harm through long-term exposure rather than infection.',
      'Water is usually a passive carrier: the pathogen only needs to survive in it long enough to be swallowed. Vibrio cholerae is a notable exception that can persist in aquatic environments.',
      'The scope of this deck is microbial: bacteria (Vibrio, Salmonella, Shigella, Campylobacter, Leptospira), viruses (hepatitis E), protozoa (Giardia, Cryptosporidium) and helminths (Fasciola).'
    ] },
  { type: 'terms', category: 'Definitions', title: 'Water-Related Diseases: Four Classes',
    intro: 'The Bradley classification groups water-related disease by how water is involved in transmission.',
    items: [
      { term: 'Waterborne', img: 'iconWaterborne', def: 'The pathogen is swallowed in water contaminated by faeces or urine. Control focuses on water quality: source protection, treatment and safe storage.', ex: 'Cholera, typhoid, hepatitis E, giardiasis.' },
      { term: 'Water-washed', img: 'iconWashed', def: 'Disease spreads when there is too little water for washing hands, faces, bodies and clothes. Control focuses on water quantity and access to hygiene.', ex: 'Trachoma, scabies, skin infections, shigellosis.' },
      { term: 'Water-based', img: 'iconBased', def: 'The pathogen spends part of its life cycle in an aquatic host such as a snail, and people or livestock are infected by drinking, wading or eating water plants.', ex: 'Schistosomiasis, guinea worm, fascioliasis.' },
      { term: 'Water-related insect vector', img: 'iconVector', def: 'Insects that breed in or bite near water carry the pathogen. People need not drink the water at all. Control targets breeding sites and bites.', ex: 'Malaria, dengue, lymphatic filariasis.' }
    ],
    detail: [
      'Each class points to a different control lever: water quality (waterborne), water quantity (water-washed), snail and habitat control (water-based) and vector control (insect vectors).',
      'Many diseases straddle classes. Shigellosis and cholera can be both waterborne and water-washed, because handwashing, which depends on water quantity, also breaks person-to-person spread.',
      'After floods all four classes surge together, which is why the Pakistan post-flood chart later in this deck mixes diarrhoea, skin and eye infections, malaria and typhoid.'
    ] },
  { type: 'figure', category: 'Definitions', title: 'Faecal-Oral Transmission: The Five Fs',
    description: 'How pathogens travel from faeces to a new host, and where barriers can stop them.',
    image: 'faecalOral',
    detail: [
      'Fluids: faeces-contaminated drinking water, ponds, canals and floodwater (cholera, typhoid, hepatitis E).',
      'Fields: soil and crops irrigated with untreated wastewater or fertilised with raw manure (helminths, Salmonella).',
      'Flies: insects carry pathogens from faeces to food and utensils (Shigella, Salmonella).',
      'Fingers: unwashed hands pass pathogens directly to mouths and food, the main route for Shigella.',
      'Food: raw or undercooked food, unpasteurised milk and food washed in unsafe water (Campylobacter, Salmonella).',
      'Sanitation is the primary barrier because it keeps faeces out of the environment; safe water, handwashing, food hygiene and fly control are secondary barriers.'
    ] },
  { type: 'terms', category: 'Definitions', title: 'Epidemiology Vocabulary',
    intro: 'Terms used to describe how much disease there is, and how it behaves in a population.',
    items: [
      { term: 'Incidence', Icon: TrendingUp, def: 'The number of new cases in a defined population over a set period. It measures how fast a disease is spreading.', ex: '451,499 cholera cases reported worldwide in 2025.' },
      { term: 'Prevalence', Icon: Users, def: 'The share of a population that has the disease at a given moment, counting both new and existing cases.', ex: 'If 20 of 100 sampled buffalo carry liver fluke, herd prevalence is 20%.' },
      { term: 'Outbreak / epidemic', Icon: AlertTriangle, def: 'A sudden rise in cases above what is normally expected in a place or group. Epidemic is used when the rise spreads across a wider area or population.', ex: 'Hepatitis E outbreaks after flood displacement.' },
      { term: 'Endemic', Icon: Map, def: 'A disease that is constantly present at a predictable baseline level in a region, with seasonal peaks rather than sudden surprises.', ex: 'XDR typhoid in urban centres of Pakistan.' },
      { term: 'Pandemic', Icon: Globe, def: 'An epidemic that has spread across many countries and continents.', ex: 'The seventh cholera pandemic, ongoing since 1961.' },
      { term: 'Case fatality rate (CFR)', Icon: Skull, def: 'Deaths among reported cases divided by the number of cases, as a percentage. It describes how dangerous the disease is once someone is infected, and falls when treatment is fast.', ex: '2025: 7,870 deaths ÷ 451,499 cases is about 1.7%.' }
    ],
    detail: [
      'Always check the denominator. Incidence and prevalence need a population base; raw counts alone cannot compare countries of different sizes.',
      'CFR depends on who is counted. If mild cases are missed, CFR is inflated; if deaths are missed, it is deflated. This is why a cholera CFR above 1% is read as a service-access signal rather than a simple number.',
      'Mortality rate (deaths per 100,000 people) answers a different question from CFR (deaths per 100 cases): one measures risk to the community, the other measures severity once infected.'
    ] },
  { type: 'terms', category: 'Definitions', title: 'Clinical & Microbiology Terms',
    intro: 'The clinical language behind waterborne infections and their treatment.',
    items: [
      { term: 'Dehydration and ORS', Icon: Droplets, def: 'Dehydration is the loss of body water and salts, the main killer in acute diarrhoea. Oral rehydration salts (ORS), a mixture of clean water, salt and sugar, replace what is lost.', ex: 'Severe cholera can kill within hours without rehydration.' },
      { term: 'Dysentery', Icon: Stethoscope, def: 'Diarrhoea with visible blood, a sign that the infection is invading the lining of the intestine.', ex: 'Shigellosis, amoebiasis.' },
      { term: 'Incubation period', Icon: TrendingUp, def: 'The time between exposure to the pathogen and the first symptoms. Short incubation periods give fast, explosive outbreaks.', ex: 'Cholera: hours to a few days. Typhoid: roughly 1 to 4 weeks.' },
      { term: 'Infectious dose', Icon: Bug, def: 'The number of organisms needed to cause infection. Pathogens with a very low dose spread easily from person to person, not only through water.', ex: 'Shigella: about 10 to 100 organisms.' },
      { term: 'Antimicrobial resistance (AMR)', Icon: ShieldCheck, def: 'The ability of microbes to survive drugs that once killed them, making infections harder, slower and costlier to treat.', ex: 'Rising resistance in Shigella and Salmonella.' },
      { term: 'MDR vs XDR typhoid', Icon: Microscope, def: 'MDR typhoid resists chloramphenicol, ampicillin and co-trimoxazole. XDR typhoid also resists fluoroquinolones and third-generation cephalosporins.', ex: 'XDR S. Typhi was first described in Pakistan in 2016.' }
    ],
    detail: [
      'Cholera treatment is simple and cheap (ORS for most patients, intravenous fluids for severe cases), so deaths are mainly a failure of access and speed rather than of medicine.',
      'AMR is a waterborne issue too: wastewater and contaminated water carry resistant bacteria and resistance genes between people, animals and the environment.',
      'Incubation period and infectious dose shape outbreak patterns: short incubation and a low dose together produce fast-moving outbreaks that are hard to contain by water treatment alone.'
    ] },
  { type: 'terms', category: 'Definitions', title: 'WASH & Public-Health Terms',
    intro: 'The vocabulary used in global water, sanitation and hygiene monitoring.',
    items: [
      { term: 'WASH', Icon: Droplets, def: 'Water, Sanitation and Hygiene: safe water supply, safe disposal of excreta and handwashing, treated as one package because disease control needs all three.', ex: 'A tap, a toilet and a handwashing station at home.' },
      { term: 'Safely managed drinking water', Icon: ShieldCheck, def: 'The top rung of the JMP ladder: water from an improved source located on premises, available when needed and free from faecal and priority chemical contamination.', ex: 'Treated piped water supplied to the yard.' },
      { term: 'Basic drinking water', Icon: Waves, def: 'Water from an improved source that can be collected within a 30-minute round trip, including queuing. Better than nothing, but not guaranteed safe.', ex: 'A protected well down the road.' },
      { term: 'Open defecation', Icon: AlertTriangle, def: 'Defecating in fields, bushes, water bodies or other open spaces instead of a toilet. It puts faeces straight into the environment.', ex: 'Still practised by an estimated 354 million people.' },
      { term: 'DALY', Icon: TrendingUp, def: 'Disability-adjusted life year: one lost year of healthy life, adding years lived with illness to years lost through early death.', ex: '74 million DALYs attributed to unsafe WASH in 2019.' },
      { term: 'JMP and SDG 6', Icon: Globe, def: 'The WHO/UNICEF Joint Monitoring Programme tracks progress on SDG targets 6.1 (safe drinking water) and 6.2 (sanitation and hygiene), the source of the global snapshot slides.', ex: 'JMP 2025 report, covering data to 2024.' }
    ],
    detail: [
      'WASH is treated as a package because one part without the others underperforms: safe water without sanitation is soon recontaminated, and sanitation without handwashing leaves the hands route open.',
      'The JMP service ladder ranks drinking water (safely managed, basic, limited, unimproved, surface water) and sanitation (safely managed, basic, limited, unimproved, open defecation). The global snapshot chart uses exactly these rungs.',
      'Improved does not mean safe. An improved source can still be contaminated, which is why testing and the safely managed criteria matter.'
    ] },
  { type: 'terms', category: 'Definitions', title: 'One Health & Veterinary Terms',
    intro: 'Concepts for reading the livestock and zoonotic slides.',
    items: [
      { term: 'One Health', Icon: Network, def: 'An integrated approach that links the health of people, animals and ecosystems, and brings the human, veterinary and environmental sectors together.', ex: 'Joint outbreak investigation by health and livestock departments.' },
      { term: 'Zoonosis', Icon: Beef, def: 'An infection that can pass between animals and humans, directly or through the environment.', ex: 'Leptospirosis, cryptosporidiosis, Campylobacter.' },
      { term: 'Reservoir host', Icon: Bug, def: 'The species or environment where a pathogen normally lives and multiplies, keeping it alive between outbreaks.', ex: 'Rodents, cattle and buffalo for Leptospira.' },
      { term: 'Intermediate host', Icon: Waves, def: 'An organism in which a parasite must develop through a larval stage before it can infect its final host.', ex: 'Lymnaea snails for Fasciola.' },
      { term: 'Subclinical infection', Icon: Stethoscope, def: 'Infection without obvious signs. The animal looks healthy but grows more slowly, gives less milk and can still shed pathogens.', ex: 'Reduced milk yield with no visible diarrhoea.' },
      { term: 'Biosecurity', Icon: ShieldCheck, def: 'Farm routines that keep pathogens out and stop them spreading: clean water, quarantine, hygiene and manure management.', ex: 'Separate calf water, fenced ponds, cleaned troughs.' }
    ],
    detail: [
      'One Health is operational, not just a slogan: it means joint outbreak investigation, shared laboratory capacity and shared reporting between public health and veterinary services.',
      'Spillover describes a pathogen moving from animals to humans; spillback is the reverse. In shared water, both directions can occur at once.',
      'Subclinical infections matter because animals that look healthy can still shed pathogens into shared water, so herd sampling cannot rely on visible disease.'
    ] },
  { type: 'header', category: 'Overview', title: 'The Global Burden', subtitle: 'Analyzing the 2021-2025 Cholera Upsurge.',
    blurb: 'Waterborne disease is not one problem but many, all sharing the same root: faecal contamination of the water that people and their animals depend on. We first look at the global picture of safe water and diarrhoeal disease, then narrow to cholera, the sharpest indicator of failing water systems.', Icon: Activity },

  // Global waterborne snapshot (comes before cholera)
  { type: 'data', category: 'Global Data', title: 'Global Waterborne Snapshot',
    alert: 'Every waterborne disease in this deck begins where safe water, sanitation and hygiene are missing.',
    image: 'globalWash',
    content: [
      d('2.1 billion', 'Without Safe Drinking Water', 'People lacking safely managed drinking water in 2024: 1 in 4 people worldwide, including 106 million drinking untreated surface water.'),
      d('3.4 billion', 'Without Safe Sanitation', 'People lacking safely managed sanitation in 2024, including 354 million who still practise open defecation.'),
      d('1.7 billion', 'Without Basic Hygiene', 'People lacking basic handwashing facilities at home in 2024; 611 million have no facility at all.'),
      d('1.4 million', 'Preventable Deaths a Year', 'Deaths attributable to unsafe water, sanitation and hygiene in 2019 (WHO), over one million of them from diarrhoea.')],
    detail: [
      'Safely managed means water on premises, available when needed and free from contamination. Anything lower on the service ladder still carries some risk.',
      'The 2.1 billion are not all equal: about 1.4 billion use a basic service, while 106 million drink directly from rivers, ponds or canals (see the breakdown chart that follows).',
      'People in least developed countries are more than twice as likely to lack basic drinking water and sanitation as people elsewhere, and in fragile settings safely managed water coverage is 38 percentage points lower.',
      'Rural coverage of safely managed drinking water rose from 50% to 60% between 2015 and 2024, while urban coverage has stagnated, so cities cannot be assumed to be safe.'
    ] },
  { type: 'data', category: 'Global Data', title: 'Global Waterborne Disease Burden',
    alert: 'Diarrhoea is both preventable and treatable: safe WASH prevents it, and oral rehydration salts with zinc treat most cases.',
    content: [
      d('~1.7 billion', 'Childhood Diarrhoea Cases', 'Nearly 1.7 billion episodes of childhood diarrhoeal disease occur every year worldwide (WHO).'),
      d('443,832', 'Under-5 Deaths a Year', 'Diarrhoea is the third leading cause of death in children aged 1-59 months; a further 50,851 deaths occur at ages 5-9 (WHO, 2024).'),
      d('395,000', 'Child Deaths Linked to WASH', 'Under-5 deaths attributable to unsafe WASH in 2019: 273,000 from diarrhoea and 112,000 from acute respiratory infections.'),
      d('69%', 'Diarrhoea Deaths from Unsafe WASH', 'Share of all diarrhoea deaths in 2019 attributed to unsafe water, sanitation and hygiene (WHO).')],
    detail: [
      'The danger of diarrhoea is dehydration. In children each episode also worsens malnutrition, and malnourished children are more likely to fall ill with the next episode.',
      'Among children under five the most common viral causes are rotavirus, norovirus, adenovirus and astrovirus; rotavirus and E. coli are common across all age groups, and parasites become more frequent at ages 3-5.',
      'More than three-quarters of WASH-attributable deaths occur in the WHO African and South-East Asia regions, and 89% are in low- and lower-middle-income countries. Even in high-income countries about 18% of the diarrhoeal burden could be prevented with better hand hygiene.',
      'Not every diarrhoea case is waterborne: food, person-to-person spread and poor hygiene also drive it, which is why WASH is addressed as one package.'
    ] },
  { type: 'chart', chart: 'wash', category: 'Global Data', title: 'Inside the Headline Numbers (2024)',
    description: 'Where people sit on the service ladder when they lack safely managed drinking water or sanitation (millions of people).',
    detail: [
      'Drinking water: of the 2.1 billion without safely managed services, about 1.4 billion use basic services, 287 million limited services, 302 million unimproved sources and 106 million surface water.',
      'Sanitation: of the 3.4 billion, about 1.9 billion have basic facilities, 560 million limited, 555 million unimproved and 354 million practise open defecation.',
      'The largest group already has a basic service, meaning an improved source or toilet exists, but it may be off-premises, unreliable, untested or not safely emptied. This is why improved does not guarantee safe.',
      'The last category combines surface water (drinking water series) and open defecation (sanitation series), the two most hazardous rungs of their ladders.'
    ] },

  { type: 'data', category: 'Global Data', title: 'Global Cholera Snapshot (2025)',
    image: 'vibrio',
    detail: [
      'Cholera is an acute diarrhoeal infection caused by swallowing food or water contaminated with Vibrio cholerae. Most infections are mild or symptomless, but severe cases produce profuse watery diarrhoea and can kill within hours without rehydration.',
      'Reported cases are only part of the burden: limited laboratory confirmation and weak surveillance mean the estimated 1.3M+ cases is the better planning figure. WHO’s long-standing range is 1.3 to 4.0 million cases and 21,000 to 143,000 deaths a year.',
      'Using the figures above, the 2025 case fatality rate is roughly 1.7% (7,870 deaths ÷ 451,499 cases), against about 0.9% in 2024 (5,500 ÷ 600,000). That pattern is consistent with more patients reaching care late or not at all.',
      'Reporting countries grew from 35 in 2021 to 47 in 2025, showing cholera expanding geographically, with conflict, displacement, floods and drought repeatedly cited as drivers.'
    ],
    alert: 'CFR above 1% signals people are not reaching treatment in time.',
    content: [
      d('451,499', 'Reported Cases', 'In 47 countries, up from 35 countries in 2021.'),
      d('7,870', 'Reported Deaths', 'Deaths rose every year from 2022 to 2025.'),
      d('1.3M+', 'Estimated Cases', 'Reported figures understate true burden.'),
      d('2.2%', 'African Region CFR', 'Far above the WHO target (<1%).')] },
  { type: 'chart', chart: 'cholera', category: 'Global Data', title: 'Cholera Mortality Surge (2021-2025)',
    detail: [
      'How to read it: the blue area (left axis) is reported cases and the red area (right axis) is deaths. The axes have different scales, so compare direction rather than height.',
      'Cases peaked at about 600,000 in 2024 and fell to 451,499 in 2025, yet deaths climbed from 5,500 to 7,870 (about +43%). Fewer cases with more deaths points to a worsening case fatality rate.',
      'The year 2022 is a reminder that low deaths do not mean low risk: reported cases more than doubled that year while deaths were the lowest in the series.',
      'Figures are reported to WHO, so countries with weak surveillance are under-represented.'
    ],
    description: 'Deaths rose ~43% from 2024 to 2025 even though reported cases fell.' },

  // One Health
  { type: 'header', category: 'One Health', title: 'One Health Interface', subtitle: 'Humans, livestock and shared water sources: one transmission system.',
    blurb: 'One Health recognises that people, livestock and the water they share form a single transmission system. A pathogen shed by a buffalo can reach a child’s cup, and an untreated sewage outfall can reach a herd’s trough. This section maps those shared pathways and the pathogens that use them.', Icon: Network },
  { type: 'data', category: 'One Health', title: 'Shared Transmission Pathways',
    image: 'oneHealth',
    detail: [
      'Water is the common bridge: the same canal, pond or shallow well can receive human sewage, receive animal manure and urine, and supply drinking water to both.',
      'Direction varies. Cholera and typhoid are mainly human to water to human; Leptospira, Cryptosporidium and Campylobacter often run animal to water to human; Giardia, non-typhoidal Salmonella and hepatitis E can cycle both ways.',
      'Floods amplify risk because they break these separations: latrines overflow, manure washes into water, and displaced people and animals concentrate on the same dry ground and the same water.',
      'That is why measures that look veterinary, such as fencing ponds or separating trough water, are also public-health measures.'
    ],
    alert: 'Over half of human infectious diseases have animal origins; water is a common bridge.',
    content: [
      d('Faecal-oral', 'Human', 'Contaminated drinking water, food and hands drive cholera, typhoid and shigellosis.'),
      d('Runoff', 'Livestock → Water', 'Manure and urine enter ponds and canals, loading water with Campylobacter, Cryptosporidium and Leptospira.'),
      d('Flooding', 'Amplifier', 'Floods mix human, animal and sewage waste and displace populations and herds together.'),
      d('Spillback', 'Water → Both', 'The same pond serves people, trough and field: reinfection cycles continue.')] },
  { type: 'explorer', category: 'One Health', title: 'Interactive Pathogen Explorer',
    detail: [
      'Use the domain chips to filter: Human (red), Veterinary (violet) and Zoonotic (green). Typing searches every column, so terms like snail, raw milk or runoff find rows by host or route.',
      'Read across a row: agent type, host range, route, impact, control. Notice how many rows share the same controls (clean water, sanitation, hygiene), which is the practical argument for integrated action.',
      'The domain label shows the main setting of concern, not exclusivity. Hepatitis E is labelled Zoonotic because HEV-3 and HEV-4 are animal-linked, while HEV-1 and HEV-2 spread mainly among humans through water.'
    ],
    description: 'Search or filter by host domain. Click a column-heading free text search to find agent, host or route.' },
  { type: 'bubble', category: 'One Health', title: 'Interactive Analysis: Waterborne Disease Matrix',
    detail: [
      'Axes: the horizontal axis is how fast the disease spreads and the vertical axis is clinical severity (both illustrative indices); bubble area is estimated annual cases.',
      'The top-right corner is the priority zone (fast and severe). Cholera and XDR typhoid sit closest to it, while large low bubbles such as giardiasis show high volume but lower severity, with impact felt in growth and productivity rather than deaths.',
      'Index values are illustrative and should be replaced with sourced estimates before publication. Use the chart to compare patterns, not to quote numbers.'
    ],
    description: 'Transmission speed (X) vs clinical severity (Y); bubble size = estimated annual cases. Toggle domains. Illustrative index.' },

  // Veterinary
  { type: 'header', category: 'Veterinary', title: 'Veterinary Epidemiology', subtitle: 'Herd health, zoonotic spillovers, and communal water troughs.',
    blurb: 'Livestock are both victims and amplifiers of waterborne disease. Dense herds on shared ponds and troughs suffer production losses, and the same pathogens can reach farm workers, milk and nearby communities. This section looks at the diseases first, then at the herd-level concepts used to investigate them.', Icon: Beef },
  { type: 'data', category: 'Veterinary', title: 'Waterborne Pathogens in Livestock',
    image: 'fascioliasis',
    detail: [
      'Leptospirosis: infected animals shed bacteria in urine, and the organism survives in warm, wet mud and still water, entering humans through cuts or mucous membranes. In herds it causes abortion and infertility.',
      'Fascioliasis: the liver fluke cycle (illustrated) depends on Lymnaea snails, so post-monsoon flooding that creates snail habitat also creates infection pressure. Losses come from liver damage, poorer weight gain and reduced milk.',
      'Cryptosporidium oocysts resist standard chlorination, so controlling calf diarrhoea relies on filtration, clean pens and adequate colostrum rather than chlorine alone.',
      'Campylobacter often causes little disease in the animal but is a leading bacterial cause of human gastroenteritis, reaching people through farm runoff and raw milk.'
    ],
    alert: 'Large ruminant exposure to stagnant ponds rapidly amplifies environmental pathogen loads.',
    content: [
      d('Leptospirosis', 'Zoonotic Threat', 'Shed in urine; hazard for dairy workers, vets and flooded communities.'),
      d('Fascioliasis', 'Liver Fluke', 'Lymnaea snails multiply in flooded fields, cutting cattle/buffalo productivity.'),
      d('Cryptosporidium', 'Calf Diarrhea', 'High morbidity in calf rearing; resistant to standard chlorination.'),
      d('Campylobacter', 'Enteric Runoff', 'Spread through agricultural runoff; major cause of human gastroenteritis.')] },
  { type: 'data', category: 'Veterinary', title: 'Herd-Level Epidemiology: Key Concepts',
    detail: [
      'A point-source outbreak (one contaminated trough) produces a sharp, steep epidemic curve with many animals falling ill within one incubation period; a propagated outbreak (animal-to-animal spread) produces repeated waves.',
      'Herd prevalence counts the proportion of animals or pens infected. Sampling by pen and age group matters because calves are usually the amplifiers that shed the most pathogen.',
      'Subclinical losses are often the largest economic cost: reduced feed conversion and milk yield may be the only sign, and they are rarely linked to water quality.',
      'Biosecurity levers are cheap relative to treatment: separate calf water, scheduled trough cleaning, fencing and draining ponds all reduce exposure.'
    ],
    content: [
      d('Point source', 'Common Trough', 'One contaminated water source produces a sharp, herd-wide epidemic curve.'),
      d('Herd prevalence', 'Beyond Individuals', 'Sample by pen and age group; calves are the usual amplifiers.'),
      d('Subclinical', 'Hidden Losses', 'Reduced feed conversion and milk yield often precede visible disease.'),
      d('Biosecurity', 'Control Lever', 'Trough cleaning, separate calf water, fenced ponds and drainage.')] },

  // Pakistan
  { type: 'header', category: 'Pakistan', title: 'Pakistan Focus (2024-2025)', subtitle: 'Post-flood contagion, XDR Typhoid, and the Punjab/Sindh agricultural impact.',
    blurb: 'Pakistan carries a double burden: endemic enteric disease and recurrent monsoon flooding. After floods, displaced communities and herds share contaminated water, and weak surveillance means veterinary signals are rarely linked to human illness. This section covers the baseline, the livestock dimension and what clinics saw after the floods.', Icon: Map },
  { type: 'data', category: 'Pakistan', title: 'Pakistan Baseline & Post-Flood Reality',
    image: 'floodScene',
    detail: [
      'A safe-water access rate below half means a large share of the population already drinks from sources at risk of contamination, so a flood turns a chronic problem into an acute emergency.',
      'More than 90,000 diarrhoea cases a day in Sindh is a volume that strains clinics, ORS stocks and water supplies at the same time.',
      'XDR typhoid was first described in Pakistan in 2016 (Hyderabad, Sindh) and has since become established in urban centres. Resistant infections mean fewer oral options and more hospital admissions.',
      'The One Health missing link is a surveillance gap: livestock disease reports sit with veterinary services and human case reports with health departments, so a Leptospira or hepatitis E signal in one is not seen by the other.'
    ],
    alert: 'PCRWR data indicates less than half the country has access to uncontaminated water sources.',
    content: [
      d('47%', 'Safe Water Access', 'National average per PCRWR.'),
      d('90,000+', 'Diarrhea Cases/Day', 'Recorded in Sindh immediately post-floods.'),
      d('Endemic', 'XDR Typhoid', 'Complicates empirical therapy in urban centres.'),
      d('One Health', 'Missing Link', 'No integrated human-veterinary surveillance; spillovers go untracked.')] },
  { type: 'data', category: 'Pakistan', title: 'Veterinary Impact in Punjab & Sindh',
    detail: [
      'Commercial dairies can hold over a thousand head on communal water, so a single contaminated source can expose an entire herd at once.',
      'Fasciola: snails multiply in stagnant post-monsoon water, and infected cattle and buffalo show liver damage, lower weight gain and reduced milk output.',
      'Mastitis: environmental pathogens such as coliforms reach the udder through mud and wet bedding, leading to poorer milk quality, discarded milk and treatment costs.',
      'Rural households often depend on the same animals for income and food, so herd disease quickly becomes household food insecurity as well as a public-health issue.'
    ],
    alert: 'Livestock health is inextricably linked to human public health in rural tehsils.',
    content: [
      d('Fasciola', 'Large Ruminants', 'Snail proliferation in post-monsoon stagnant water damages livers of cattle and buffaloes.'),
      d('Water Troughs', 'Commercial Dairies', 'Communal sources in 1,000+ head herds drive rapid pathogen transmission.'),
      d('Milk Yield Drop', 'Economic Loss', 'Enteric disease reduces nutrient absorption and milk output.'),
      d('Mastitis', 'Environmental Pathogens', 'Contaminated mud and water expose udders to coliforms.')] },
  { type: 'chart', chart: 'pakFlood', category: 'Pakistan', title: 'Post-Flood Human Disease Prevalence',
    detail: [
      'Malaria leads at 44% of presentations even though it is not waterborne: it is a water-related insect-vector disease, because floodwater pools create mosquito breeding sites.',
      'Diarrhoea (17%), skin infections (11%) and eye infections (8%) are mostly waterborne or water-washed, reflecting both contaminated water and too little water for washing.',
      'Typhoid (XDR) at 5% is the smallest bar but the hardest to treat: resistance, not volume, drives its clinical weight.',
      'The five categories add up to 85%, so roughly 15% of presentations were other conditions. Treat the percentages as clinic-reported shares, not population prevalence.'
    ],
    description: 'Proportional breakdown of clinical presentations in flood-affected districts.' },

  // Surveillance & prevention
  { type: 'header', category: 'Surveillance', title: 'Molecular Surveillance', subtitle: 'Genomics and wastewater tracking.',
    blurb: 'Waiting for patients to reach clinics means detecting outbreaks late. Molecular tools move detection earlier: wastewater testing samples a whole community at once, and genomics shows which strains are related and how they travel.', Icon: Search },
  { type: 'data', category: 'Surveillance', title: 'Wastewater Surveillance (WWS)',
    image: 'wastewater',
    detail: [
      'Wastewater captures everyone connected to a sewer, including people with mild or no symptoms, so it works as an early-warning signal that can precede hospital admissions by about a week.',
      'Samples are collected at treatment-plant inlets or pumping stations, concentrated, and tested by PCR (for known targets) and sequencing (for strain identity).',
      'Limits: coverage is restricted to sewered areas, so informal settlements and rural areas are often missed, and results show presence and trend rather than individual cases.',
      'The best use is as a complement to clinical surveillance, not a replacement for it.'
    ],
    content: [
      d('1 Week', 'Lead Time', 'Detects pathogen spikes before clinical hospitalizations.'),
      d('90%+', 'Viral Detection', 'Detects shedding even from asymptomatic carriers.'),
      d('76.4%', 'NTS-Positive', 'Non-typhoidal Salmonella in influent samples.'),
      d('CholGEN', 'Genomics', 'Genomic networks trace regional spread.')] },
  { type: 'header', category: 'Prevention', title: 'Prevention & Control', subtitle: 'Vaccines buy time; WASH provides the cure.',
    blurb: 'Vaccines and treatment save lives during outbreaks, but only safe water, sanitation and hygiene stop the next one. Prevention is therefore layered: protect the source, treat the water, break the faecal-oral routes, then keep vaccines and rapid clinical care as the safety net.', Icon: ShieldAlert },
  { type: 'data', category: 'Prevention', title: 'WHO Roadmap to 2030',
    detail: [
      'Ending Cholera: A Global Roadmap to 2030, from the Global Task Force on Cholera Control, aims to cut cholera deaths by 90% and eliminate transmission in up to 20 countries.',
      'It rests on three axes: early detection and quick response to contain outbreaks; a targeted multisectoral approach to prevent cholera in hotspots; and coordination of technical support, advocacy and resources.',
      'Oral cholera vaccine (OCV) is a short-term shield that buys time while WASH infrastructure is built, but supply has lagged demand.',
      'Without WASH, vaccination campaigns must be repeated, which is why infrastructure is the only permanent fix.'
    ],
    content: [
      d('90%', 'Mortality Target', 'Cut cholera deaths 90% vs 2017 baseline.'),
      d('20', 'Country Elimination', 'Eliminate transmission in 20 endemic countries.'),
      d('OCV', 'Vaccine Bottleneck', 'Oral Cholera Vaccine supply lags demand.'),
      d('WASH', 'Sustainable Solution', 'Infrastructure is the only permanent fix.')] },
  { type: 'data', category: 'Prevention', title: 'One Health Control Toolkit',
    image: 'waterBarriers',
    detail: [
      'Multi-barrier thinking: no single measure is perfect, so each layer catches what the previous layer missed.',
      'For humans: ORS and zinc for diarrhoea, OCV and TCV in targeted populations, safe water storage, handwashing with soap and case isolation during outbreaks.',
      'For livestock: leptospirosis vaccination where available, strategic deworming for flukes, regularly cleaned troughs and separate calf water.',
      'For the environment and surveillance: fence ponds, drain stagnant water, manage manure so it does not reach drinking-water sources, and share data between public-health and veterinary services.'
    ],
    content: [
      d('Human', 'Clinical + WASH', 'ORS, vaccines (OCV, TCV), safe water, handwashing, case isolation.'),
      d('Livestock', 'Herd Management', 'Vaccination (e.g. leptospirosis), strategic deworming, clean troughs, calf hygiene.'),
      d('Environment', 'Water Source', 'Fence ponds, drain stagnant water, manage manure and runoff.'),
      d('Surveillance', 'Joint Reporting', 'Share data between public health and veterinary services.')] },

  // Pathogen deep dives
  { type: 'data', category: 'Pathogens', title: 'Deep Dive: Typhoid Fever',
    detail: [
      'Typhoid (enteric) fever is a systemic infection: sustained fever, headache and abdominal pain, with bacteria entering the bloodstream rather than staying in the gut.',
      'Humans are the only natural host, so transmission depends on faecal contamination of water or food by a case or a chronic carrier.',
      'XDR means resistance to chloramphenicol, ampicillin, co-trimoxazole, fluoroquinolones and third-generation cephalosporins, which narrows treatment to options such as azithromycin or carbapenems.',
      'Typhoid conjugate vaccine (TCV) offers longer and more reliable protection than older vaccines and is recommended by WHO for endemic settings.'
    ],
    content: [d('S. Typhi', 'Agent', 'Systemic infection.'), d('11-20M', 'Cases', 'Annual estimates.'), d('XDR', 'Resistance', 'Fluoroquinolone and cephalosporin resistance.'), d('TCV', 'Vaccine', 'Conjugate vaccine highly effective.')] },
  { type: 'data', category: 'Pathogens', title: 'Deep Dive: Hepatitis E',
    detail: [
      'Hepatitis E virus has four main genotypes that infect humans: HEV-1 and HEV-2 spread among people through contaminated water, while HEV-3 and HEV-4 are zoonotic, linked to swine and other animals and to undercooked meat.',
      'WHO estimates about 20 million infections a year, 3.3 million symptomatic cases and roughly 44,000 deaths (2015 estimate).',
      'Most infections resolve on their own, but pregnant women, especially in the third trimester, are at risk of fulminant liver failure, and flood-related displacement is a classic trigger for outbreaks.',
      'A vaccine exists but is licensed in only a few countries, so control still relies on safe water, sanitation and meat hygiene.'
    ],
    content: [d('Viral', 'Classification', 'Faecal-oral transmission.'), d('20%', 'Pregnancy CFR', 'High risk in 3rd trimester.'), d('Outbreaks', 'Post-Flood', 'Common after displacement.'), d('Zoonotic', 'Reservoirs', 'Swine and other domestic animals.')] },
  { type: 'data', category: 'Pathogens', title: 'Deep Dive: Shigellosis',
    detail: [
      'Shigella causes dysentery: bloody diarrhoea with fever and cramping, because the bacteria invade the lining of the colon. Shigella dysenteriae type 1 can also produce Shiga toxin and severe complications.',
      'An infectious dose of 10 to 100 organisms means spread by hands, flies and food, not only water, so handwashing and sanitation matter as much as water treatment.',
      'Children under five bear most severe disease, and malnourished children are most at risk.',
      'Resistance to commonly used antibiotics has been reported widely, narrowing options and making antibiotics a careful choice reserved for severe cases.'
    ],
    content: [d('Shigella', 'Agent', 'Contagious bacterial dysentery.'), d('10-100', 'Infectious Dose', 'Extremely low inoculum.'), d('<5 yrs', 'Vulnerability', 'Children disproportionately affected.'), d('AMR', 'Resistance', 'Increasing globally.')] },
  { type: 'data', category: 'Pathogens', title: 'Deep Dive: Giardiasis',
    detail: [
      'Giardia duodenalis has two life stages: a fragile trophozoite that lives in the small intestine and a hardy cyst that survives in the environment.',
      'Cysts can persist for weeks to months in cold water and tolerate standard chlorine doses, so filtration or boiling is needed rather than chlorination alone.',
      'Infection often causes greasy diarrhoea, bloating and weight loss, and in children chronic malabsorption can impair growth. Some infected people have no symptoms but keep shedding cysts.',
      'Zoonotic potential varies by genetic assemblage: livestock and dogs can carry types that infect humans, although many human infections involve human-adapted types.'
    ],
    content: [d('G. duodenalis', 'Agent', 'Protozoan forming cysts.'), d('Chlorine', 'Resistance', 'Cysts survive standard chlorination.'), d('Zoonotic', 'Transmission', 'Humans and livestock cross-infect.'), d('Chronic', 'Impact', 'Malabsorption and weight loss.')] },
  { type: 'data', category: 'Climate', title: 'Climate Change Amplification',
    image: 'climateDrivers',
    detail: [
      'Warmer surface water extends the season and range in which Vibrio species grow, especially in brackish coastal water and nutrient-rich ponds.',
      'Heavy rainfall and flooding overwhelm drains and latrines, mixing faeces into drinking-water sources.',
      'Drought works differently: low flows concentrate pathogens, people turn to fewer and less protected sources, and water rationing cuts handwashing.',
      'Both extremes also damage infrastructure, so recovery from one event can leave the system more vulnerable to the next.'
    ],
    content: [d('Warming', 'Pathogen Survival', 'Warmer water favours Vibrio.'), d('Flooding', 'Contamination', 'Flushes faecal matter into supplies.'), d('Drought', 'Stagnation', 'Concentrates pathogens in remaining sources.'), d('Extremes', 'Hydrometeorological', 'Strong drivers of diarrhoeal disease.')] },
  { type: 'data', category: 'Climate', title: 'Climate Forecasting',
    detail: [
      'Bangladesh is a useful case study: diarrhoea admissions in coastal areas peak in the hot months, linking weather directly to hospital load.',
      'Projected shifts are not uniform. Bacterial causes are expected to rise while viral causes are expected to fall, which raises the stakes for antibiotic resistance and diagnostics.',
      'Without adaptation, impacts multiply. Climate-resilient WASH (raised wells, flood-proof latrines, backup supplies) is cheaper than repeated outbreak response.'
    ],
    content: [d('Bangladesh', 'Coastal Peaks', 'Admissions peak in hot months.'), d('Bacterial', 'Projections', 'Diarrhoeal burden projected to rise.'), d('Viral', 'Projections', 'Viral etiology projected to fall.'), d('Adaptation', 'Urgency', 'Impacts multiply without adaptation.')] },
  { type: 'references', category: 'References' }
].map((s, i) => ({ ...s, id: i + 1 }));

/* =====================  PPTX EXPORT (runs fully in the browser, no network needed)  ===================== */
async function exportPptx() {
  const { default: PptxGenJS } = await import('pptxgenjs');
  const p = new PptxGenJS();
  p.layout = 'LAYOUT_WIDE'; // 13.33 x 7.5 in
  const NAVY = '0F172A', BLUE = '2563EB', SLATE = '475569';
  const CH = (p as any).charts; // chart type constants (typed loosely: older typings omit them)

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

  // Rasterise the inline SVG illustrations to PNG (fully offline, via canvas)
  const svgToPng = (key: string, scale = 2) => new Promise<string>((resolve, reject) => {
    const il = ILLUS[key];
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = il.w * scale; c.height = il.h * scale;
      const ctx = c.getContext('2d')!;
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(img, 0, 0, c.width, c.height);
      resolve(c.toDataURL('image/png').replace(/^data:/, ''));
    };
    img.onerror = () => reject(new Error('Could not rasterise ' + key));
    img.src = svgUri(il.svg);
  });
  const used = new Set<string>();
  slides.forEach((sl: any) => { if (sl.image) used.add(sl.image); (sl.items || []).forEach((it: any) => it.img && used.add(it.img)); });
  const png: Record<string, string> = {};
  for (const k of used) { try { png[k] = await svgToPng(k); } catch (e) { console.warn(e); } } // a failed image is skipped, not fatal

  const addPic = (s: any, key: string, x: number, y: number, maxW: number, maxH: number) => {
    if (!png[key]) return;
    const { w, h } = ILLUS[key]; const r = Math.min(maxW / w, maxH / h);
    s.addImage({ data: png[key], x: x + (maxW - w * r) / 2, y: y + (maxH - h * r) / 2, w: w * r, h: h * r });
  };
  const bullets = (items: string[]) => items.map(t => ({ text: t, options: { bullet: true, breakLine: true } }));
  const detailSlide = (title: string, items: string[], imgKey?: string) => {
    const s = base(title);
    const pic = imgKey && png[imgKey];
    if (pic) {
      s.addShape(p.ShapeType.rect, { x: 0.5, y: 1.3, w: 6.2, h: 5.6, fill: { color: 'FFFFFF' }, line: { color: 'E2E8F0', width: 1 } });
      addPic(s, imgKey!, 0.6, 1.4, 6.0, 5.1);
      s.addText(ILLUS[imgKey!].caption, { x: 0.6, y: 6.4, w: 6.0, h: 0.45, fontSize: 9, italic: true, color: '64748B', align: 'center' });
    }
    s.addText(bullets(items), { x: pic ? 6.95 : 0.5, y: 1.3, w: pic ? 5.85 : 12.3, h: 5.7, fontSize: pic ? 13 : 15, color: SLATE, valign: 'top', paraSpaceAfter: 9 });
  };

  for (const sl of slides) {
    if (sl.type === 'title') {
      const s = p.addSlide(); s.background = { color: NAVY };
      s.addText('Epidemiology of Waterborne Diseases', { x: 0.7, y: 2.2, w: 12, h: 1, fontSize: 40, bold: true, color: 'FFFFFF' });
      s.addText('Global Burden, Zoonotic Spillovers, and the Pakistan Post-Flood Reality', { x: 0.7, y: 3.3, w: 12, h: 0.7, fontSize: 20, color: '93C5FD' });
      s.addText('Clinical & Veterinary Overview', { x: 0.7, y: 4.2, w: 12, h: 0.5, fontSize: 14, color: 'CBD5E1' });
      s.addText(INTRO, { x: 0.7, y: 4.9, w: 11.6, h: 1.4, fontSize: 13, color: '94A3B8', valign: 'top' });
    } else if (sl.type === 'header') {
      const s = p.addSlide(); s.background = { color: 'EFF6FF' };
      s.addShape(p.ShapeType.rect, { x: 0.5, y: 2.3, w: 0.15, h: sl.blurb ? 4.4 : 2.2, fill: { color: BLUE } });
      s.addText(sl.title, { x: 0.9, y: 2.3, w: 11.5, h: 1.1, fontSize: 36, bold: true, color: NAVY });
      s.addText(sl.subtitle, { x: 0.9, y: 3.5, w: 11, h: 1, fontSize: 20, color: SLATE });
      if (sl.blurb) s.addText(sl.blurb, { x: 0.9, y: 4.6, w: 11.5, h: 2.1, fontSize: 14, color: '64748B', valign: 'top' });
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
        s.addChart(CH.AREA, [{ name: 'Reported Cases', labels, values: globalCholeraData.map(r => r.cases) }],
          { x: 0.5, y: 1.6, w: 6.1, h: 5.2, chartColors: ['3B82F6'], showLegend: true, legendPos: 'b', showTitle: true, title: 'Cases' });
        s.addChart(CH.BAR, [{ name: 'Reported Deaths', labels, values: globalCholeraData.map(r => r.deaths) }],
          { x: 6.8, y: 1.6, w: 6, h: 5.2, chartColors: ['EF4444'], showLegend: true, legendPos: 'b', showTitle: true, title: 'Deaths' });
      } else if (sl.chart === 'wash') {
        const labels = washLadderData.map(r => r.level);
        s.addChart(CH.BAR, [
          { name: 'Lacking safely managed drinking water', labels, values: washLadderData.map(r => r.water) },
          { name: 'Lacking safely managed sanitation', labels, values: washLadderData.map(r => r.sanitation) }
        ], { x: 0.5, y: 1.6, w: 12.3, h: 5.2, barDir: 'bar', chartColors: ['0369A1', 'F59E0B'], showValue: true, showLegend: true, legendPos: 'b', valAxisTitle: 'People (millions)', showValAxisTitle: true });
      } else {
        s.addChart(CH.BAR, [{ name: 'Prevalence (%)', labels: pakFloodDiseaseData.map(r => r.disease), values: pakFloodDiseaseData.map(r => r.prevalence) }],
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
    } else if (sl.type === 'terms') {
      if (sl.items.every((it: any) => it.img && png[it.img])) {
        // illustrated definitions: 2x2 cards with a picture
        const s = base(sl.title, sl.intro);
        sl.items.slice(0, 4).forEach((it: any, i: number) => {
          const x = 0.5 + (i % 2) * 6.25, y = 1.6 + Math.floor(i / 2) * 2.75;
          s.addShape(p.ShapeType.rect, { x, y, w: 6.05, h: 2.6, fill: { color: 'FFFFFF' }, line: { color: 'E2E8F0', width: 1 } });
          addPic(s, it.img, x + 0.1, y + 0.55, 1.5, 1.5);
          s.addText(it.term, { x: x + 1.8, y: y + 0.1, w: 4.1, h: 0.45, fontSize: 16, bold: true, color: NAVY });
          s.addText(it.def, { x: x + 1.8, y: y + 0.55, w: 4.1, h: 1.35, fontSize: 11, color: SLATE, valign: 'top' });
          if (it.ex) s.addText('Example: ' + it.ex, { x: x + 1.8, y: y + 1.9, w: 4.1, h: 0.65, fontSize: 10, italic: true, color: BLUE, valign: 'top' });
        });
      } else {
        pagedTable(sl.title, ['Term', 'Definition', 'Example'], sl.items.map((it: any) => [it.term, it.def, it.ex || '']), 6, [2.3, 6.9, 3.1]);
      }
    } else if (sl.type === 'figure') {
      const s = base(sl.title, sl.description);
      s.addShape(p.ShapeType.rect, { x: 0.5, y: 1.6, w: 7.6, h: 5.3, fill: { color: 'FFFFFF' }, line: { color: 'E2E8F0', width: 1 } });
      addPic(s, sl.image, 0.6, 1.7, 7.4, 4.8);
      s.addText(ILLUS[sl.image].caption, { x: 0.6, y: 6.45, w: 7.4, h: 0.4, fontSize: 9, italic: true, color: '64748B', align: 'center' });
      s.addText(bullets(sl.detail), { x: 8.3, y: 1.6, w: 4.5, h: 5.3, fontSize: 12, color: SLATE, valign: 'top', paraSpaceAfter: 7 });
    }
    // extra "in detail" slide so the written explanation and picture survive in the PPTX too
    const wantsDetail = sl.type === 'data' ? (sl.detail || sl.image) : ['chart', 'bubble', 'explorer', 'terms'].includes(sl.type) && sl.detail;
    if (wantsDetail) detailSlide(`${sl.title} (in detail)`, sl.detail || [], sl.type === 'data' ? sl.image : undefined);
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

const Figure = ({ id, className = '' }: { id: string; className?: string }) => {
  const il = ILLUS[id];
  if (!il) return null;
  return (
    <figure className={className}>
      <img src={svgUri(il.svg)} alt={il.alt} loading="lazy" className="w-full h-auto bg-white border rounded-xl" />
      <figcaption className="mt-2 text-xs text-center text-slate-500">{il.caption}</figcaption>
    </figure>
  );
};

const DetailPanel = ({ detail, image, heading = 'In more detail' }: { detail: string[]; image?: string; heading?: string }) => (
  <div className="flex flex-col gap-4 p-4 mt-4 bg-white border shadow-sm md:mt-8 md:p-6 md:flex-row md:gap-8 rounded-xl shrink-0">
    {image && <Figure id={image} className="md:w-5/12 md:shrink-0" />}
    {!!detail.length && (
      <div className="flex-1">
        <h3 className="mb-3 text-lg font-semibold text-slate-800">{heading}</h3>
        <ul className="space-y-2 text-sm md:text-base text-slate-600">
          {detail.map((t, i) => (
            <li key={i} className="flex gap-2"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" /><span>{t}</span></li>
          ))}
        </ul>
      </div>
    )}
  </div>
);

const TermsSlide = ({ title, intro, items, detail }: any) => (
  <div className="flex flex-col h-full overflow-y-auto">
    <h2 className="pb-3 mb-4 text-2xl font-bold border-b md:pb-4 md:mb-6 md:text-3xl text-slate-800">{title}</h2>
    {intro && <p className="mb-4 text-sm md:text-lg text-slate-600">{intro}</p>}
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-6">
      {items.map((it: any) => (
        <div key={it.term} className="flex gap-3 p-4 bg-white border shadow-sm md:p-5 rounded-xl">
          {it.img
            ? <img src={svgUri(ILLUS[it.img].svg)} alt={ILLUS[it.img].alt} className="object-contain w-16 h-16 md:w-20 md:h-20 shrink-0" />
            : it.Icon && <div className="flex items-center justify-center w-10 h-10 text-blue-600 rounded-full bg-blue-50 shrink-0"><it.Icon size={20} /></div>}
          <div>
            <div className="mb-1 text-lg font-semibold text-slate-800">{it.term}</div>
            <p className="text-sm md:text-base text-slate-600">{it.def}</p>
            {it.ex && <p className="mt-2 text-sm text-slate-500"><span className="font-medium text-blue-600">Example: </span>{it.ex}</p>}
          </div>
        </div>
      ))}
    </div>
    {detail && <DetailPanel detail={detail} />}
  </div>
);

const FigureSlide = ({ title, description, image, detail }: any) => (
  <div className="flex flex-col h-full overflow-y-auto">
    <div className="mb-3 md:mb-6">
      <h2 className="mb-1 text-2xl font-bold md:mb-2 md:text-3xl text-slate-800">{title}</h2>
      {description && <p className="text-sm md:text-lg text-slate-600">{description}</p>}
    </div>
    <div className="flex flex-col gap-4 p-3 bg-white border shadow-sm md:flex-row md:gap-8 md:p-6 rounded-xl">
      <Figure id={image} className="md:w-3/5 md:shrink-0" />
      <ul className="space-y-3 text-sm md:text-base text-slate-600">
        {(detail || []).map((t: string, i: number) => (
          <li key={i} className="flex gap-2"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" /><span>{t}</span></li>
        ))}
      </ul>
    </div>
  </div>
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
    <div className="flex flex-col items-center justify-center h-full px-2 py-4 overflow-y-auto text-center md:px-8">
      <div className="p-4 mb-4 text-blue-700 bg-blue-100 rounded-full md:p-6 md:mb-6"><Droplets className="w-10 h-10 md:w-16 md:h-16" /></div>
      <h1 className="mb-4 text-3xl font-bold md:mb-6 md:text-5xl text-slate-800">Epidemiology of Waterborne Diseases</h1>
      <h2 className="mb-6 text-lg md:mb-8 md:text-2xl text-slate-600">Global Burden, Zoonotic Spillovers, and the Pakistan Post-Flood Reality</h2>
      <p className="max-w-3xl mb-6 text-sm md:text-base text-slate-500">{INTRO}</p>
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

const SectionHeader = ({ title, subtitle, Icon, blurb }: any) => (
  <div className="flex flex-col justify-center h-full pl-4 overflow-y-auto border-l-4 md:pl-8 md:border-l-8 border-blue-600">
    {Icon && <Icon size={48} className="mb-4 text-blue-600" />}
    <h2 className="mb-4 text-2xl font-bold md:text-4xl text-slate-800">{title}</h2>
    <p className="max-w-2xl text-base md:text-xl text-slate-600">{subtitle}</p>
    {blurb && <p className="max-w-3xl mt-4 text-sm md:mt-6 md:text-lg text-slate-500">{blurb}</p>}
  </div>
);

const DataCardSlide = ({ title, content, alert, detail, image }: any) => (
  <div className="flex flex-col h-full overflow-y-auto">
    <h2 className="pb-3 mb-4 text-2xl font-bold border-b md:pb-4 md:mb-8 md:text-3xl text-slate-800">{title}</h2>
    <div className="grid grid-cols-1 gap-3 md:flex-grow md:grid-cols-2 md:gap-8">
      {content.map((item: any, i: number) => (
        <div key={i} className="flex flex-col justify-center p-4 bg-white border shadow-sm md:p-6 rounded-xl">
          <div className="mb-1 text-2xl md:text-3xl font-bold text-blue-600">{item.stat}</div>
          <div className="mb-1 text-lg font-semibold md:text-xl text-slate-700">{item.label}</div>
          <p className="text-sm md:text-base text-slate-500">{item.desc}</p>
        </div>
      ))}
    </div>
    {alert && (
      <div className="flex items-start gap-4 p-3 mt-4 md:p-4 md:mt-8 border-l-4 border-red-500 rounded-r-lg bg-red-50">
        <AlertTriangle className="text-red-500 shrink-0" />
        <p className="text-sm font-medium text-red-800 md:text-base">{alert}</p>
      </div>
    )}
    {(detail || image) && <DetailPanel detail={detail || []} image={image} />}
  </div>
);

const Frame = ({ title, description, children, detail }: any) => (
  <div className="flex flex-col h-full overflow-y-auto">
    <div className="mb-3 md:mb-6">
      <h2 className="mb-1 text-2xl font-bold md:mb-2 md:text-3xl text-slate-800">{title}</h2>
      {description && <p className="text-sm md:text-lg text-slate-600">{description}</p>}
    </div>
    <div className={`flex flex-col flex-grow p-3 bg-white border shadow-sm md:p-6 rounded-xl ${detail ? 'min-h-[420px] shrink-0' : 'min-h-[360px] md:min-h-0 md:overflow-hidden'}`}>{children}</div>
    {detail && <DetailPanel detail={detail} />}
  </div>
);

const CholeraChart = () => (
  <ResponsiveContainer width="100%" height="100%">
    <AreaChart data={globalCholeraData} margin={{ top: 20, right: 10, left: 0, bottom: 20 }}>
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
    <BarChart data={pakFloodDiseaseData} layout="vertical" margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} />
      <XAxis type="number" unit="%" />
      <YAxis dataKey="disease" type="category" width={95} tick={{ fontSize: 12 }} />
      <RechartsTooltip />
      <Bar dataKey="prevalence" name="Prevalence (%)" fill="#0369a1" radius={[0, 4, 4, 0]} />
    </BarChart>
  </ResponsiveContainer>
);

const WashChart = () => (
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={washLadderData} layout="vertical" margin={{ top: 10, right: 20, left: 0, bottom: 25 }}>
      <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} />
      <XAxis type="number" label={{ value: 'People (millions)', position: 'bottom', offset: 5 }} />
      <YAxis dataKey="level" type="category" width={140} tick={{ fontSize: 12 }} />
      <RechartsTooltip /><Legend verticalAlign="top" />
      <Bar dataKey="water" name="Lacking safely managed drinking water" fill="#0369a1" radius={[0, 4, 4, 0]} />
      <Bar dataKey="sanitation" name="Lacking safely managed sanitation" fill="#f59e0b" radius={[0, 4, 4, 0]} />
    </BarChart>
  </ResponsiveContainer>
);

const BubbleSlide = ({ title, description, detail }: any) => {
  const [active, setActive] = useState<Domain[]>([...DOMAINS]);
  const toggle = (dm: Domain) => setActive(a => (a.includes(dm) ? a.filter(x => x !== dm) : [...a, dm]));
  return (
    <Frame title={title} description={description} detail={detail}>
      <div className="flex flex-wrap gap-2 mb-3">
        {DOMAINS.map(dm => <Chip key={dm} active={active.includes(dm)} color={DOMAIN_COLOR[dm]} onClick={() => toggle(dm)}>{dm}</Chip>)}
      </div>
      <div className="flex-grow min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 15, bottom: 30, left: 0 }}>
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

const ExplorerSlide = ({ title, description, detail }: any) => {
  const [q, setQ] = useState('');
  const [dom, setDom] = useState<'All' | Domain>('All');
  const rows = useMemo(() => pathogens.filter(x =>
    (dom === 'All' || x.domain === dom) &&
    Object.values(x).join(' ').toLowerCase().includes(q.toLowerCase())), [q, dom]);
  return (
    <Frame title={title} description={description} detail={detail}>
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
        <table className="w-full min-w-[760px] text-sm text-left">
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
      <h2 className="mb-4 text-2xl font-bold md:mb-6 md:text-3xl text-slate-800">Interactive Reference Database</h2>
      <div className="relative mb-6">
        <Search className="absolute text-slate-400 left-3 top-3" size={20} />
        <input type="text" placeholder="Search authors, journals, or topics..." value={q} onChange={e => setQ(e.target.value)}
          className="w-full py-3 pl-10 pr-4 border rounded-lg border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div className="flex-grow overflow-auto bg-white border shadow-sm rounded-xl">
        <table className="w-full min-w-[480px] text-left">
          <thead className="sticky top-0 border-b bg-slate-50">
            <tr>{['Source / Title', 'Type', 'Year'].map(h => <th key={h} className="p-4 font-semibold text-slate-600">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y">
            {list.map(r => (
              <tr key={r.id} className="hover:bg-slate-50">
                <td className="p-3 font-medium md:p-4 text-slate-800">{r.title}</td>
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
  const [menu, setMenu] = useState(false);
  const [tx, setTx] = useState<number | null>(null);
  const next = () => setCur(c => Math.min(c + 1, slides.length - 1));
  const prev = () => setCur(c => Math.max(c - 1, 0));
  const categories = [...new Set(slides.map(s => s.category))];

  const renderSlide = () => {
    const s = slides[cur];
    switch (s.type) {
      case 'title': return <TitleSlide />;
      case 'header': return <SectionHeader {...s} />;
      case 'data': return <DataCardSlide {...s} />;
      case 'chart': return <Frame title={s.title} description={s.description} detail={s.detail}>{s.chart === 'cholera' ? <CholeraChart /> : s.chart === 'wash' ? <WashChart /> : <PakFloodChart />}</Frame>;
      case 'terms': return <TermsSlide {...s} />;
      case 'figure': return <FigureSlide {...s} />;
      case 'bubble': return <BubbleSlide {...s} />;
      case 'explorer': return <ExplorerSlide {...s} />;
      case 'references': return <ReferencesSlide />;
      default: return <div>Slide type not found</div>;
    }
  };

  return (
    <div className="flex h-[100dvh] overflow-hidden font-sans bg-slate-50 text-slate-900">
      {menu && <div className="fixed inset-0 z-20 bg-black/50 md:hidden" onClick={() => setMenu(false)} />}
      <div className={`fixed inset-y-0 left-0 z-30 flex flex-col w-64 shadow-xl transition-transform duration-200 bg-slate-900 text-slate-300 md:static md:translate-x-0 md:flex-shrink-0 ${menu ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center gap-2 text-lg font-bold text-white"><Activity className="text-blue-500" /> EPI-DASH</div>
          <button className="md:hidden" aria-label="Close menu" onClick={() => setMenu(false)}><X size={20} /></button>
        </div>
        <div className="flex-grow py-4 overflow-y-auto">
          {categories.map(cat => (
            <div key={cat} className="mb-4">
              <div className="px-6 mb-2 text-xs font-bold tracking-wider uppercase text-slate-500">{cat}</div>
              {slides.map((s, i) => s.category === cat && (
                <button key={s.id} onClick={() => { setCur(i); setMenu(false); }}
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
        <div className="flex items-center gap-3 p-3 bg-white border-b md:hidden">
          <button aria-label="Open menu" onClick={() => setMenu(true)}><Menu size={24} /></button>
          <span className="font-bold truncate text-slate-800">{slides[cur].title || 'Epidemiology of Waterborne Diseases'}</span>
        </div>
        <div className="flex-grow min-h-0 p-4 overflow-hidden md:p-12"
          onTouchStart={e => setTx(e.touches[0].clientX)}
          onTouchEnd={e => { if (tx !== null) { const dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 80) (dx < 0 ? next : prev)(); } setTx(null); }}>
          <div className="w-full h-full max-w-6xl mx-auto">{renderSlide()}</div>
        </div>
        <div className="flex items-center justify-between flex-shrink-0 p-4 bg-white border-t">
          <button onClick={prev} disabled={cur === 0}
            className="flex items-center gap-1 px-3 md:px-6 py-2 font-medium transition-colors rounded-lg text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed">
            <ChevronLeft size={20} /> Previous
          </button>
          <span className="text-sm md:hidden text-slate-500">{cur + 1} / {slides.length}</span>
          <div className="hidden gap-1 md:flex">
            {slides.map((_, i) => <div key={i} className={`h-1.5 rounded-full transition-all ${i === cur ? 'w-6 bg-blue-600' : 'w-2 bg-slate-200'}`} />)}
          </div>
          <button onClick={next} disabled={cur === slides.length - 1}
            className="flex items-center gap-1 px-3 md:px-6 py-2 font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
            Next <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
