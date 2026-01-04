
```markdown
# 🩺 MedPrompts - Plataforma de Prompts para Estudantes de Medicina

> Sistema gamificado de prompts de IA para estudantes de medicina, com casos clínicos, mnemônicos e desafios semanais.

![Deploy Status](https://img.shields.io/badge/deploy-active-success)
![React](https://img.shields.io/badge/React-18.3-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)
![Vite](https://img.shields.io/badge/Vite-6.0-purple)

## 🚀 Funcionalidades

### 📚 Biblioteca de Prompts

- **130+ prompts** organizados por categorias
- Filtros por disciplina e busca inteligente
- Sistema de favoritos e histórico de uso
- Copiar com um clique

### 🎮 Sistema de Gamificação

- **Sistema de XP e níveis** (5 níveis)
- **Streak diário** com recompensas
- **15+ badges** (Bronze, Prata, Ouro)
- **Missões diárias** com XP bônus
- **Desafios semanais** temáticos

### 🏥 Casos Clínicos

- Casos validados cientificamente via Perplexity
- Questões de múltipla escolha
- Explicações detalhadas
- Sistema de progresso e acertos

### 🧠 Mnemônicos Médicos

- Biblioteca de mnemônicos por categoria
- Busca e filtros inteligentes
- Sistema de cópia rápida
- Integração com desafios semanais

### ⏱️ Timer Pomodoro

- Técnica Pomodoro (25min trabalho / 5min descanso)
- Notificações sonoras
- Contabiliza XP por sessão completa
- Histórico de sessões

### 👤 Perfil do Estudante

- Personalização com nome e ano do curso
- Disciplinas em andamento
- Estatísticas de progresso
- Sistema de backup e importação

## 🛠️ Tecnologias

- **React 18.3** - Framework principal
- **TypeScript 5.6** - Tipagem estática
- **Vite 6.0** - Build tool
- **Tailwind CSS** - Estilização
- **shadcn/ui** - Componentes UI
- **Lucide React** - Ícones
- **LocalStorage** - Persistência de dados
- **AES-256** - Criptografia de dados sensíveis

## 📊 Sistema de Logging e Monitoramento

MedPrompts inclui um sistema profissional de logging estruturado para monitoramento, debug e análise de uso.

### ✨ Recursos do Logger

- **5 Níveis de Severidade**
  - 🐛 `DEBUG` - Informações detalhadas para debugging
  - ℹ️ `INFO` - Informações gerais sobre operações
  - ⚠️ `WARN` - Avisos que não impedem execução
  - ❌ `ERROR` - Erros que afetam funcionalidade
  - 💀 `FATAL` - Erros críticos que param a aplicação

- **Persistência Local**
  - Logs salvos em localStorage com debounce
  - Proteção contra quota excedida
  - Remoção automática de referências circulares
  - Limpeza automática de logs antigos

- **Debug Panel** (apenas em desenvolvimento)
  - Interface visual para visualizar logs em tempo real
  - Filtros por nível de severidade
  - Busca de logs por texto
  - Exportação em JSON
  - Limpeza de logs com um clique

- **Error Boundary**
  - Captura automática de erros React não tratados
  - Logs detalhados com stack trace
  - Fallback UI amigável para usuário
  - Botão de retry para recuperação

### 🔧 Uso do Logger

#### Em Componentes React:

```typescript
import { useLogger } from '@/utils/logger';

function MeuComponente() {
  const logger = useLogger();
  
  useEffect(() => {
    logger.info('Componente montado');
  }, []);
  
  const handleAction = async () => {
    try {
      logger.debug('Iniciando ação', { userId: 123 });
      // ... seu código
      logger.info('Ação concluída com sucesso');
    } catch (error) {
      logger.error('Erro ao executar ação', error as Error, {
        userId: 123,
        context: 'handleAction'
      });
    }
  };
  
  return <div>...</div>;
}
```

#### Em Contextos e Utilitários:

```typescript
import { logger } from '@/utils/logger';

