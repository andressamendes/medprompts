export type Category = 'clinica' | 'estudos' | 'pesquisa' | 'produtividade';

export type AcademicLevel = '1º-2º ano' | '3º-4º ano' | 'Internato' | 'Todos os níveis';

export interface Prompt {
  id: string;
  title: string;
  description: string;
  category: Category;
  content: string;
  tags: string[];
  recommendedModel?: string;
  tips?: string[];
  // Novos campos pedagógicos
  academicLevel: AcademicLevel;
  estimatedTime: number; // em minutos
  prerequisites?: string[]; // opcional
}
