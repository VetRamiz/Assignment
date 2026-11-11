import React, { useState, useMemo, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Menu, 
  X, 
  Search, 
  ExternalLink,
  Activity,
  Droplets,
  Thermometer,
  ShieldPlus,
  Globe2,
  Microscope,
  AlertCircle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area
} from 'recharts';

// --- Data Models ---

const globalCholeraData = [
  { year: '2021', cases: 223370, deaths: 3500 },
  { year: '2022', cases: 315200, deaths: 4200 },
  { year: '2023', cases: 382400, deaths: 5100 },
  { year: '2024', cases: 421000, deaths: 6050 },
  { year: '2025', cases: 451499, deaths: 7870 },
];

const pakistanFloodDiseases = [
  { name: 'Malaria', value: 44, fill: '#0284c7' },
  { name: 'Diarrhea', value: 17, fill: '#ea580c' },
  { name: 'Typhoid', value: 10, fill: '#16a34a' },
  { name: 'Dysentery', value: 8, fill: '#dc2626' },
  { name: 'Skin Diseases', value: 8, fill: '#9333ea' },
  { name: 'Cholera', value: 7, fill: '#0d9488' },
  { name: 'Hepatitis A/E', value: 6, fill: '#d97706' },
];

const references = [
  { id: 1, title: 'WHO Cholera Global Surge Update', year: '2025', category: 'Global Burden', link: 'https://www.who.int/emergencies/disease-outbreak-news/item/2025-DON527' },
  { id: 2, title: 'Water Quality Status in Pakistan (PCRWR Report)', year: '2024', category: 'Pakistan Data', link: 'https://pcrwr.gov.pk' },
  { id: 3, title: 'Post-Flood Epidemiological Morbidity in Sindh', year: '2023', category: 'Pakistan Data', link: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC_FLOOD/' },
  { id: 4, title: 'Climate Change and Vibrio Cholerae Proliferation', year: '2024', category: 'Climate', link: 'https://www.nature.com/articles/s41558-024' },
  { id: 5, title: 'Typhoid Conjugate Vaccine Efficacy in Endemic Regions', year: '2023', category: 'Prevention', link: 'https://www.nejm.org' },
  { id: 6, title: 'Wastewater Surveillance for Enteric Pathogens', year: '2025', category: 'Surveillance', link: 'https://www.thelancet.com/microbe' },
  { id: 7, title: 'Impact of 2022 Floods on Vector and Waterborne Diseases', year: '2023', category: 'Pakistan Data', link: 'https://www.who.int/pakistan' },
];

// --- Reusable Slide Components ---

const TitleSlide = ({ title, subtitle, icon: Icon }) => (
  <div className="flex flex-col items-center justify-center h-full text-center p-8 animate-fade-in">
    <div className="bg-blue-100 p-6 rounded-full mb-8">
      {Icon && <Icon size={80} className="text-blue-700" />}
    </div>
    <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 tracking-tight">{title}</h1>
    <p className="text-2xl text-slate-600 max-w-3xl">{subtitle}</p>
    <div className="mt-12 w-24 h-2 bg-blue-600 rounded-full"></div>
  </div>
);

const ContentSlide = ({ title, content, points = [], alert }) => (
  <div className="flex flex-col h-full p-8 md:p-12 animate-fade-in overflow-y-auto">
    <h2 className="text-4xl font-bold text-slate-900 mb-8 border-b-2 border-slate-200 pb-4">{title}</h2>
    {alert && (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 flex items-start gap-4 rounded-r-lg">
        <AlertCircle className="text-red-500 mt-1 shrink-0" />
        <p className="text-red-900 text-lg font-medium">{alert}</p>
      </div>
    )}
    <div className="text-xl text-slate-700 leading-relaxed mb-8 whitespace-pre-line">
      {content}
    </div>
    {points.length > 0 && (
      <ul className="space-y-4">
        {points.map((point, idx) => (
          <li key={idx} className="flex items-start gap-4">
            <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center shrink-0 mt-1 shadow-md">
              {idx + 1}
            </div>
            <p className="text-xl text-slate-700 leading-relaxed">{point}</p>
          </li>
        ))}
      </ul>
    )}
  </div>
);

const ChartSlide = ({ title, description, children }) => (
  <div className="flex flex-col h-full p-8 md:p-12 animate-fade-in">
    <h2 className="text-4xl font-bold text-slate-900 mb-4">{title}</h2>
    <p className="text-xl text-slate-600 mb-8">{description}</p>
    <div className="flex-grow bg-white rounded-xl shadow-inner border border-slate-200 p-6 min-h-[400px]">
      {children}
    </div>
  </div>
);

const StatGridSlide = ({ title, stats }) => (
  <div className="flex flex-col h-full p-8 md:p-12 animate-fade-in overflow-y-auto">
    <h2 className="text-4xl font-bold text-slate-900 mb-12 border-b-2 border-slate-200 pb-4">{title}</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {stats.map((stat, idx) => (
        <div key={idx} className={`p-8 rounded-2xl border-l-8 shadow-sm ${stat.colorClass || 'border-blue-600 bg-blue-50'}`}>
          <p className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">{stat.label}</p>
          <p className="text-5xl font-bold text-slate-900 mb-4">{stat.value}</p>
          <p className="text-lg text-slate-700">{stat.description}</p>
        </div>
      ))}
    </div>
  </div>
);

const ReferenceSlide = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredRefs = useMemo(() => {
    return references.filter(ref => 
      ref.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ref.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  return (
    <div className="flex flex-col h-full p-8 md:p-12 animate-fade-in overflow-y-auto">
      <h2 className="text-4xl font-bold text-slate-900 mb-6">Interactive References & Bibliography</h2>
      <div className="relative mb-8">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-6 w-6 text-slate-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-12 pr-3 py-4 border border-slate-300 rounded-xl leading-5 bg-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 sm:text-lg transition-all"
          placeholder="Search by title, author, or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="space-y-4">
        {filteredRefs.map(ref => (
          <a key={ref.id} href={ref.link} target="_blank" rel="noopener noreferrer" className="block group">
            <div className="bg-white border border-slate-200 rounded-xl p-6 transition-all hover:shadow-md hover:border-blue-300 flex items-center justify-between">
              <div>
                <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 text-sm font-medium rounded-full mb-3">
                  {ref.category}
                </span>
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                  {ref.title}
                </h3>
                <p className="text-slate-500 mt-2">Published: {ref.year}</p>
              </div>
              <ExternalLink className="text-slate-400 group-hover:text-blue-600 transition-colors" />
            </div>
          </a>
        ))}
        {filteredRefs.length === 0 && (
          <div className="text-center py-12 text-slate-500 text-lg">
            No references found matching your search.
          </div>
        )}
      </div>
    </div>
  );
};

// --- Presentation Data Configuration ---

const slides = [
  // SECTION 1: Introduction & Overview (1-4)
  {
    id: 1, title: 'Title Slide', category: 'Overview',
    content: <TitleSlide title="Epidemiology of Waterborne Diseases" subtitle="Faiz Fareed, Ali Usama, Rameez Sarwar, Uswa Maryam, Aqsa Naz" icon={Globe2} />
  },
  {
    id: 2, title: 'Executive Summary', category: 'Overview',
    content: <ContentSlide title="Executive Summary" content="Waterborne diseases remain a leading cause of global morbidity and mortality, heavily impacted by inadequate WASH (Water, Sanitation, and Hygiene) infrastructure, climate change, and conflicts. This dashboard broadens the scope beyond cholera to analyze the syndemic nature of these infections, with a specific focus on the severe epidemiological shifts in Pakistan post-2022 floods." points={[
      "Inclusion of Cholera, Typhoid, Hepatitis A/E, Dysentery, Giardiasis, and Malaria.",
      "Analysis of climate-driven contagion and flood impacts.",
      "Review of PCRWR data and surveillance frontiers."
    ]} />
  },
  {
    id: 3, title: 'Classification of Diseases', category: 'Overview',
    content: <ContentSlide title="Classification of Water-Associated Diseases" content="To understand the epidemiology, we must categorize how pathogens interact with water systems:" points={[
      "Waterborne: Ingested via contaminated water (Cholera, Typhoid, Cryptosporidium).",
      "Water-washed: Caused by lack of water for hygiene (Trachoma, Skin infections).",
      "Water-based: Pathogens spending part of their life cycle in aquatic hosts (Schistosomiasis).",
      "Water-related Insect Vector: Bred in water (Malaria, Dengue)."
    ]} />
  },
  {
    id: 4, title: 'The Global Burden', category: 'Overview',
    content: <StatGridSlide title="The Global Burden of Waterborne Pathogens" stats={[
      { label: "Annual Cases Estimates", value: "1.5B+", description: "Episodes of diarrhea globally per year.", colorClass: "border-blue-600 bg-blue-50" },
      { label: "Annual Mortality", value: "~1.2M", description: "Deaths primarily among children under 5.", colorClass: "border-red-600 bg-red-50" },
      { label: "Economic Impact", value: "$260B", description: "Global economic loss annually due to inadequate WASH.", colorClass: "border-emerald-600 bg-emerald-50" },
      { label: "Vulnerable Populations", value: "2.2B", description: "People globally lacking safely managed drinking water.", colorClass: "border-orange-600 bg-orange-50" }
    ]} />
  },

  // SECTION 2: Data Visualizations (5-6)
  {
    id: 5, title: 'Global Cholera Trends', category: 'Data & Analytics',
    content: <ChartSlide title="Global Cholera Surge (2021-2025)" description="Following years of decline, cholera cases and mortality have surged due to compounding crises of climate and conflict.">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={globalCholeraData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="colorDeaths" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="year" tick={{fill: '#64748b'}} tickLine={false} />
          <YAxis yAxisId="left" tick={{fill: '#64748b'}} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
          <Legend />
          <Area yAxisId="left" type="monotone" dataKey="deaths" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorDeaths)" name="Global Deaths" />
        </AreaChart>
      </ResponsiveContainer>
    </ChartSlide>
  },

  // SECTION 3: Pathogen Profiles (7-13)
  {
    id: 6, title: 'Pathogen: Cholera', category: 'Pathogens',
    content: <ContentSlide title="Vibrio cholerae (Cholera)" content="An acute diarrheal infection caused by ingestion of food or water contaminated with the bacterium Vibrio cholerae." points={[
      "Transmission: Fecal-oral route, highly associated with contaminated municipal supplies.",
      "Incubation: 2 hours to 5 days (extremely rapid).",
      "Pathophysiology: Cholera toxin causes massive fluid hypersecretion in the small intestine.",
      "Severity: Can kill within hours if untreated due to severe dehydration and electrolyte imbalance. CFR targeting <1%, but currently >2% in many outbreaks."
    ]} />
  },
  {
    id: 7, title: 'Pathogen: Typhoid Fever', category: 'Pathogens',
    content: <ContentSlide title="Salmonella enterica serotype Typhi" content="A systemic infection causing prolonged fever, fatigue, and gastrointestinal symptoms." points={[
      "Transmission: Contaminated water and food; distinct from non-typhoidal salmonella.",
      "Burden: Estimated 9-11 million cases annually worldwide.",
      "Clinical Challenge: Asymptomatic carriers (like 'Typhoid Mary') can shed bacteria for years.",
      "Emerging Threat: Rise of Extensively Drug-Resistant (XDR) strains, heavily concentrated in South Asia."
    ]} alert="XDR Typhoid strains are resistant to almost all standard antibiotics, making water infrastructure the primary defense." />
  },
  {
    id: 8, title: 'Pathogen: Hepatitis A & E', category: 'Pathogens',
    content: <ContentSlide title="Viral Hepatitis (A & E)" content="Hepatotropic viruses primarily transmitted through contaminated water supplies, leading to acute liver inflammation." points={[
      "Hepatitis A: Endemic in many developing nations; most infections occur in early childhood.",
      "Hepatitis E: Often causes massive waterborne epidemics; particularly dangerous for pregnant women (CFR can reach 20% in the third trimester).",
      "Symptoms: Jaundice, fatigue, dark urine, and acute liver failure in severe cases."
    ]} />
  },
  {
    id: 9, title: 'Pathogen: Gastroenteritis', category: 'Pathogens',
    content: <ContentSlide title="Viral & Bacterial Gastroenteritis" content="A broad category of infections causing inflammation of the stomach and intestines." points={[
      "Rotavirus: Historically the leading cause of severe pediatric diarrhea; largely mitigated now in regions with active vaccination programs.",
      "Norovirus: Highly contagious, survives well in aquatic environments, requires very low infectious dose.",
      "E. coli (ETEC, EHEC): Major bacterial drivers of pediatric and traveler's diarrhea."
    ]} />
  },
  {
    id: 10, title: 'Pathogen: Dysentery', category: 'Pathogens',
    content: <ContentSlide title="Dysentery (Shigellosis & Amoebiasis)" content="Characterized by bloody diarrhea, fever, and abdominal cramps." points={[
      "Bacillary Dysentery (Shigella): Highly contagious, requires as few as 10-100 organisms to cause disease. Major cause of mortality in crisis settings.",
      "Amoebic Dysentery (Entamoeba histolytica): Protozoan parasite that can form cysts surviving for months in water and soil. Can lead to liver abscesses."
    ]} />
  },
  {
    id: 11, title: 'Pathogen: Giardia & Crypto', category: 'Pathogens',
    content: <ContentSlide title="Protozoan Pathogens" content="Microscopic parasites capable of forming environmentally resilient cysts/oocysts." points={[
      "Giardiasis (Giardia lamblia): Causes prolonged, malabsorptive diarrhea. Cysts are resistant to standard chlorine levels.",
      "Cryptosporidiosis (Cryptosporidium parvum): Major cause of waterborne outbreaks even in developed nations due to extreme chlorine resistance. Devastating for immunocompromised individuals."
    ]} />
  },
  {
    id: 12, title: 'Pathogen: Malaria', category: 'Pathogens',
    content: <ContentSlide title="Malaria (Water-Related Vector)" content="While technically vector-borne, malaria epidemiology is intrinsically tied to water management and environmental flooding." points={[
      "Vector: Anopheles mosquitoes, which breed in stagnant, shallow water.",
      "Link to Water: Post-flood scenarios create massive breeding grounds, shifting the epidemiology of a region from low to high endemicity within weeks.",
      "Impact: Causes severe febrile illness, anemia, and neurological complications; fatal if untreated."
    ]} />
  },

  // SECTION 4: Drivers & Climate (14-16)
  {
    id: 13, title: 'Drivers: Climate Change', category: 'Drivers & Environment',
    content: <ContentSlide title="Climate Change as a Risk Multiplier" content="Alterations in global temperatures and precipitation patterns directly influence pathogen survival and distribution." points={[
      "Temperature Rise: Warmer waters extend the survival and replication windows of bacteria like Vibrio cholerae and Naegleria fowleri.",
      "Hydrological Extremes: Prolonged droughts concentrate pathogens in shrinking water bodies, while intense rainfall overwhelms sanitation systems."
    ]} />
  },
  {
    id: 14, title: 'Drivers: Floods', category: 'Drivers & Environment',
    content: <ContentSlide title="The Impact of Floods & Inundation" content="Flooding causes catastrophic convergence of human waste, agricultural runoff, and drinking water sources." points={[
      "Infrastructure Collapse: Latrines and sewage plants overflow directly into groundwater aquifers and surface water networks.",
      "Displacement: Forces populations into temporary, crowded camps lacking basic WASH facilities.",
      "Vector Breeding: Receding floodwaters leave stagnant pools, triggering secondary waves of malaria and dengue."
    ]} alert="The post-flood phase represents the highest epidemiological risk window for rapid explosive outbreaks." />
  },
  {
    id: 15, title: 'Drivers: Urbanization', category: 'Drivers & Environment',
    content: <ContentSlide title="Rapid Urbanization & Slum Expansion" content="Unplanned urban growth outpaces the development of safely managed municipal water systems." points={[
      "Premise Plumbing: Aging or unregulated pipe networks suffer from negative pressure events, drawing in contaminated groundwater.",
      "Informal Vending: High reliance on unregulated water trucks or vendors in peri-urban areas.",
      "Biofilm Pathogens: Stagnation in complex plumbing systems allows Legionella and Nontuberculous Mycobacteria (NTM) to thrive."
    ]} />
  },

  // SECTION 5: Pakistan Focus (17-23)
  {
    id: 16, title: 'Pakistan Context', category: 'Pakistan Focus',
    content: <TitleSlide title="Deep Dive: Pakistan" subtitle="Epidemiological shifts, the 2022-2025 flood aftermath, and endemic structural challenges." icon={Thermometer} />
  },
  {
    id: 17, title: 'Pakistan: PCRWR Data', category: 'Pakistan Focus',
    content: <StatGridSlide title="Water Quality in Pakistan" stats={[
      { label: "Safe Drinking Water", value: "47%", description: "Only 47% of the population has access to safe drinking water (PCRWR).", colorClass: "border-red-600 bg-red-50" },
      { label: "Bacterial Contamination", value: "60%+", description: "Water sources across major cities show coliform/E.coli contamination.", colorClass: "border-orange-600 bg-orange-50" },
      { label: "Economic Burden", value: "$1.3B", description: "Annual healthcare cost related to waterborne diseases in Pakistan.", colorClass: "border-blue-600 bg-blue-50" },
      { label: "Child Mortality", value: "53,000", description: "Estimated annual deaths of children under 5 due to diarrhea.", colorClass: "border-purple-600 bg-purple-50" }
    ]} />
  },
  {
    id: 18, title: 'Pakistan: The Flood Catastrophe', category: 'Pakistan Focus',
    content: <ContentSlide title="2022-2025 Flood Aftermath" content="The devastating floods submerged one-third of the country, destroying critical healthcare and WASH infrastructure." points={[
      "Infrastructure Loss: Over 5,000 km of roads and thousands of water systems were destroyed, cutting off access to clean water and medical supplies.",
      "Stagnant Waters: Receding waters took months to clear in Sindh and Balochistan, creating massive pathogen reservoirs.",
      "Health System Overload: Clinics were overwhelmed or destroyed, severely limiting the ability to treat rapid-onset dehydration."
    ]} alert="The floods triggered a multi-disease syndemic, simultaneously spiking cholera, malaria, and typhoid." />
  },
  {
    id: 19, title: 'Pakistan: Disease Prevalence', category: 'Pakistan Focus',
    content: <ChartSlide title="Post-Flood Disease Prevalence (Sindh/Balochistan)" description="Percentage of reported clinical cases in medical relief camps in the hardest-hit flood regions.">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={pakistanFloodDiseases} layout="vertical" margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
          <XAxis type="number" tick={{fill: '#64748b'}} tickLine={false} axisLine={false} unit="%" />
          <YAxis dataKey="name" type="category" tick={{fill: '#334155', fontWeight: 500}} tickLine={false} axisLine={false} width={120} />
          <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {pakistanFloodDiseases.map((entry, index) => (
              <cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartSlide>
  },
  {
    id: 20, title: 'Pakistan: The Sindh Crisis', category: 'Pakistan Focus',
    content: <ContentSlide title="The Sindh Health Crisis" content="Sindh province bore the brunt of the epidemiological fallout due to unique topographical and infrastructural vulnerabilities." points={[
      "Acute Surge: At the peak of the crisis, health authorities reported upwards of 90,000 cases of diarrhea in a single day across the province.",
      "Malaria Explosion: Stagnant waters led to an unprecedented spike in Plasmodium falciparum and vivax infections, exhausting antimalarial drug supplies.",
      "Malnutrition Synergy: Pre-existing high rates of stunting and malnutrition in rural Sindh exacerbated mortality rates from waterborne pathogens."
    ]} />
  },
  {
    id: 21, title: 'Pakistan: AMR & XDR Typhoid', category: 'Pakistan Focus',
    content: <ContentSlide title="Antimicrobial Resistance (AMR)" content="Pakistan is the epicenter of Extensively Drug-Resistant (XDR) Typhoid." points={[
      "Origin: The XDR strain of S. Typhi emerged in Sindh in 2016 and is resistant to chloramphenicol, ampicillin, trimethoprim-sulfamethoxazole, fluoroquinolones, and third-generation cephalosporins.",
      "Transmission: Primarily spread through municipal sewage contaminating aging drinking water pipelines in urban centers like Karachi and Hyderabad.",
      "Treatment Limit: Leaves azithromycin and carbapenems as the only oral and intravenous options, escalating treatment costs exponentially."
    ]} alert="Without massive WASH improvements, untreatable waterborne superbugs are imminent." />
  },
  {
    id: 22, title: 'Pakistan: Ongoing Vulnerabilities', category: 'Pakistan Focus',
    content: <ContentSlide title="Structural and Systemic Gaps" content="Why do outbreaks persist long after waters recede?" points={[
      "Groundwater Depletion & Salinity: Forces populations in coastal and southern regions to rely on unsafe surface water.",
      "Industrial Effluent: Mixing of untreated industrial chemicals with biological pathogens in rivers creates complex toxicological health threats.",
      "Funding Deficits: Despite disaster relief, long-term capital for reconstructing resilient, climate-proof water infrastructure remains severely lacking."
    ]} />
  },

  // SECTION 6: Surveillance & Diagnostics (24-25)
  {
    id: 23, title: 'Surveillance Methods', category: 'Surveillance & Prevention',
    content: <ContentSlide title="Clinical & Genomic Surveillance" content="Modern epidemiology requires moving from reactive counting to proactive prediction." points={[
      "Clinical Reporting Systems: Integrating primary care data into digital dashboards (like DHIS2) for real-time outbreak detection.",
      "Genomic Epidemiology: Using Whole Genome Sequencing (WGS) to trace the exact transmission pathways of pathogens like Cholera and XDR Typhoid across regions.",
      "Rapid Diagnostic Tests (RDTs): Crucial for remote areas, though culture confirmation remains necessary for AMR tracking."
    ]} />
  },
  {
    id: 24, title: 'Wastewater Surveillance', category: 'Surveillance & Prevention',
    content: <ContentSlide title="Environmental & Wastewater Surveillance" content="Monitoring municipal wastewater to detect pathogens before clinical outbreaks occur." points={[
      "Predictive Advantage: Can provide a 1 to 2-week lead time over hospital admission data by detecting asymptomatic shedding.",
      "Polio Legacy: Pakistan already possesses sophisticated environmental surveillance networks built for Polio eradication, which can be adapted for Typhoid, Cholera, and Hepatitis.",
      "Challenge: Less effective in rural areas lacking centralized sewage networks."
    ]} />
  },

  // SECTION 7: Prevention & Control (26-29)
  {
    id: 25, title: 'Prevention: WASH', category: 'Surveillance & Prevention',
    content: <ContentSlide title="WASH Infrastructure: The Only Cure" content="Medical interventions are stopgaps; permanent disease eradication requires structural engineering." points={[
      "Piped Safe Water: Establishing heavily monitored, chlorinated municipal networks.",
      "Sanitation: Eliminating open defecation and ensuring safe containment and treatment of human waste.",
      "Climate Resiliency: Elevating wellheads, reinforcing treatment plants against floods, and decentralizing systems where necessary."
    ]} />
  },
  {
    id: 26, title: 'Prevention: Vaccination', category: 'Surveillance & Prevention',
    content: <ContentSlide title="Immunization Strategies" content="Vaccines buy crucial time while infrastructure is built." points={[
      "Oral Cholera Vaccine (OCV): Global stockpile is currently strained, forcing a shift from a standard two-dose to a one-dose reactive strategy in outbreaks.",
      "Typhoid Conjugate Vaccine (TCV): Pakistan was the first country to introduce TCV into routine immunization to combat the XDR crisis.",
      "Rotavirus Vaccine: Integrated into EPI programs globally, dramatically reducing pediatric diarrheal mortality."
    ]} />
  },
  {
    id: 27, title: 'Prevention: Point-of-Use', category: 'Surveillance & Prevention',
    content: <ContentSlide title="Household / Point-of-Use Treatment" content="Immediate interventions for vulnerable, off-grid populations." points={[
      "Boiling: Highly effective but energy/fuel intensive.",
      "Chlorination: Distribution of Aquatabs or liquid sodium hypochlorite.",
      "Filtration: Biosand filters, ceramic filters, or ultrafiltration membranes.",
      "Solar Water Disinfection (SODIS): Using UV and heat to inactivate pathogens in clear plastic bottles."
    ]} />
  },
  {
    id: 28, title: 'Economic Case for Action', category: 'Surveillance & Prevention',
    content: <ContentSlide title="The Economics of Prevention" content="Investing in WASH yields massive socioeconomic returns." points={[
      "ROI: Every $1 invested in basic water and sanitation yields $4 in reduced healthcare costs and increased productivity.",
      "Healthcare Relief: Frees up hospital beds, reduces antibiotic consumption (combating AMR), and prevents pandemic-level systemic shocks.",
      "Societal Impact: Enhances school attendance (especially for girls) and general workforce stamina."
    ]} />
  },
  {
    id: 29, title: 'Future Outlook', category: 'Surveillance & Prevention',
    content: <ContentSlide title="Future Preparedness & Resilience" content="Adapting to a changing world." points={[
      "Syndemic Preparedness: Health systems must prepare to handle simultaneous outbreaks (e.g., Cholera + Malaria + Dengue) post-disaster.",
      "Cross-sectoral Action: Epidemiology must merge with urban planning, meteorology, and civil engineering.",
      "Equity: Targeting investments toward peri-urban slums and remote rural areas that suffer disproportionately during climate events."
    ]} alert="Without aggressive adaptation, waterborne disease mortality will reverse decades of global health progress." />
  },

  // SECTION 8: References (30)
  {
    id: 30, title: 'References', category: 'References',
    content: <ReferenceSlide />
  }
];

// --- Main Application Component ---

export default function App() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) setCurrentSlide(curr => curr + 1);
  };

  const prevSlide = () => {
    if (currentSlide > 0) setCurrentSlide(curr => curr - 1);
  };

  const currentSlideData = slides[currentSlide];

  // Group slides by category for the sidebar
  const categories = slides.reduce((acc, slide, index) => {
    if (!acc[slide.category]) {
      acc[slide.category] = [];
    }
    acc[slide.category].push({ ...slide, originalIndex: index });
    return acc;
  }, {});

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Sidebar Navigation */}
      <aside 
        className={`${isSidebarOpen ? 'w-80 translate-x-0' : 'w-0 -translate-x-full'} 
        transition-all duration-300 ease-in-out bg-white border-r border-slate-200 flex flex-col z-20 shrink-0 shadow-lg md:shadow-none absolute md:relative h-full`}
      >
        <div className="p-6 border-b border-slate-200 flex items-center justify-between shrink-0 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <Activity className="text-blue-400" />
            <h2 className="font-bold text-lg tracking-wide">WDE Dashboard</h2>
          </div>
          <button className="md:hidden text-slate-300 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
          {Object.entries(categories).map(([category, catSlides]) => (
            <div key={category} className="mb-6 px-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 pl-2">
                {category}
              </h3>
              <ul className="space-y-1">
                {catSlides.map((slide) => (
                  <li key={slide.id}>
                    <button
                      onClick={() => {
                        setCurrentSlide(slide.originalIndex);
                        if(window.innerWidth < 768) setIsSidebarOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors
                        ${currentSlide === slide.originalIndex 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                    >
                      {slide.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 shrink-0 justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-md hover:bg-slate-100 text-slate-600 transition-colors"
            >
              <Menu size={24} />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500 font-medium bg-slate-100 px-3 py-1 rounded-full">
              <Microscope size={16} /> Clinical Epidemiology Update
            </div>
          </div>
          <div className="text-sm font-bold text-slate-400">
            Slide {currentSlide + 1} of {slides.length}
          </div>
        </header>

        {/* Slide Content */}
        <div className="flex-1 overflow-hidden relative bg-slate-50/50">
          <div key={currentSlide} className="absolute inset-0 transition-opacity duration-500">
             {currentSlideData.content}
          </div>
        </div>

        {/* Footer Navigation */}
        <footer className="h-20 bg-white border-t border-slate-200 flex items-center justify-between px-6 shrink-0 z-10">
          <button 
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all
              ${currentSlide === 0 
                ? 'text-slate-400 bg-slate-100 cursor-not-allowed' 
                : 'text-blue-700 bg-blue-50 hover:bg-blue-100 active:scale-95'}`}
          >
            <ChevronLeft size={20} /> Previous
          </button>
          
          {/* Progress Bar */}
          <div className="hidden sm:flex flex-1 max-w-md mx-8 items-center gap-4">
            <div className="h-2 flex-1 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 transition-all duration-500 ease-out"
                style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
              />
            </div>
          </div>

          <button 
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all
              ${currentSlide === slides.length - 1 
                ? 'text-slate-400 bg-slate-100 cursor-not-allowed' 
                : 'text-white bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-md shadow-blue-200'}`}
          >
            Next <ChevronRight size={20} />
          </button>
        </footer>
      </main>

      {/* Global Styles for Animations and Scrollbars */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 20px;
        }
      `}} />
    </div>
  );
}