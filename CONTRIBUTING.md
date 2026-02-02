# Guia de Contribuicao - MedPrompts

Obrigado pelo interesse em contribuir com o MedPrompts! Este documento fornece diretrizes para contribuir com o projeto.

## Indice

- [Codigo de Conduta](#codigo-de-conduta)
- [Como Contribuir](#como-contribuir)
- [Configuracao do Ambiente](#configuracao-do-ambiente)
- [Padrao de Commits](#padrao-de-commits)
- [Pull Requests](#pull-requests)
- [Testes](#testes)
- [Estilo de Codigo](#estilo-de-codigo)

## Codigo de Conduta

Este projeto adota um codigo de conduta para garantir um ambiente acolhedor para todos. Por favor, seja respeitoso e construtivo em suas interacoes.

## Como Contribuir

1. **Fork** o repositorio
2. **Clone** seu fork localmente
3. **Crie uma branch** para sua feature/fix
4. **Faca suas alteracoes**
5. **Rode os testes**
6. **Abra um Pull Request**

## Configuracao do Ambiente

### Pre-requisitos

- Node.js 20.x ou superior
- npm 10.x ou superior

### Instalacao

```bash
# Clone o repositorio
git clone https://github.com/seu-usuario/medprompts.git
cd medprompts

# Instale as dependencias
npm install

# Copie o arquivo de ambiente
cp .env.example .env

# Inicie o servidor de desenvolvimento
npm run dev
```

### Scripts Disponiveis

| Script | Descricao |
|--------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de producao |
| `npm run test` | Executa testes em modo watch |
| `npm run test:run` | Executa testes uma vez |
| `npm run test:coverage` | Executa testes com cobertura |
| `npm run lint` | Verifica erros de lint |
| `npm run lint:fix` | Corrige erros de lint |
| `npm run type-check` | Verifica tipos TypeScript |
| `npm run validate` | Roda type-check, lint e testes |

## Padrao de Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/). Formato:

```
<tipo>[escopo opcional]: <descricao>

[corpo opcional]

[rodape opcional]
```

### Tipos

- `feat`: Nova feature
- `fix`: Correcao de bug
- `docs`: Alteracoes na documentacao
- `style`: Formatacao (sem alteracao de codigo)
- `refactor`: Refatoracao de codigo
- `test`: Adicao/correcao de testes
- `chore`: Tarefas de manutencao
- `perf`: Melhoria de performance
- `ci`: Alteracoes de CI/CD
- `build`: Alteracoes no build

### Exemplos

```bash
feat: adiciona filtro por especialidade
fix: corrige bug de favoritos nao persistindo
docs: atualiza README com instrucoes de instalacao
test: adiciona testes para promptVariables
chore(deps): atualiza dependencias
```

## Pull Requests

### Antes de Abrir

1. Certifique-se que sua branch esta atualizada com `main`
2. Rode `npm run validate` e corrija erros
3. Adicione testes para novas funcionalidades
4. Atualize documentacao se necessario

### Template de PR

```markdown
## Descricao
Breve descricao das alteracoes.

## Tipo de Mudanca
- [ ] Bug fix
- [ ] Nova feature
- [ ] Breaking change
- [ ] Documentacao

## Checklist
- [ ] Meu codigo segue o estilo do projeto
- [ ] Fiz self-review do meu codigo
- [ ] Adicionei testes que provam que a correcao/feature funciona
- [ ] Testes novos e existentes passam localmente
```

## Testes

### Estrutura

```
src/
  lib/
    utils.ts
    utils.test.ts      # Teste junto ao arquivo
  components/
    Button.tsx
    Button.test.tsx
  test/
    setup.ts           # Configuracao global
```

### Escrevendo Testes

```typescript
import { describe, it, expect } from 'vitest'
import { minhaFuncao } from './utils'

describe('minhaFuncao', () => {
  it('deve retornar valor esperado', () => {
    const resultado = minhaFuncao('input')
    expect(resultado).toBe('output esperado')
  })
})
```

### Executando Testes

```bash
# Modo watch (desenvolvimento)
npm run test

# Execucao unica
npm run test:run

# Com cobertura
npm run test:coverage
```

## Estilo de Codigo

### TypeScript

- Use tipos explicitos sempre que possivel
- Evite `any` - prefira `unknown` ou tipos especificos
- Use interfaces para objetos, types para unioes/intersecoes

### React

- Componentes funcionais com hooks
- Props tipadas com interface
- Hooks customizados em `/hooks`

### Tailwind CSS

- Use classes utilitarias do Tailwind
- Agrupe classes com `cn()` para condicional
- Evite CSS customizado quando possivel

### Imports

```typescript
// 1. React e bibliotecas externas
import { useState } from 'react'
import { clsx } from 'clsx'

// 2. Componentes internos
import { Button } from '@/components/ui/button'

// 3. Hooks e utils
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

// 4. Tipos
import type { User } from '@/types'
```

## Duvidas?

Abra uma [issue](https://github.com/andressamendes/medprompts/issues) ou entre em contato.

---

Obrigado por contribuir!
