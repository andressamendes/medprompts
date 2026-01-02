export interface Mnemonic {
  id: string;
  title: string;
  category: string;
  mnemonic: string;
  meaning: string[];
  context: string;
  tags: string[];
  isFavorite?: boolean;
}

export const mnemonics: Mnemonic[] = [
  {
    id: 'mne-001',
    title: 'Nervos Cranianos',
    category: 'Anatomia',
    mnemonic: 'Onze Opulentos Órgãos Temporais Têm Ajudado Formidavelmente Garantindo Valorosos Artifícios Hipotalâmicos',
    meaning: [
      'I - Olfatório',
      'II - Óptico',
      'III - Oculomotor',
      'IV - Troclear',
      'V - Trigêmeo',
      'VI - Abducente',
      'VII - Facial',
      'VIII - Vestibulococlear',
      'IX - Glossofaríngeo',
      'X - Vago',
      'XI - Acessório',
      'XII - Hipoglosso',
    ],
    context: 'Os 12 pares de nervos cranianos na ordem.',
    tags: ['anatomia', 'neurologia', 'nervos cranianos'],
  },
  {
    id: 'mne-002',
    title: 'Ossos do Carpo',
    category: 'Anatomia',
    mnemonic: 'Sempre Levei Para o Trabalho Três Casacos Pesados Havana',
    meaning: [
      'Proximal: Escafoide, Semilunar, Piramidal, Pisiforme',
      'Distal: Trapézio, Trapezoide, Capitato, Hamato',
    ],
    context: 'Os 8 ossos do carpo (punho), dispostos em duas fileiras.',
    tags: ['anatomia', 'ortopedia', 'mão'],
  },
  {
    id: 'mne-003',
    title: 'Causas de Hipercalcemia',
    category: 'Clínica Médica',
    mnemonic: 'CHIMPANZÉ',
    meaning: [
      'C - Cálcio suplementação excessiva',
      'H - Hiperparatireoidismo',
      'I - Imobilização prolongada',
      'M - Metástases ósseas / Mieloma múltiplo',
      'P - Paratormônio aumentado / Paget',
      'A - Addison (insuficiência adrenal)',
      'N - Neoplasias (PTH-related peptide)',
      'Z - Zollinger-Ellison',
      'É - Excesso de vitamina D',
    ],
    context: 'Principais causas de hipercalcemia.',
    tags: ['clínica', 'endocrinologia', 'cálcio'],
  },
  {
    id: 'mne-004',
    title: 'Critérios de Jones (Febre Reumática)',
    category: 'Pediatria',
    mnemonic: 'CASES',
    meaning: [
      'C - Cardite',
      'A - Artrite migratória',
      'S - Subcutâneos (nódulos)',
      'E - Eritema marginado',
      'S - Sydenham (coreia)',
    ],
    context: 'Critérios maiores para diagnóstico de febre reumática.',
    tags: ['pediatria', 'cardiologia', 'febre reumática'],
  },
  {
    id: 'mne-005',
    title: 'Sinais de Irritação Meníngea',
    category: 'Neurologia',
    mnemonic: 'KB Rígido',
    meaning: [
      'K - Kernig (dor ao estender joelho com coxa fletida)',
      'B - Brudzinski (flexão involuntária de pernas ao fletir pescoço)',
      'Rígido - Rigidez de nuca',
    ],
    context: 'Sinais clínicos de meningite / irritação meníngea.',
    tags: ['neurologia', 'meningite', 'exame físico'],
  },
  {
    id: 'mne-006',
    title: 'Classificação de Forrest (Sangramento Digestivo Alto)',
    category: 'Gastroenterologia',
    mnemonic: 'ATIVA Parou Base Mancha',
    meaning: [
      'Ia - ATIVA em jato',
      'Ib - ATIVA em babação',
      'IIa - Vaso visível (Parou recentemente)',
      'IIb - Coágulo aderido (Base)',
      'IIc - Mancha plana de hematina',
      'III - Sem sangramento',
    ],
    context: 'Classificação endoscópica de úlcera sangrante e risco de ressangramento.',
    tags: ['gastro', 'endoscopia', 'hemorragia digestiva'],
  },
];