export function minhaFuncao() {
  logger.info('Função executada', { timestamp: Date.now() });
  
  try {
    // ... código
  } catch (error) {
    logger.error('Erro na função', error as Error);
  }
}
```

### 🎛️ Debug Panel

O Debug Panel aparece automaticamente em **localhost** (desenvolvimento):

1. **Abrir o painel** - Clique no botão "🐛 Debug Panel" no canto inferior direito
2. **Filtrar logs** - Use os botões de nível (DEBUG, INFO, WARN, ERROR, FATAL)
3. **Buscar** - Digite texto na barra de busca para filtrar logs
4. **Exportar** - Baixe todos os logs em formato JSON
5. **Limpar** - Remova todos os logs do armazenamento local

### 📈 Monitoramento em Produção

Em produção, o sistema automaticamente:
- ✅ Registra apenas logs de nível `WARN` ou superior
- ✅ Envia logs críticos (`ERROR` e `FATAL`) para servidor a cada 5 minutos
- ✅ Remove Debug Panel da interface
- ✅ Otimiza performance com debounce e limitação de quantidade
- ✅ Limpa logs antigos para economizar espaço

### 🔍 Logs Capturados Automaticamente

O sistema registra:

- **Inicialização da aplicação** - versão, ambiente, navegador
- **Navegação e rotas** - mudanças de página
- **Filtragens e buscas** - interações do usuário
- **Submissões de formulários** - tentativas, sucessos e falhas
- **Validações** - erros de campos e dados
- **Ações do usuário** - favoritos, timer, prompts copiados
- **Erros não tratados** - via Error Boundary
- **Métricas de uso** - tempo de sessão, features mais usadas

### 🛡️ Privacidade e Segurança

- ✅ Logs armazenados apenas localmente no navegador do usuário
- ✅ Dados sensíveis nunca são logados (senhas, tokens, etc.)
- ✅ Logs de produção enviados apenas se endpoint configurado
- ✅ Limpeza automática de logs antigos (máximo 100 entradas)
- ✅ Proteção contra referências circulares
- ✅ Serialização segura de objetos complexos

### ⚙️ Configuração do Endpoint de Logs

Para configurar envio de logs em produção, edite `src/App.tsx`:

```typescript
// Substitua pela URL do seu endpoint de logs
logger.sendLogsToServer('https://api.seudominio.com/logs')
  .catch(console.error);
```

### 📦 Estrutura de um Log

```json
{
  "level": 1,
  "message": "Usuário favoritou um prompt",
  "timestamp": "2026-01-02T21:00:00.000Z",
  "context": {
    "promptId": "anamnese-completa",
    "action": "add",
    "totalFavorites": 5
  },
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
  "url": "https://andressamendes.github.io/medprompts/"
}
```

### 🔨 Métodos Disponíveis

```typescript
// Hook para componentes React
const logger = useLogger();

// Import direto para utilitários
import { logger } from '@/utils/logger';

// Métodos disponíveis
logger.debug(message, context?)      // Nível DEBUG
logger.info(message, context?)       // Nível INFO
logger.warn(message, context?)       // Nível WARN
logger.error(message, error?, context?)  // Nível ERROR
logger.fatal(message, error?, context?)  // Nível FATAL

// Utilidades
logger.getLogs()                     // Retorna todos os logs
logger.getLogsByLevel(LogLevel.ERROR) // Filtra por nível
logger.searchLogs('texto')           // Busca por texto
logger.clearLogs()                   // Limpa todos os logs
logger.exportLogs()                  // Exporta como JSON
logger.getLogCounts()                // Conta logs por nível
logger.setMinLevel(LogLevel.WARN)    // Define nível mínimo
logger.setMaxLogs(200)               // Define limite de logs
```

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:

- Reportar bugs
- Sugerir novos prompts
- Adicionar casos clínicos
- Melhorar a documentação
- Propor novas funcionalidades

## 👩‍⚕️ Autora

**Andressa Mendes**  
Estudante de Medicina - Afya Guanambi/BA  
Interesse em IA aplicada à Medicina

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 🌟 Agradecimentos

- **Perplexity AI** - Validação científica dos casos clínicos
- **shadcn/ui** - Componentes UI elegantes
- **Lucide** - Biblioteca de ícones
- **Comunidade médica acadêmica** - Feedback e sugestões

## 📞 Contato

- **GitHub**: [@andressamendes](https://github.com/andressamendes)
- **Plataforma**: [andressamendes.github.io/medprompts](https://andressamendes.github.io/medprompts)

---

**Desenvolvido com ❤️ para estudantes de Medicina**
```

***

## 📝 **Como Usar Este README:**

1. **Copie o conteúdo completo acima**
2. **Substitua o conteúdo atual do seu `README.md`**
3. **Faça o commit:**

```bash
git add README.md
git commit -m "docs: adiciona documentação completa do sistema de logging"
git push origin main
```

Pronto! A documentação está completa e profissional! 🎉
