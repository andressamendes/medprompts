/**
 * Adaptador de Prompts para Geração Contextual Inteligente
 * Adapta e preenche prompts baseado no contexto do usuário
 */

import type { Prompt } from '@/types/prompt';
import type {
  AdaptedPrompt,
  PromptAdaptation,
} from '@/types/contextual';

/**
 * Adaptador de prompts que preenche variáveis e injeta contexto
 */
export class PromptAdapter {
  /**
   * Adapta um prompt com os valores inferidos e contexto do usuário
   */
  adapt(
    prompt: Prompt,
    inferredValues: Record<string, string>,
    userInput: string,
    attachedContent?: string
  ): AdaptedPrompt {
    let content = prompt.content;
    const adaptations: PromptAdaptation[] = [];

    // Extrair variáveis do prompt
    const variables = this.extractVariables(content);
    const filled: string[] = [];
    const pending: string[] = [];

    // 1. Preencher variáveis com valores inferidos
    for (const varName of variables) {
      const value = inferredValues[varName];
      if (value) {
        const placeholder = `[${varName}]`;
        content = content.split(placeholder).join(value);
        filled.push(varName);

        adaptations.push({
          type: 'fill',
          target: varName,
          original: placeholder,
          result: value,
          reason: 'Inferido do contexto do usuário',
        });
      } else {
        pending.push(varName);
      }
    }

    // 2. Injetar conteúdo anexado (se houver)
    if (attachedContent && attachedContent.trim()) {
      content = this.injectAttachedContent(content, attachedContent, variables, pending);

      adaptations.push({
        type: 'append',
        target: 'CONTEUDO_ANEXADO',
        result: `[${this.countWords(attachedContent)} palavras]`,
        reason: 'Material anexado pelo usuário',
      });

      // Se tem conteúdo anexado, variáveis de texto/conteúdo são consideradas preenchidas
      const contentVars = pending.filter(v =>
        v.toUpperCase().includes('TEXTO') ||
        v.toUpperCase().includes('ARTIGO') ||
        v.toUpperCase().includes('CONTEUDO')
      );

      for (const cv of contentVars) {
        const idx = pending.indexOf(cv);
        if (idx > -1) {
          pending.splice(idx, 1);
          filled.push(cv);
        }
      }
    }

    // 3. Adicionar contexto do usuário se relevante
    if (userInput && this.shouldAddUserContext(userInput, content, filled)) {
      content = this.prependUserContext(content, userInput);

      adaptations.push({
        type: 'context',
        target: 'CONTEXTO_USUARIO',
        result: userInput.substring(0, 100) + (userInput.length > 100 ? '...' : ''),
        reason: 'Contexto adicional do usuário',
      });
    }

    // 4. Remover variáveis pendentes não críticas (se houver conteúdo anexado)
    if (attachedContent && pending.length > 0) {
      const nonCritical = pending.filter(v => !this.isCriticalVariable(v));
      for (const varName of nonCritical) {
        const placeholder = `[${varName}]`;
        content = content.split(placeholder).join('');

        adaptations.push({
          type: 'remove',
          target: varName,
          original: placeholder,
          result: '',
          reason: 'Variável opcional removida (conteúdo anexado substitui)',
        });

        const idx = pending.indexOf(varName);
        if (idx > -1) {
          pending.splice(idx, 1);
        }
      }

      // Limpar linhas vazias resultantes
      content = this.cleanEmptyLines(content);
    }

    return {
      original: prompt,
      adapted: content,
      filledVariables: filled,
      pendingVariables: pending,
      adaptations,
      ready: pending.length === 0,
    };
  }

