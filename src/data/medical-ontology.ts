/**
 * Ontologia Médica para Parser Semântico
 * Base de conhecimento com vocabulário médico, sinônimos e relações
 */

import type { OntologyEntry, MedicalOntology } from '@/types/contextual';

/**
 * Cria uma entrada de ontologia
 */
function entry(canonical: string, synonyms: string[], related: string[] = [], parent?: string): OntologyEntry {
  return { canonical, synonyms, related, parent };
}

/**
 * Especialidades médicas com sinônimos e termos relacionados
 */
export const SPECIALTIES = new Map<string, OntologyEntry>([
  ['cardiologia', entry('cardiologia', [
    'cardio', 'cardiaco', 'coracao', 'coração', 'cardiovascular'
  ], ['arritmia', 'ecg', 'eletrocardiograma', 'infarto', 'insuficiencia cardiaca', 'hipertensao'])],

  ['neurologia', entry('neurologia', [
    'neuro', 'neurologico', 'neurológico', 'cerebro', 'cérebro', 'nervoso', 'snc'
  ], ['avc', 'cefaleia', 'epilepsia', 'parkinson', 'alzheimer', 'esclerose'])],

  ['pediatria', entry('pediatria', [
    'pedia', 'pediatrico', 'pediátrico', 'crianca', 'criança', 'infantil', 'neonatal', 'recem-nascido'
  ], ['puericultura', 'vacinacao', 'desenvolvimento', 'crescimento'])],

  ['ginecologia', entry('ginecologia', [
    'gineco', 'ginecologico', 'ginecológico', 'obstetricia', 'obstetrícia', 'go'
  ], ['gestacao', 'gravidez', 'parto', 'pre-natal', 'mama', 'utero'])],

  ['ortopedia', entry('ortopedia', [
    'orto', 'ortopedico', 'ortopédico', 'musculoesqueletico', 'ossos', 'articulacoes'
  ], ['fratura', 'luxacao', 'artrose', 'coluna', 'joelho', 'ombro'])],

  ['emergencia', entry('emergencia', [
    'urgencia', 'urgência', 'emergência', 'ps', 'pronto-socorro', 'upa', 'emergencial'
  ], ['trauma', 'reanimacao', 'pcr', 'choque', 'intoxicacao'])],

  ['clinica-medica', entry('clinica-medica', [
    'clinica', 'clínica', 'clinica medica', 'clínica médica', 'medicina interna', 'internista'
  ], ['diagnostico', 'propedeutica', 'semiologia', 'anamnese'])],

  ['cirurgia', entry('cirurgia', [
    'cirurgico', 'cirúrgico', 'cirurgia geral', 'operatorio', 'operatório'
  ], ['laparoscopia', 'laparotomia', 'pos-operatorio', 'pre-operatorio'])],

  ['dermatologia', entry('dermatologia', [
    'dermato', 'dermatologico', 'dermatológico', 'pele', 'cutaneo', 'cutâneo'
  ], ['acne', 'psoríase', 'dermatite', 'melanoma', 'lesao de pele'])],

  ['psiquiatria', entry('psiquiatria', [
    'psiq', 'psiquiatrico', 'psiquiátrico', 'mental', 'saude mental'
  ], ['depressao', 'ansiedade', 'esquizofrenia', 'bipolar', 'toc'])],

  ['endocrinologia', entry('endocrinologia', [
    'endocrino', 'endócrino', 'endocrinologico', 'hormonal', 'hormonios'
  ], ['diabetes', 'tireoide', 'obesidade', 'hipofise', 'adrenal'])],

  ['gastroenterologia', entry('gastroenterologia', [
    'gastro', 'gastrointestinal', 'gi', 'digestivo', 'tgi'
  ], ['hepatologia', 'figado', 'estomago', 'intestino', 'colite', 'crohn'])],

  ['nefrologia', entry('nefrologia', [
    'nefro', 'renal', 'rim', 'rins', 'nefrologico'
  ], ['dialise', 'insuficiencia renal', 'glomerulonefrite', 'transplante renal'])],

  ['pneumologia', entry('pneumologia', [
    'pneumo', 'pulmonar', 'pulmao', 'pulmão', 'respiratorio', 'respiratório'
  ], ['asma', 'dpoc', 'pneumonia', 'tuberculose', 'fibrose'])],

  ['reumatologia', entry('reumatologia', [
    'reumato', 'reumatologico', 'reumatológico', 'autoimune'
  ], ['artrite', 'lupus', 'fibromialgia', 'espondilite', 'gota'])],

  ['infectologia', entry('infectologia', [
    'infecto', 'infeccioso', 'infecciosas', 'doencas infecciosas'
  ], ['hiv', 'aids', 'hepatite', 'dengue', 'covid', 'antibiotico'])],

  ['hematologia', entry('hematologia', [
    'hemato', 'hematologico', 'hematológico', 'sangue'
  ], ['anemia', 'leucemia', 'linfoma', 'coagulacao', 'hemofilia'])],

  ['oncologia', entry('oncologia', [
    'onco', 'oncologico', 'oncológico', 'cancer', 'câncer', 'neoplasia', 'tumor'
  ], ['quimioterapia', 'radioterapia', 'metastase', 'estadiamento'])],

  ['geriatria', entry('geriatria', [
    'geri', 'geriatrico', 'geriátrico', 'idoso', 'terceira idade', 'envelhecimento'
  ], ['demencia', 'fragilidade', 'polifarmacia', 'quedas'])],

  ['medicina-intensiva', entry('medicina-intensiva', [
    'uti', 'intensivista', 'terapia intensiva', 'cti', 'intensivo'
  ], ['ventilacao mecanica', 'sedacao', 'sepse', 'choque', 'monitorizacao'])],

  ['oftalmologia', entry('oftalmologia', [
    'oftalmo', 'oftalmologico', 'oftalmológico', 'olho', 'olhos', 'visao', 'visão'
  ], ['catarata', 'glaucoma', 'retinopatia', 'miopia'])],

  ['otorrinolaringologia', entry('otorrinolaringologia', [
    'otorrino', 'orl', 'ouvido', 'nariz', 'garganta'
  ], ['sinusite', 'otite', 'amigdalite', 'rinite', 'surdez'])],

  ['urologia', entry('urologia', [
    'uro', 'urologico', 'urológico', 'urinario', 'urinário'
  ], ['prostata', 'bexiga', 'calculo renal', 'incontinencia'])],
]);

