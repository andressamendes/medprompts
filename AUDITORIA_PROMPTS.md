# Auditoria Completa - Página /prompts
## MedPrompts - https://andressamendes.github.io/medprompts/prompts

**Data:** 2026-01-16
**Versão Analisada:** Commit d5eef9f

---

## 1. PROBLEMAS CRÍTICOS (Prioridade Alta)

### 1.1 Segurança - XSS Potencial
**Arquivo:** `src/pages/Prompts.tsx:688`
```tsx
dangerouslySetInnerHTML={{ __html: renderMarkdown(selectedPrompt.content) }}
```
**Problema:** Uso de `dangerouslySetInnerHTML` sem sanitização adequada.
**Risco:** Se o conteúdo do prompt vier de fonte externa, pode haver injeção de scripts.
**Correção:** Usar DOMPurify para sanitizar o HTML antes de renderizar.

### 1.2 Segurança - XSS no PromptCustomizer
**Arquivo:** `src/components/PromptCustomizer.tsx:541`
```tsx
dangerouslySetInnerHTML={{ __html: highlightedText }}
```
**Problema:** Mesmo problema - HTML não sanitizado.
**Correção:** Sanitizar com DOMPurify.

### 1.3 Performance - Import Dinâmico Desnecessário
**Arquivo:** `src/pages/Prompts.tsx:70`
```tsx
const promptsModule = await import('@/data/prompts-data');
```
**Problema:** Import dinâmico dentro de useEffect causa delay no carregamento.
**Correção:** Importar estaticamente ou usar React.lazy() para code-splitting adequado.

---

## 2. PROBLEMAS FUNCIONAIS (Prioridade Média)

### 2.1 URLs de IAs Desatualizadas/Incorretas
**Arquivo:** `src/pages/Prompts.tsx:150-175`
- ChatGPT: `?q=` não funciona mais (OpenAI removeu)
- Claude: `claude.ai/new` não aceita query params
- Perplexity: URL correta
- Gemini: `?text=` pode não funcionar consistentemente

**Correção:** Remover tentativas de passar prompt via URL, focar em copiar para clipboard.

### 2.2 Categorias Hardcoded
**Arquivo:** `src/pages/Prompts.tsx:383-390`
```tsx
<SelectItem value="estudos">Estudos</SelectItem>
<SelectItem value="clinica">Clínica</SelectItem>
...
```
**Problema:** Categorias são fixas, não refletem os prompts reais.
**Correção:** Extrair categorias dinamicamente dos prompts carregados.

### 2.3 Falta de Feedback Visual ao Abrir IA
**Problema:** Quando clica em "Abrir IA" para prompt com variáveis, abre o customizer sem feedback claro.
**Correção:** Adicionar toast explicando que precisa preencher variáveis primeiro.

### 2.4 Botão "Abrir IA" Duplicado no Card
**Arquivo:** `src/pages/Prompts.tsx:555-570`
**Problema:** Há dois botões azuis similares: "Personalizar" e "Abrir [IA]".
**Correção:** Unificar ações ou diferenciar visualmente.

### 2.5 Estado de "Copiado" Não Persiste Entre Modais
**Problema:** Se copiar no card e abrir modal, estado de copiado é resetado.
**Correção:** Usar ID único para rastrear estado de cópia.

---

## 3. PROBLEMAS DE UX/UI (Prioridade Média)

### 3.1 Modal de Detalhes Muito Extenso
**Problema:** O modal mostra TODO o conteúdo do prompt, que pode ser muito longo.
**Correção:** Limitar altura inicial com "Ver mais" ou usar accordion.

### 3.2 Falta de Indicador de Variáveis no Card
**Problema:** Usuário não sabe se prompt tem variáveis até clicar.
**Correção:** Adicionar badge "[X variáveis]" no card.

### 3.3 Preview do Customizer Muito Pequeno
**Arquivo:** `src/components/PromptCustomizer.tsx:518`
```tsx
<div className="p-4 max-h-[350px] overflow-y-auto">
```
**Problema:** Área de preview limitada a 350px.
**Correção:** Aumentar ou permitir expandir.

### 3.4 Falta de Atalhos de Teclado
**Problema:** Não há atalhos para copiar (Ctrl+C), navegar entre prompts, etc.
**Correção:** Implementar keyboard shortcuts.

### 3.5 Paginação Pouco Intuitiva
**Problema:** Números de página pequenos, difícil clicar em mobile.
**Correção:** Aumentar área de toque, adicionar "Ir para página".

### 3.6 Filtro de Categoria Não Mostra Contagem
**Problema:** Usuário não sabe quantos prompts tem em cada categoria.
**Correção:** Mostrar "(5)" ao lado de cada categoria.

---

## 4. PROBLEMAS DE ACESSIBILIDADE (Prioridade Média)

### 4.1 Falta de aria-live para Toasts
**Problema:** Toasts não são anunciados por leitores de tela.
**Correção:** Adicionar `aria-live="polite"` no container de toasts.

### 4.2 Botões Sem Labels Adequados
**Arquivo:** `src/pages/Prompts.tsx:521-537`
**Problema:** Botões de ícone (copiar, ver) dependem apenas do tooltip.
**Correção:** Adicionar `aria-label` em todos os botões.