  /**
   * Extrai variáveis do conteúdo
   */
  private extractVariables(content: string): string[] {
    const regex = /\[([A-Za-zÀ-ÖØ-öø-ÿ0-9_\-\s]+)\]/g;
    const variables: string[] = [];
    let match;

    while ((match = regex.exec(content)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1]);
      }
    }

    return variables;
  }

  /**
   * Injeta conteúdo anexado no prompt
   */
  private injectAttachedContent(
    content: string,
    attachedContent: string,
    variables: string[],
    pending: string[]
  ): string {
    // Verifica se há variável de texto/artigo para substituir diretamente
    const textVars = ['TEXTO', 'ARTIGO', 'CONTEUDO A MEMORIZAR', 'MATERIAL'];
    let injected = false;

    for (const textVar of textVars) {
      if (variables.includes(textVar) && pending.includes(textVar)) {
        const placeholder = `[${textVar}]`;
        content = content.split(placeholder).join(attachedContent);
        injected = true;
        break;
      }
    }

    // Se não substituiu diretamente, adiciona no final
    if (!injected) {
      const injection = `

---

**MATERIAL ANEXADO PELO USUÁRIO:**

${attachedContent}

---

*Utilize o material acima como base para a tarefa solicitada.*`;

      content = content + injection;
    }

    return content;
  }

  /**
   * Verifica se deve adicionar contexto do usuário
   */
  private shouldAddUserContext(
    userInput: string,
    content: string,
    filledVars: string[]
  ): boolean {
    // Não adicionar se o input já foi usado para preencher variáveis significativas
    if (filledVars.length >= 2) {
      return false;
    }

    // Adicionar se o input tem informações úteis não capturadas
    const minLength = 30;
    if (userInput.length < minLength) {
      return false;
    }

    // Não duplicar se já está no conteúdo
    if (content.includes(userInput.substring(0, 50))) {
      return false;
    }

    return true;
  }

  /**
   * Adiciona contexto do usuário no início do prompt
   */
  private prependUserContext(content: string, userInput: string): string {
    const context = `**CONTEXTO DO USUÁRIO:**
${userInput}

---

`;

    // Inserir após a primeira seção de "PAPEL DA IA" se existir
    const roleMatch = content.match(/(\*\*PAPEL DA IA.*?\*\*[\s\S]*?)(\n\n|\n\*\*)/);
    if (roleMatch) {
      const insertPoint = roleMatch.index! + roleMatch[1].length;
      return content.slice(0, insertPoint) + '\n\n' + context + content.slice(insertPoint);
    }

    // Caso contrário, adiciona no início
    return context + content;
  }

  /**
   * Verifica se uma variável é crítica
   */
  private isCriticalVariable(varName: string): boolean {
    const critical = ['TEMA', 'ESPECIALIDADE', 'QUESTAO', 'RESPOSTA', 'GABARITO'];
    return critical.some(c => varName.toUpperCase().includes(c));
  }

  /**
   * Limpa linhas vazias consecutivas
   */
  private cleanEmptyLines(content: string): string {
    return content
      .split('\n')
      .filter((line, idx, arr) => {
        // Manter linhas com conteúdo
        if (line.trim()) return true;
        // Manter no máximo uma linha vazia consecutiva
        return idx > 0 && arr[idx - 1].trim() !== '';
      })
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  /**
   * Conta palavras em um texto
   */
  private countWords(text: string): number {
    return text.split(/\s+/).filter(Boolean).length;
  }
}

/**
 * Prepara prompt final para execução (remove markdown e limpa)
 */
export function preparePromptForExecution(adaptedContent: string): string {
  let ready = adaptedContent;

  // Remover variáveis não preenchidas restantes
  ready = ready.replace(/\[([A-Za-zÀ-ÖØ-öø-ÿ0-9_\-\s]+)\]/g, '');

  // Remover formatação markdown excessiva
  ready = ready.replace(/\*\*([^*]+)\*\*/g, '$1'); // Remove **bold**
  ready = ready.replace(/^###\s*/gm, ''); // Remove ### headers
  ready = ready.replace(/\n---\n/g, '\n\n'); // Remove separadores ---

  // Limpar linhas vazias consecutivas
  ready = ready.replace(/\n{3,}/g, '\n\n');

  // Remover linhas que ficaram apenas com espaços
  ready = ready
    .split('\n')
    .map(line => line.trim())
    .filter((line, idx, arr) => {
      if (line) return true;
      return idx > 0 && arr[idx - 1] !== '';
    })
    .join('\n');

  return ready.trim();
}

/**
 * Cria instância do adaptador
 */
export function createPromptAdapter(): PromptAdapter {
  return new PromptAdapter();
}
