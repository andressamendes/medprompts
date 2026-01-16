// Exportar prompts como flashcards para Anki (formato CSV)

import type { Prompt } from '@/types/prompt';

export interface AnkiCard {
  front: string;
  back: string;
  tags: string;
}

// Converter prompt em flashcard
export function promptToAnkiCard(prompt: Prompt): AnkiCard {
  // Frente: Título + Descrição
  const front = `${prompt.title}\n\n${prompt.description}`;

  // Verso: Conteúdo do prompt
  const back = prompt.content;

  // Tags: Categoria do prompt
  const tags = prompt.category;

  return {
    front,
    back,
    tags,
  };
}

// Escapar aspas e vírgulas para CSV
function escapeCSV(text: string): string {
  // Se contém vírgula, aspas ou quebra de linha, envolver em aspas
  if (text.includes(',') || text.includes('"') || text.includes('\n')) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

// Converter array de cards para CSV
export function cardsToCSV(cards: AnkiCard[]): string {
  const header = 'Front,Back,Tags';
  const rows = cards.map(card => {
    return [
      escapeCSV(card.front),
      escapeCSV(card.back),
      escapeCSV(card.tags),
    ].join(',');
  });

  return [header, ...rows].join('\n');
}

// Baixar CSV de prompts selecionados
export function exportPromptsToAnki(prompts: Prompt[]): void {
  const cards = prompts.map(promptToAnkiCard);
  const csv = cardsToCSV(cards);
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.href = url;
  link.download = `medprompts-anki-${new Date().toISOString().split('T')[0]}.csv`;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

// Instruções para importar no Anki
export const ANKI_IMPORT_INSTRUCTIONS = `
📚 Como importar no Anki:

1. Abra o Anki
2. Vá em "Arquivo" → "Importar"
3. Selecione o arquivo CSV baixado
4. Configure os campos:
   - Campo 1 → Frente
   - Campo 2 → Verso
   - Campo 3 → Tags
5. Escolha o deck de destino
6. Clique em "Importar"

✨ Pronto! Seus prompts agora são flashcards no Anki.
`;
