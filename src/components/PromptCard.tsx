import { Prompt } from '@/types';
import { Copy, Clock, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PromptDialog } from './PromptDialog';
import { useState } from 'react';

interface PromptCardProps {
  prompt: Prompt;
}

const academicLevelVariant = {
  '1º-2º ano': 'basic',
  '3º-4º ano': 'intermediate',
  'Internato': 'advanced',
  'Todos os níveis': 'universal',
} as const;

export function PromptCard({ prompt }: PromptCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {prompt.title}
          </h3>
          <Badge variant={academicLevelVariant[prompt.academicLevel]}>
            {prompt.academicLevel}
          </Badge>
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {prompt.description}
        </p>

        {/* Metadados educacionais */}
        <div className="flex flex-wrap gap-3 mb-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{prompt.estimatedTime} min</span>
          </div>
          
          {prompt.prerequisites && prompt.prerequisites.length > 0 && (
            <div className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              <span>{prompt.prerequisites.length} pré-requisito(s)</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {prompt.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>

        <button
          onClick={() => setIsDialogOpen(true)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <Copy className="w-4 h-4" />
          Copiar
        </button>
      </div>

      <PromptDialog
        prompt={prompt}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </>
  );
}
