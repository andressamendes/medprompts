/**
 * Badges de entidades detectadas pelo parser semântico
 */

import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Stethoscope,
  GraduationCap,
  FileText,
  Building2,
  Clock,
  Target,
  Sparkles,
} from 'lucide-react';
import type { ExtractedEntities } from '@/types/contextual';

interface EntityBadgesProps {
  entities: ExtractedEntities;
  className?: string;
}

/**
 * Exibe badges para as entidades detectadas
 */
export function EntityBadges({ entities, className = '' }: EntityBadgesProps) {
  const badges: Array<{
    key: string;
    label: string;
    value: string;
    icon: React.ReactNode;
    color: string;
  }> = [];

  // Tópico médico
  if (entities.medicalTopic) {
    badges.push({
      key: 'topic',
      label: 'Tópico',
      value: entities.medicalTopic,
      icon: <Target className="w-3 h-3" />,
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    });
  }

  // Especialidade
  if (entities.specialty) {
    badges.push({
      key: 'specialty',
      label: 'Especialidade',
      value: formatSpecialty(entities.specialty),
      icon: <Stethoscope className="w-3 h-3" />,
      color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    });
  }

  // Formato de output
  if (entities.outputFormat) {
    badges.push({
      key: 'format',
      label: 'Formato',
      value: formatOutputType(entities.outputFormat),
      icon: <FileText className="w-3 h-3" />,
      color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    });
  }

  // Nível acadêmico
  if (entities.academicLevel) {
    badges.push({
      key: 'level',
      label: 'Nível',
      value: formatLevel(entities.academicLevel),
      icon: <GraduationCap className="w-3 h-3" />,
      color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    });
  }

  // Contexto clínico
  if (entities.clinicalContext) {
    badges.push({
      key: 'context',
      label: 'Contexto',
      value: formatContext(entities.clinicalContext),
      icon: <Building2 className="w-3 h-3" />,
      color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    });
  }

  // Timeframe
  if (entities.timeframe) {
    badges.push({
      key: 'time',
      label: 'Prazo',
      value: entities.timeframe,
      icon: <Clock className="w-3 h-3" />,
      color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    });
  }

  if (badges.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {/* Indicador de confiança */}
      <Tooltip>
        <TooltipTrigger>
          <Badge
            variant="outline"
            className="gap-1 text-xs bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border-indigo-200 dark:border-indigo-800"
          >
            <Sparkles className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
            {Math.round(entities.confidence * 100)}% confiança
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>Confiança na detecção das entidades</p>
        </TooltipContent>
      </Tooltip>

      {/* Badges de entidades */}
      {badges.map(badge => (
        <Tooltip key={badge.key}>
          <TooltipTrigger>
            <Badge className={`gap-1 text-xs ${badge.color}`}>
              {badge.icon}
              {badge.value}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>{badge.label}: {badge.value}</p>
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}

/**
 * Formata especialidade para exibição
 */
function formatSpecialty(specialty: string): string {
  const mapping: Record<string, string> = {
    'cardiologia': 'Cardiologia',
    'neurologia': 'Neurologia',
    'pediatria': 'Pediatria',
    'ginecologia': 'Ginecologia',
    'ortopedia': 'Ortopedia',
    'emergencia': 'Emergência',
    'clinica-medica': 'Clínica Médica',
    'cirurgia': 'Cirurgia',
    'dermatologia': 'Dermatologia',
    'psiquiatria': 'Psiquiatria',
    'endocrinologia': 'Endocrinologia',
    'gastroenterologia': 'Gastro',
    'nefrologia': 'Nefrologia',
    'pneumologia': 'Pneumologia',
    'reumatologia': 'Reumatologia',
    'infectologia': 'Infectologia',
    'hematologia': 'Hematologia',
    'oncologia': 'Oncologia',
    'geriatria': 'Geriatria',
    'medicina-intensiva': 'UTI',
  };
  return mapping[specialty] || specialty;
}

/**
 * Formata tipo de output para exibição
 */
function formatOutputType(format: string): string {
  const mapping: Record<string, string> = {
    'flashcards': 'Flashcards',
    'resumo': 'Resumo',
    'questoes': 'Questões',
    'caso-clinico': 'Caso Clínico',
    'mapa-mental': 'Mapa Mental',
    'mnemonico': 'Mnemônico',
    'revisao': 'Revisão',
    'explicacao': 'Explicação',
    'checklist': 'Checklist',
    'analise': 'Análise',
  };
  return mapping[format] || format;
}

/**
 * Formata nível acadêmico para exibição
 */
function formatLevel(level: string): string {
  const mapping: Record<string, string> = {
    'basico': 'Básico',
    'intermediario': 'Intermediário',
    'avancado': 'Avançado',
    'residencia': 'Residência',
  };
  return mapping[level] || level;
}

/**
 * Formata contexto clínico para exibição
 */
function formatContext(context: string): string {
  const mapping: Record<string, string> = {
    'ambulatorio': 'Ambulatório',
    'enfermaria': 'Enfermaria',
    'emergencia': 'Emergência',
    'uti': 'UTI',
    'centro-cirurgico': 'CC',
    'domiciliar': 'Domiciliar',
    'consultorio': 'Consultório',
  };
  return mapping[context] || context;
}