/**
 * Tópicos médicos comuns com sinônimos
 */
export const TOPICS = new Map<string, OntologyEntry>([
  // Cardiologia
  ['insuficiencia cardiaca', entry('insuficiência cardíaca', [
    'ic', 'icc', 'insuficiencia cardiaca congestiva', 'falencia cardiaca', 'heart failure'
  ], ['dispneia', 'edema', 'congestao'])],

  ['infarto', entry('infarto agudo do miocárdio', [
    'iam', 'infarto do miocardio', 'ataque cardiaco', 'sca', 'sindrome coronariana'
  ], ['troponina', 'cate', 'angioplastia'])],

  ['arritmia', entry('arritmia cardíaca', [
    'arritmias', 'fibrilacao atrial', 'fa', 'flutter', 'taquicardia', 'bradicardia'
  ], ['ecg', 'marcapasso', 'cardioversao'])],

  ['hipertensao', entry('hipertensão arterial', [
    'has', 'pressao alta', 'hipertensivo', 'hipertensao arterial sistemica'
  ], ['anti-hipertensivo', 'pa', 'mapa'])],

  // Endocrinologia
  ['diabetes', entry('diabetes mellitus', [
    'dm', 'dm1', 'dm2', 'diabete', 'diabetico', 'hiperglicemia'
  ], ['insulina', 'metformina', 'hemoglobina glicada', 'glicemia'])],

  ['tireoide', entry('doenças da tireoide', [
    'tireoide', 'tireóide', 'hipotireoidismo', 'hipertireoidismo', 'hashimoto', 'graves'
  ], ['tsh', 't4', 'bócio', 'nodulo'])],

  // Neurologia
  ['avc', entry('acidente vascular cerebral', [
    'avc', 'derrame', 'avc isquemico', 'avc hemorragico', 'stroke'
  ], ['trombolise', 'trombectomia', 'nihss'])],

  ['cefaleia', entry('cefaleia', [
    'dor de cabeca', 'enxaqueca', 'migrânea', 'cefaleia tensional'
  ], ['aura', 'triptano', 'profilaxia'])],

  // Pneumologia
  ['asma', entry('asma brônquica', [
    'asma', 'broncoespasmo', 'crise asmatica'
  ], ['broncodilatador', 'corticoide inalatorio', 'peak flow'])],

  ['dpoc', entry('doença pulmonar obstrutiva crônica', [
    'dpoc', 'enfisema', 'bronquite cronica'
  ], ['espirometria', 'oxigenoterapia', 'vef1'])],

  ['pneumonia', entry('pneumonia', [
    'pnm', 'pneumonia comunitaria', 'pac', 'pneumonia hospitalar'
  ], ['rx torax', 'antibiotico', 'curb-65'])],

  // Gastroenterologia
  ['hepatite', entry('hepatites virais', [
    'hepatite', 'hepatite b', 'hepatite c', 'hbv', 'hcv'
  ], ['cirrose', 'transaminases', 'carga viral'])],

  // Infectologia
  ['hiv', entry('HIV/AIDS', [
    'hiv', 'aids', 'sida', 'virus da imunodeficiencia'
  ], ['tarv', 'cd4', 'carga viral', 'antirretroviral'])],

  // Genéricos
  ['semiologia', entry('semiologia médica', [
    'semiologia', 'propedeutica', 'exame fisico', 'anamnese'
  ], ['inspecao', 'palpacao', 'percussao', 'ausculta'])],

  ['farmacologia', entry('farmacologia', [
    'farmaco', 'farmacos', 'medicamento', 'medicamentos', 'drogas'
  ], ['farmacocinetica', 'farmacodinamica', 'posologia', 'interacao'])],
]);

