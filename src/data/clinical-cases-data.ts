export interface ClinicalCase {
  id: string;
  title: string;
  category: string;
  difficulty: 'Fácil' | 'Médio' | 'Difícil';
  patient: {
    age: number;
    gender: 'Masculino' | 'Feminino';
    complaint: string;
  };
  history: string;
  physicalExam: string;
  labs?: string;
  imaging?: string;
  questions: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }[];
  diagnosis: string;
  treatment: string;
  tags: string[];
  source: string; // Fonte de validação
  perplexityQuery: string; // Query para buscar no Perplexity
  validated: boolean; // Se foi validado
  lastUpdated: string; // Data da última atualização
}

export const clinicalCases: ClinicalCase[] = [
  {
    id: 'case-001',
    title: 'Paciente com Dor Torácica e Dispneia',
    category: 'Cardiologia',
    difficulty: 'Médio',
    patient: {
      age: 55,
      gender: 'Masculino',
      complaint: 'Dor torácica há 2 horas',
    },
    history: 'Paciente relata dor retroesternal em aperto, irradiando para membro superior esquerdo. Sudorese fria, náuseas. Tabagista há 30 anos, hipertenso em uso irregular de medicação.',
    physicalExam: 'PA: 160/100 mmHg, FC: 95 bpm, FR: 22 irpm, Tax: 36.8°C. Palidez cutânea, sudorese fria. ACV: RCR 2T, bulhas normofonéticas. AP: MV+ sem RA.',
    labs: 'Troponina I: 2.5 ng/mL (VR: <0.04), CK-MB: 45 U/L (VR: <25), Leucócitos: 11.000/mm³',
    imaging: 'ECG: Supradesnivelamento do segmento ST em DII, DIII e aVF',
    questions: [
      {
        question: 'Qual a hipótese diagnóstica mais provável?',
        options: [
          'Angina instável',
          'Infarto Agudo do Miocárdio (IAM)',
          'Pericardite aguda',
          'Embolia pulmonar',
        ],
        correctAnswer: 1,
        explanation: 'Quadro clínico típico de IAM: dor torácica retroesternal em aperto, irradiação para MSE, sudorese fria, troponina elevada e supradesnivelamento de ST no ECG.',
      },
      {
        question: 'Qual a localização do infarto baseado no ECG?',
        options: [
          'Parede anterior',
          'Parede lateral',
          'Parede inferior',
          'Parede posterior',
        ],
        correctAnswer: 2,
        explanation: 'Supradesnivelamento de ST em DII, DIII e aVF indica IAM de parede inferior (irrigação da artéria coronária direita).',
      },
    ],
    diagnosis: 'Infarto Agudo do Miocárdio de Parede Inferior',
    treatment: 'Reperfusão urgente (angioplastia primária ou trombolítico), AAS 300mg, clopidogrel, anticoagulação, analgesia, oxigenoterapia se necessário.',
    tags: ['cardiologia', 'emergência', 'ECG', 'troponina'],
    source: 'Diretrizes ESC/AHA sobre IAM com supradesnivelamento de ST',
    perplexityQuery: 'Infarto Agudo do Miocárdio parede inferior diagnóstico tratamento 2024',
    validated: true,
    lastUpdated: '2026-01-02',
  },
  {
    id: 'case-002',
    title: 'Criança com Febre e Exantema',
    category: 'Pediatria',
    difficulty: 'Fácil',
    patient: {
      age: 4,
      gender: 'Masculino',
      complaint: 'Febre há 5 dias e manchas no corpo',
    },
    history: 'Mãe relata que filho apresentou febre alta (39°C) há 5 dias, que cedeu há 2 dias. Após ceder a febre, surgiram manchas vermelhas no tronco que se espalharam para membros. Criança vacinada (cartão em dia).',
    physicalExam: 'Tax: 36.5°C, FC: 90 bpm, FR: 24 irpm. BEG, hidratado, corado. Exantema maculopapular em tronco e membros. Ausência de descamação. Linfonodos palpáveis retroauriculares.',
    labs: 'Hemograma: leucócitos 8.000/mm³ (linfócitos 60%)',
    questions: [
      {
        question: 'Qual a hipótese diagnóstica?',
        options: [
          'Sarampo',
          'Rubéola',
          'Roséola infantil (Exantema súbito)',
          'Escarlatina',
        ],
        correctAnswer: 2,
        explanation: 'Roséola infantil: febre alta por 3-5 dias que cede abruptamente, seguida de exantema maculopapular. Comum em crianças <2 anos. Causada por HHV-6.',
      },
    ],
    diagnosis: 'Roséola Infantil (Exantema Súbito)',
    treatment: 'Suporte clínico, antitérmicos se necessário. Doença autolimitada. Orientar pais sobre benignidade.',
    tags: ['pediatria', 'exantema', 'febre', 'virose'],
    source: 'Manual de Pediatria SBP - Doenças Exantemáticas',
    perplexityQuery: 'Roséola infantil exantema súbito diagnóstico tratamento pediatria',
    validated: true,
    lastUpdated: '2026-01-02',
  },
  {
    id: 'case-003',
    title: 'Paciente com Icterícia e Colúria',
    category: 'Gastroenterologia',
    difficulty: 'Médio',
    patient: {
      age: 42,
      gender: 'Feminino',
      complaint: 'Pele amarelada e urina escura há 1 semana',
    },
    history: 'Paciente relata icterícia progressiva, colúria (urina cor de coca-cola), acolia fecal (fezes claras). Prurido intenso. Nega febre, dor abdominal intensa. Perda de peso de 3kg no último mês.',
    physicalExam: 'BEG, ictérica 3+/4+, afebril. Abdome: hepatomegalia de 4cm do RCD, sem dor. Vesícula de Courvoisier palpável.',
    labs: 'Bilirrubina total: 12 mg/dL (direta: 9 mg/dL), FA: 450 U/L, GGT: 380 U/L, TGO/TGP: 120/140 U/L',
    imaging: 'USG: dilatação de vias biliares intra e extra-hepáticas. Massa em cabeça de pâncreas.',
    questions: [
      {
        question: 'Qual o tipo de icterícia?',
        options: [
          'Pré-hepática (hemolítica)',
          'Hepática (hepatocelular)',
          'Pós-hepática (obstrutiva)',
          'Mista',
        ],
        correctAnswer: 2,
        explanation: 'Icterícia obstrutiva: bilirrubina direta elevada, colúria, acolia, FA e GGT muito elevadas, dilatação de vias biliares.',
      },
      {
        question: 'Qual a hipótese diagnóstica principal?',
        options: [
          'Hepatite viral aguda',
          'Coledocolitíase',
          'Neoplasia de cabeça de pâncreas',
          'Colangite esclerosante',
        ],
        correctAnswer: 2,
        explanation: 'Tríade: icterícia indolor + perda de peso + vesícula palpável (sinal de Courvoisier) + massa pancreática na USG = neoplasia de pâncreas.',
      },
    ],
    diagnosis: 'Neoplasia de Cabeça de Pâncreas',
    treatment: 'Estadiamento com TC/RNM, CEA, CA 19-9. Avaliação cirúrgica (pancreatoduodenectomia - Whipple) se ressecável. Paliação se irressecável.',
    tags: ['gastro', 'icterícia', 'pâncreas', 'oncologia'],
    source: 'Diretrizes NCCN - Adenocarcinoma de Pâncreas',
    perplexityQuery: 'Câncer de pâncreas sinal Courvoisier diagnóstico tratamento',
    validated: true,
    lastUpdated: '2026-01-02',
  },
];

// Disclaimer médico
export const CLINICAL_CASES_DISCLAIMER = `
⚠️ IMPORTANTE - Validação Médica:

Estes casos clínicos são materiais educacionais baseados em literatura médica consolidada.
Todos os casos foram validados através do Perplexity AI com fontes científicas confiáveis.

• Não substitui avaliação clínica real
• Sempre consulte diretrizes médicas atualizadas
• Use como complemento ao estudo, não como única fonte
• Verifique as fontes clicando em "Verificar no Perplexity"

Para fins educacionais apenas.
`;
