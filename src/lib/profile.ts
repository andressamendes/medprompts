// Sistema de Perfil do Estudante

export interface StudentProfile {
  isConfigured: boolean;
  name: string;
  graduationYear: number;
  currentYear: 1 | 2 | 3 | 4 | 5 | 6;
  ongoingDisciplines: string[];
  areaOfInterest: string[];
  createdAt: string;
  updatedAt: string;
}

export const GRADUATION_YEARS = [1, 2, 3, 4, 5, 6] as const;

export const MEDICAL_DISCIPLINES = [
  'Anatomia',
  'Fisiologia',
  'Bioquímica',
  'Histologia',
  'Embriologia',
  'Farmacologia',
  'Patologia',
  'Microbiologia',
  'Imunologia',
  'Parasitologia',
  'Genética',
  'Epidemiologia',
  'Semiologia',
  'Clínica Médica',
  'Cirurgia',
  'Pediatria',
  'Ginecologia e Obstetrícia',
  'Psiquiatria',
  'Medicina de Família',
  'Saúde Pública',
  'Radiologia',
  'Medicina de Emergência',
] as const;

export const AREAS_OF_INTEREST = [
  'Clínica Médica',
  'Cirurgia Geral',
  'Pediatria',
  'Ginecologia e Obstetrícia',
  'Cardiologia',
  'Neurologia',
  'Ortopedia',
  'Dermatologia',
  'Psiquiatria',
  'Radiologia',
  'Anestesiologia',
  'Medicina de Emergência',
  'Medicina de Família',
  'Oncologia',
  'Infectologia',
  'Endocrinologia',
  'Nefrologia',
  'Pneumologia',
  'Gastroenterologia',
  'Reumatologia',
  'Oftalmologia',
  'Otorrinolaringologia',
  'Urologia',
  'Genética Médica',
  'Medicina Intensiva',
  'Ainda não decidi',
] as const;

const STORAGE_KEY = 'medprompts_student_profile';

export function initializeProfile(): StudentProfile {
  return {
    isConfigured: false,
    name: '',
    graduationYear: new Date().getFullYear(),
    currentYear: 1,
    ongoingDisciplines: [],
    areaOfInterest: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function loadProfile(): StudentProfile {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as StudentProfile;
    }
  } catch (error) {
    console.error('Erro ao carregar perfil:', error);
  }
  
  return initializeProfile();
}

export function saveProfile(profile: StudentProfile): void {
  try {
    const updatedProfile = {
      ...profile,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProfile));
    
    // Disparar evento para atualizar componentes
    window.dispatchEvent(new Event('profileUpdated'));
  } catch (error) {
    console.error('Erro ao salvar perfil:', error);
  }
}

export function updateProfile(updates: Partial<StudentProfile>): StudentProfile {
  const current = loadProfile();
  const updated = {
    ...current,
    ...updates,
    isConfigured: true,
    updatedAt: new Date().toISOString(),
  };
  
  saveProfile(updated);
  return updated;
}

export function isProfileComplete(profile: StudentProfile): boolean {
  return (
    profile.isConfigured &&
    profile.name.trim().length > 0 &&
    profile.currentYear > 0 &&
    profile.ongoingDisciplines.length > 0
  );
}

// Filtrar prompts relevantes baseado no perfil
export function getRelevantPromptCategories(profile: StudentProfile): string[] {
  const categories: string[] = ['estudos']; // Todos veem estudos
  
  // Anos iniciais (1-2): foco em ciências básicas
  if (profile.currentYear <= 2) {
    categories.push('pesquisa');
  }
  
  // Anos clínicos (3-6): foco em clínica e produtividade
  if (profile.currentYear >= 3) {
    categories.push('clinica', 'produtividade');
  }
  
  return categories;
}