/**
 * Formatos de output desejados
 */
export const FORMATS = new Map<string, OntologyEntry>([
  ['flashcards', entry('flashcards', [
    'flashcard', 'cards', 'cartoes', 'cartões', 'anki', 'revisao espacada', 'spaced repetition'
  ], ['memorizacao', 'recall'])],

  ['resumo', entry('resumo', [
    'resumir', 'sintese', 'síntese', 'sumario', 'sumário', 'esquema', 'overview'
  ], ['pontos-chave', 'highlights'])],

  ['questoes', entry('questões', [
    'questao', 'questão', 'questões', 'perguntas', 'exercicios', 'exercícios', 'simulado', 'prova', 'quiz'
  ], ['gabarito', 'alternativas'])],

  ['caso-clinico', entry('caso clínico', [
    'caso', 'caso clinico', 'caso clínico', 'vinheta', 'simulacao', 'simulação', 'cenario clinico'
  ], ['diagnostico diferencial', 'condutas'])],

  ['mapa-mental', entry('mapa mental', [
    'mapa', 'mapa mental', 'mind map', 'diagrama', 'esquema visual'
  ], ['ramificacoes', 'conexoes'])],

  ['mnemonico', entry('mnemônico', [
    'mnemonico', 'mnemônico', 'mnemonicos', 'memoria', 'memória', 'decorar', 'memorizar'
  ], ['acronimo', 'associacao'])],

  ['revisao', entry('revisão', [
    'revisar', 'revisao', 'revisão', 'reforco', 'reforço', 'repassar'
  ], ['consolidar', 'fixar'])],

  ['explicacao', entry('explicação', [
    'explicar', 'explicacao', 'explicação', 'entender', 'compreender', 'ensinar'
  ], ['didatico', 'passo a passo'])],

  ['checklist', entry('checklist', [
    'checklist', 'lista', 'verificacao', 'verificação', 'protocolo'
  ], ['itens', 'etapas'])],

  ['analise', entry('análise', [
    'analisar', 'analise', 'análise', 'avaliar', 'avaliacao', 'avaliação', 'interpretar'
  ], ['critica', 'revisao sistematica'])],
]);

/**
 * Níveis acadêmicos
 */
export const LEVELS = new Map<string, OntologyEntry>([
  ['basico', entry('básico', [
    'basico', 'básico', 'iniciante', '1 ano', '2 ano', '1o ano', '2o ano', 'primeiro ano', 'segundo ano',
    'introducao', 'introdução', 'fundamentos', 'base'
  ], ['ciclo basico'])],

  ['intermediario', entry('intermediário', [
    'intermediario', 'intermediário', '3 ano', '4 ano', '3o ano', '4o ano', 'terceiro ano', 'quarto ano',
    'internato', 'ciclo clinico'
  ], ['pratica clinica'])],

  ['avancado', entry('avançado', [
    'avancado', 'avançado', '5 ano', '6 ano', '5o ano', '6o ano', 'quinto ano', 'sexto ano',
    'ultimo ano', 'formando'
  ], ['internato', 'tcc'])],

  ['residencia', entry('residência', [
    'residencia', 'residência', 'residente', 'r1', 'r2', 'r3', 'pos graduacao', 'pós-graduação',
    'especializacao', 'especialização', 'fellow'
  ], ['prova de residencia', 'titulo'])],
]);

