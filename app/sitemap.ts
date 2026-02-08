import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://ecalc.ro'
  const year = 2026

  // 1. SALARII - Toate variațiile de căutare (Net, Brut, Euro, IT, Minim)
  const salaryRanges = [
    ...Array.from({ length: 20 }, (_, i) => (i + 1) * 1000), // 1000, 2000... 20000 lei
    3700, 4050, 4325, 4850, 5500, 10000, 12000 // Praguri critice & minim
  ];

  const salaryPages = [
    ...salaryRanges.map(s => `salariu-brut-${s}-lei`),
    ...salaryRanges.map(s => `salariu-net-${s}-lei`),
    'salariu-minim-pe-economie-2026',
    'salariu-minim-constructii-2026',
    'salariu-minim-agricultura-2026',
    'calcul-salariu-it-peste-10000-lei',
    'salariu-1000-euro-net-in-lei',
    'salariu-2000-euro-net-in-lei',
    'calculator-taxe-pfa-vs-srl-2026',
    'expert-calcul-venit-net-pfa'
  ].map(slug => ({ url: `${baseUrl}/calculator-salarii-pro/${year}/${slug}`, lastModified: new Date() }));

  // 2. METEO - Toate orașele, stațiunile și punctele cheie din RO
  const locations = [
    // Resedințe și orașe (Top 50)
    'bucuresti', 'cluj-napoca', 'timisoara', 'iasi', 'constanta', 'craiova', 'brasov', 'galati', 'ploiesti', 'oradea', 'braila', 'arad', 'pitesti', 'sibiu', 'bacau', 'targu-mures', 'baia-mare', 'buzau', 'botosani', 'satu-mare', 'ramnicu-valcea', 'suceava', 'piatra-neamt', 'targu-jiu', 'targoviste', 'focsani', 'bistrita', 'resita', 'tulcea', 'slatina', 'calarasi', 'giurgiu', 'alba-iulia', 'deva', 'hunedoara', 'zalau', 'sfantu-gheorghe', 'slobozia', 'alexandria', 'voluntari', 'lugoj', 'medias', 'turda', 'roman', 'pascani', 'onesti', 'sighetu-marmatiei', 'mangalia', 'navodari',
    // Litoral (Fiecare plajă)
    'mamaia', 'costinesti', 'vama-veche', 'neptun', 'olimp', 'jupiter', 'venus', 'saturn', 'eforie-nord', 'eforie-sud', '2-mai', 'corbu', 'tuzla',
    // Munte & Schi
    'sinaia', 'predeal', 'busteni', 'azuga', 'poiana-brasov', 'paltinis', 'straja', 'ranca', 'vatra-dornei', 'cavnic', 'balea-lac', 'voineasa', 'durau', 'arieseni', 'semenic', 'cota-2000-sinaia',
    // Balneo
    'baile-felix', 'baile-herculane', 'sovata', 'covasna', 'calimanesti', 'caciulata', 'baile-olanesti', 'slanic-moldova', 'borsec', 'praid', 'baile-tusnad', 'ocna-sibiului',
    // Interes Special
    'aeroport-otopeni', 'aeroport-cluj', 'aeroport-timisoara', 'delta-dunarii', 'transfagarasan'
  ].map(city => ({ url: `${baseUrl}/vreme/${city}`, lastModified: new Date() }));

  // 3. Rutele de bază
  const coreRoutes = [
    '', '/calculator-salarii-pro/2026', '/calculator-pfa/2026', '/decision-maker/2026',
    '/calculator-concediu-medical/2026', '/calculator-impozit-auto/2026', 
    '/calculator-imobiliare-pro/2026', '/calculator-efactura/2026', '/calculator-compensatii-zboruri/2026',
    '/vreme'
  ].map(route => ({ url: `${baseUrl}${route}`, lastModified: new Date() }));

  return [...coreRoutes, ...salaryPages, ...locations];
}