### 4.3 Contraste Insuficiente em Badges
**Problema:** Alguns badges têm contraste baixo (especialmente em dark mode).
**Correção:** Verificar ratio WCAG AA (4.5:1 para texto).

### 4.4 Focus Trap no Modal Incompleto
**Problema:** Tab pode sair do modal aberto.
**Correção:** Verificar se Radix Dialog está configurado corretamente.

---

## 5. PROBLEMAS DE PERFORMANCE (Prioridade Baixa)

### 5.1 Re-renders Desnecessários
**Arquivo:** `src/pages/Prompts.tsx`
**Problema:** `extractVariables()` é chamado múltiplas vezes no render.
**Correção:** Memoizar resultado por prompt.id.

### 5.2 Animações Excessivas
**Problema:** Muitas animações CSS simultâneas (blobs, cards, hover).
**Correção:** Reduzir ou usar `prefers-reduced-motion`.

### 5.3 Bundle Size do Prompts-Data
**Problema:** Arquivo de dados tem ~98KB comprimido.
**Correção:** Considerar lazy loading por categoria.

---

## 6. CÓDIGO LEGADO/INCONSISTÊNCIAS

### 6.1 Comentário Desatualizado
**Arquivo:** `src/pages/Prompts.tsx:37-45`
```tsx
/**
 * ✨ Página Prompts v4.0 - Integração com Backend
 * ...
 * - Sincronização de favoritos com backend
 */
```
**Problema:** Menciona backend que não existe mais.
**Correção:** Atualizar comentários.

### 6.2 Função renderMarkdown Duplicada
**Problema:** Lógica de markdown existe em múltiplos lugares.
**Correção:** Centralizar em `lib/markdown.ts`.

### 6.3 Tipo AIRecommendation Inconsistente
**Problema:** `recommendedAI` pode ser string ou objeto, causando verificações repetidas.
**Correção:** Normalizar no carregamento dos dados.

---

## 7. MELHORIAS SUGERIDAS (Novas Features)

### 7.1 Busca Avançada
- Buscar no conteúdo do prompt, não só título/descrição
- Filtro por IA recomendada
- Filtro por nível acadêmico
- Filtro por tempo estimado

### 7.2 Histórico de Uso
- Salvar prompts usados recentemente
- Mostrar "Usado X vezes"
- Ordenar por popularidade

### 7.3 Compartilhamento
- Botão para compartilhar prompt via link
- Gerar QR code do prompt
- Copiar como markdown

### 7.4 Modo Offline/PWA
- Cache de prompts para uso offline
- Notificação de novos prompts

### 7.5 Templates Personalizados
- Salvar variáveis preenchidas como template
- Criar "perfis" de preenchimento

### 7.6 Integração com Anki
- Exportar flashcards diretamente para Anki
- Formato .apkg

### 7.7 Estatísticas de Uso
- Dashboard com prompts mais usados
- Tempo médio de uso
- IAs mais acessadas

### 7.8 Modo Comparação
- Comparar dois prompts lado a lado
- Ver diferenças entre versões

---

## 8. PLANO DE IMPLEMENTAÇÃO PRIORIZADO

### Fase 1 - Correções Críticas (Imediato)
1. [ ] Sanitizar HTML com DOMPurify
2. [ ] Corrigir URLs de IAs (focar em clipboard)
3. [ ] Atualizar comentários legados

### Fase 2 - Melhorias de UX (Curto Prazo)
4. [ ] Adicionar badge de variáveis no card
5. [ ] Extrair categorias dinamicamente
6. [ ] Melhorar feedback ao abrir IA
7. [ ] Adicionar contagem por categoria

### Fase 3 - Acessibilidade (Médio Prazo)
8. [ ] Adicionar aria-labels
9. [ ] Implementar suporte a prefers-reduced-motion
10. [ ] Verificar contraste de cores

### Fase 4 - Performance (Médio Prazo)
11. [ ] Memoizar extractVariables
12. [ ] Otimizar re-renders
13. [ ] Import estático de prompts-data

### Fase 5 - Novas Features (Longo Prazo)
14. [ ] Busca avançada
15. [ ] Histórico de uso
16. [ ] Compartilhamento
17. [ ] Estatísticas

---

## 9. MÉTRICAS DE SUCESSO

| Métrica | Atual | Meta |
|---------|-------|------|
| Lighthouse Performance | ~85 | 95+ |
| Lighthouse Accessibility | ~80 | 100 |
| Time to Interactive | ~2s | <1s |
| Bundle Size (gzip) | ~190KB | <150KB |
| Erros de Console | 0 | 0 |

---

## 10. ARQUIVOS AFETADOS

```
src/pages/Prompts.tsx              - Principal
src/components/PromptCustomizer.tsx - Personalização
src/components/PromptDialog.tsx    - Modal de detalhes
src/lib/promptVariables.ts         - Utilidades
src/data/prompts-data.ts           - Dados
src/types/prompt.ts                - Tipos
```

---

**Autor da Auditoria:** Claude Opus 4.5
**Próxima Revisão:** Após implementação da Fase 1
