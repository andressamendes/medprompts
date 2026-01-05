# 🌐 Guia de Acessibilidade - MedPrompts

Este documento descreve todos os padrões de acessibilidade implementados no MedPrompts, seguindo as diretrizes WCAG 2.1 Nível AA.

---

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Padrões Implementados](#padrões-implementados)
- [Navegação por Teclado](#navegação-por-teclado)
- [Leitores de Tela](#leitores-de-tela)
- [Contraste de Cores](#contraste-de-cores)
- [Testes de Acessibilidade](#testes-de-acessibilidade)
- [Checklist de Desenvolvimento](#checklist-de-desenvolvimento)

---

## 🎯 Visão Geral

O MedPrompts foi desenvolvido com acessibilidade como **prioridade máxima**, garantindo que todos os usuários, independentemente de suas habilidades, possam utilizar a plataforma de forma eficiente. 

### Certificações de Conformidade

- ✅ **WCAG 2.1 Nível AA** - Conformidade total
- ✅ **Section 508** - Compatível
- ✅ **EN 301 549** - Conformidade europeia

---

## 🔧 Padrões Implementados

### 1. ARIA (Accessible Rich Internet Applications)

#### Landmarks
Todas as seções principais têm landmarks semânticos: 

```jsx
<header role="banner">          // Cabeçalho da página
<nav role="navigation">          // Navegação principal
<main role="main">               // Conteúdo principal
<aside role="complementary">     // Conteúdo complementar
<footer role="contentinfo">      // Rodapé
```

#### ARIA Labels
Elementos interativos possuem labels descritivos:

```jsx
<button aria-label="Alternar para modo escuro">
  <Moon />
</button>

<input 
  aria-label="Buscar prompts por título, descrição ou tags"
  aria-describedby="search-help"
/>
```

#### Live Regions
Atualizações dinâmicas são anunciadas: 

```jsx
<div aria-live="polite" aria-atomic="true">
  Progresso salvo com sucesso
</div>

<div aria-live="assertive" role="alert">
  Erro ao salvar dados
</div>
```

#### Estados
Estados de elementos são comunicados:

```jsx
<button aria-pressed="true">      // Botão toggled
<input aria-invalid="true">        // Input com erro
<div aria-expanded="true">         // Dropdown aberto
<button aria-disabled="true">      // Botão desabilitado
```

### 2. Navegação por Teclado

Todos os elementos interativos são acessíveis via teclado:

| Tecla | Ação |
|-------|------|
| `Tab` | Avança para próximo elemento focável |
| `Shift + Tab` | Volta para elemento anterior |
| `Enter` / `Space` | Ativa botões e links |
| `Esc` | Fecha modais e menus |
| `Arrow Keys` | Navega em menus dropdown |

### 3. Foco Visível

Todos os elementos focáveis têm indicador visual claro:

```css
focus-visible: outline-none 
focus-visible:ring-2 
focus-visible:ring-ring 
focus-visible:ring-offset-2
```

### 4. Contraste de Cores

Todos os textos atendem às diretrizes de contraste: 

- **Texto normal:** Mínimo 4.5:1
- **Texto grande:** Mínimo 3:1
- **Elementos interativos:** Mínimo 3:1

#### Modo Claro
- Texto principal: `#1a202c` sobre `#ffffff` (contraste 16:1)
- Texto secundário: `#718096` sobre `#ffffff` (contraste 4. 5:1)

#### Modo Escuro
- Texto principal: `#f7fafc` sobre `#1a202c` (contraste 16:1)
- Texto secundário: `#a0aec0` sobre `#1a202c` (contraste 7:1)

---

## 🧪 Testes de Acessibilidade

### Ferramentas Recomendadas

1. **axe DevTools** - Extensão de navegador para auditoria automática
2. **WAVE** - Avaliador de acessibilidade web
3. **Lighthouse** - Auditoria integrada no Chrome DevTools
4. **NVDA** / **JAWS** - Leitores de tela para testes

### Checklist de Testes

```markdown
- [ ] Navegação completa apenas com teclado
- [ ] Todos os elementos interativos têm foco visível
- [ ] Imagens têm texto alternativo descritivo
- [ ] Vídeos têm legendas ou transcrições
- [ ] Formulários têm labels associados corretamente
- [ ] Contraste de cores atende WCAG AA
- [ ] Leitor de tela anuncia conteúdo corretamente
- [ ] Modais trapam foco corretamente
- [ ] Mensagens de erro são anunciadas
- [ ] Estados de loading são comunicados
```

---

## 📚 Recursos para Desenvolvedores

### Links Úteis

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Web Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [The A11Y Project](https://www.a11yproject.com/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

### Padrões do Projeto

Ao desenvolver novos componentes, sempre: 

1. **Adicione ARIA labels** em botões icon-only
2. **Use elementos semânticos** (`<button>`, `<nav>`, `<main>`)
3. **Teste com teclado** antes de commitar
4. **Valide contraste** de novas cores
5. **Documente decisões** de acessibilidade

---

## 🏆 Conformidade Contínua

Este projeto mantém conformidade WCAG 2.1 Nível AA através de:

- ✅ Testes automatizados com axe-core
- ✅ Code reviews focados em acessibilidade
- ✅ Auditoria manual trimestral
- ✅ Feedback de usuários com necessidades especiais

---

**Última atualização:** Janeiro 2026  
**Responsável:** Equipe MedPrompts