/**
 * Contextos clínicos
 */
export const CONTEXTS = new Map<string, OntologyEntry>([
  ['ambulatorio', entry('ambulatório', [
    'ambulatorio', 'ambulatório', 'consulta', 'consultorio', 'consultório', 'ubs', 'aps'
  ], ['agendamento', 'retorno'])],

  ['enfermaria', entry('enfermaria', [
    'enfermaria', 'internacao', 'internação', 'leito', 'ala'
  ], ['visita', 'evolucao', 'alta'])],

  ['emergencia', entry('emergência', [
    'emergencia', 'emergência', 'urgencia', 'urgência', 'ps', 'pronto socorro', 'upa', 'pa'
  ], ['triagem', 'classificacao de risco', 'estabilizacao'])],

  ['uti', entry('UTI', [
    'uti', 'terapia intensiva', 'cti', 'intensivo', 'critico', 'crítico'
  ], ['monitorizacao', 'ventilacao', 'sedacao'])],

  ['centro-cirurgico', entry('centro cirúrgico', [
    'cc', 'centro cirurgico', 'centro cirúrgico', 'sala de cirurgia', 'bloco cirurgico'
  ], ['anestesia', 'procedimento', 'operacao'])],
]);

/**
 * Tipos de exame/prova
 */
export const EXAM_TYPES = new Map<string, OntologyEntry>([
  ['prova-faculdade', entry('prova da faculdade', [
    'prova', 'teste', 'avaliacao', 'avaliação', 'exame', 'p1', 'p2', 'final', 'parcial'
  ], ['nota', 'aprovacao'])],

  ['residencia', entry('prova de residência', [
    'residencia', 'residência', 'enare', 'sus', 'usp', 'unifesp', 'unicamp'
  ], ['pontuacao', 'classificacao'])],

  ['titulo-especialista', entry('título de especialista', [
    'titulo', 'título', 'especialista', 'teot', 'tego', 'prova de titulo'
  ], ['sociedade', 'certificacao'])],

  ['revalida', entry('Revalida', [
    'revalida', 'inep', 'diploma estrangeiro'
  ], ['equivalencia', 'validacao'])],
]);

/**
 * Ontologia médica completa
 */
export const MEDICAL_ONTOLOGY: MedicalOntology = {
  specialties: SPECIALTIES,
  topics: TOPICS,
  formats: FORMATS,
  levels: LEVELS,
  contexts: CONTEXTS,
};

/**
 * Busca termo na ontologia (case-insensitive, com normalização)
 */
export function findInOntology(
  map: Map<string, OntologyEntry>,
  term: string
): { key: string; entry: OntologyEntry } | null {
  const normalized = normalizeText(term);

  // Busca direta pela chave
  for (const [key, entry] of map) {
    if (normalizeText(key) === normalized) {
      return { key, entry };
    }
  }

  // Busca nos sinônimos
  for (const [key, entry] of map) {
    for (const synonym of entry.synonyms) {
      if (normalizeText(synonym) === normalized) {
        return { key, entry };
      }
    }
  }

  // Busca parcial (contém o termo)
  for (const [key, entry] of map) {
    if (normalized.includes(normalizeText(key)) || normalizeText(key).includes(normalized)) {
      return { key, entry };
    }
    for (const synonym of entry.synonyms) {
      if (normalized.includes(normalizeText(synonym)) || normalizeText(synonym).includes(normalized)) {
        return { key, entry };
      }
    }
  }

  return null;
}

/**
 * Busca múltiplos termos na ontologia
 */
export function findMultipleInOntology(
  map: Map<string, OntologyEntry>,
  text: string
): Array<{ key: string; entry: OntologyEntry; match: string }> {
  const results: Array<{ key: string; entry: OntologyEntry; match: string }> = [];
  const normalized = normalizeText(text);

  for (const [key, entry] of map) {
    // Checa a chave
    if (normalized.includes(normalizeText(key))) {
      results.push({ key, entry, match: key });
      continue;
    }

    // Checa sinônimos
    for (const synonym of entry.synonyms) {
      if (normalized.includes(normalizeText(synonym))) {
        results.push({ key, entry, match: synonym });
        break;
      }
    }
  }

  return results;
}

/**
 * Normaliza texto para comparação
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^\w\s]/g, ' ') // Remove pontuação
    .replace(/\s+/g, ' ') // Normaliza espaços
    .trim();
}
