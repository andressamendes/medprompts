# 🏥 MedFocus Stardew Valley System - Documentação Completa

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Componentes](#componentes)
4. [Serviços](#serviços)
5. [Tipos de Dados](#tipos-de-dados)
6. [Como Usar](#como-usar)
7. [Testes](#testes)

---

## 🎯 Visão Geral

O MedFocus Stardew Valley System transforma a sala de estudos em uma experiência interativa 2D pixel art inspirada no jogo Stardew Valley. Os usuários podem:

- ✅ Mover-se livremente pelo hospital usando cliques ou WASD
- ✅ Interagir com móveis (sentar, deitar, usar computadores)
- ✅ Ver outros usuários em tempo real (5-20 simulados)
- ✅ Receber sugestões baseadas no modo Pomodoro
- ✅ Visualizar indicadores visuais (highlights, tooltips, destino)
- ✅ Acompanhar animações fluidas 60 FPS

---

## 🏗️ Arquitetura

### Estrutura de Arquivos

```
src/
├── types/
│   ├── tile.types.ts           # Tipos de tiles, móveis, decorações
│   ├── movement.types.ts       # Tipos de movimento e direção
│   ├── studyRoom.types.ts      # Tipos de usuários (atualizado)
│   └── avatar.types.ts         # Tipos de avatares
├── data/
│   └── hospitalMap.data.ts     # Mapa 50x30 do hospital
├── services/
│   ├── tileRenderer.service.ts        # Renderiza tiles e móveis
│   ├── spriteRenderer.service.ts      # Renderiza avatares pixel art
│   ├── collision.service.ts           # Detecção de colisões
│   ├── pathfinding.service.ts         # Algoritmo A*
│   ├── movementController.service.ts  # Controlador de movimento
│   ├── interaction.service.ts         # Sistema de interações
│   ├── visualIndicators.service.ts    # Indicadores visuais
│   └── studyRoom.service.ts           # Serviço principal (atualizado)
├── components/focumon/
│   ├── StardewHospital.tsx     # Componente canvas principal
│   └── StardewDemo.tsx         # Componente de demonstração
└── hooks/
    └── useStudyRoom.ts          # Hook React (atualizado)
```

---

## 🧩 Componentes

### StardewHospital

**Arquivo**: `src/components/focumon/StardewHospital.tsx`

Componente React principal que renderiza o hospital interativo.

**Props**:
- `users: User[]` - Lista de usuários
- `currentUserId: string` - ID do usuário atual
- `onUserUpdate?: (user: User) => void` - Callback de atualização
- `pomodoroSuggestions?: InteractionSuggestion[]` - Sugestões Pomodoro
- `onSuggestionDismiss?: () => void` - Callback para fechar sugestão

**Funcionalidades**:
- Canvas 1600x960px (50x30 tiles × 16px × 2 scale)
- Game loop 60 FPS
- Suporte a clique e teclado (WASD/Setas)
- Hover com tooltips
- Indicadores visuais

### StardewDemo

**Arquivo**: `src/components/focumon/StardewDemo.tsx`

Componente de demonstração completo com UI.

**Funcionalidades**:
- Header com título
- Controles de status Pomodoro
- Canvas do hospital
- Estatísticas em tempo real

---

## ⚙️ Serviços

### 1. TileRenderer

**Arquivo**: `src/services/tileRenderer.service.ts`

Responsável por renderizar tiles, móveis e decorações.

**Métodos principais**:
- `renderTile(tile: Tile)` - Renderiza um tile individual
- `renderFurniture(furniture: Furniture)` - Renderiza móvel com sombra
- `renderDecoration(decoration: Decoration, frame)` - Renderiza decoração
- `renderMap(map: HospitalMap, frame)` - Renderiza mapa completo em layers

**Paleta de cores**:
- Floor: #E8D4F8, #E0CCF0, #D8C4E8 (lilás)
- Wall: #B8A0D0 (roxo pastel)
- Móveis: #8B7355 (madeira), #BDC3C7 (metal)

### 2. SpriteRenderer

**Arquivo**: `src/services/spriteRenderer.service.ts`

Responsável por renderizar avatares pixel art 16x24.

**Métodos principais**:
- `drawAvatar(user, x, y, isCurrentUser)` - Desenha avatar completo
- `updateAnimation(user, deltaTime)` - Atualiza animação
- `drawNameTag(user, x, y, isCurrentUser)` - Desenha tag de identificação

**Estados de animação**:
- `walking`: 4 frames (200ms cada)
- `idle`: Respiração suave (60 frames)
- `sitting`: Postura sentada
- `lying`: Deitado horizontal
- `using`: Braço estendido

### 3. CollisionDetector

**Arquivo**: `src/services/collision.service.ts`

Detecta colisões com paredes e móveis.

**Métodos principais**:
- `isWalkable(x, y)` - Verifica se tile é caminhável
- `canMoveTo(fromX, fromY, toX, toY)` - Valida movimento
- `getCollisionGrid()` - Retorna matriz de colisões
- `findNearestWalkablePosition(x, y)` - Busca posição válida próxima

### 4. Pathfinder

**Arquivo**: `src/services/pathfinding.service.ts`

Implementa algoritmo A* para calcular caminhos.

**Métodos principais**:
- `findPath(startX, startY, endX, endY)` - Calcula caminho ótimo
- `smoothPath(path)` - Suaviza caminho com line-of-sight
- `getManhattanDistance(from, to)` - Distância Manhattan
- `getEuclideanDistance(from, to)` - Distância Euclidiana

### 5. MovementController

**Arquivo**: `src/services/movementController.service.ts`

Controla o movimento dos avatares.

**Métodos principais**:
- `handleClick(x, y, user, scale)` - Converte clique em comando
- `handleKeyboard(key, user)` - Processa teclas WASD/Setas
- `updatePosition(user, deltaTime)` - Move user ao longo do path
- `calculateDirection(from, to)` - Determina direção

**Configurações**:
- Velocidade: 3 tiles/segundo
- Tile size: 16px

### 6. InteractionSystem

**Arquivo**: `src/services/interaction.service.ts`

Gerencia interações com móveis.

**Métodos principais**:
- `interact(user, furniture)` - Executa interação
- `getSuggestionsForStatus(status, position)` - Sugestões Pomodoro
- `getInteractablesNearby(x, y, range)` - Lista móveis próximos

**Tipos de interação**:
- **sit**: Sentar em cadeira
- **sleep**: Deitar em maca
- **use**: Usar computador/equipamento
- **examine**: Examinar equipamento
- **open**: Abrir armário

### 7. VisualIndicators

**Arquivo**: `src/services/visualIndicators.service.ts`

Renderiza indicadores visuais.

**Métodos principais**:
- `drawFurnitureHighlight(furniture, alpha)` - Highlight verde pulsante
- `drawOccupiedHighlight(furniture)` - Highlight vermelho tracejado
- `drawDestinationMarker(position, pulse)` - Círculo azul pulsante
- `drawTooltip(tooltip)` - Caixa de texto com informações
- `drawSuggestionIndicator(furniture, emoji)` - Indicador 💡

---

## 📊 Tipos de Dados

### Tile

```typescript
interface Tile {
  x: number;
  y: number;
  type: 'floor' | 'wall' | 'door' | 'window' | 'void';
  isWalkable: boolean;
  variant?: number;
}
```

### Furniture

```typescript
interface Furniture {
  id: string;
  type: 'bed' | 'chair' | 'desk' | 'counter' | 'cabinet' | 'computer' | 'equipment';
  x: number;
  y: number;
  width: number;
  height: number;
  isInteractive: boolean;
  interactionType?: 'sit' | 'use' | 'examine' | 'open' | 'sleep';
  occupiedBy?: string;
}
```

### User (Atualizado)

```typescript
interface User {
  id: string;
  username: string;
  status: 'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK' | 'OFFLINE';
  position: Position;
  pomodorosCompleted: number;
  joinedAt: Date;
  lastActivity: Date;
  avatar: AvatarCustomization;
  // Novos campos:
  direction: 'up' | 'down' | 'left' | 'right';
  movementState: 'idle' | 'walking' | 'sitting' | 'lying' | 'using';
  targetPosition?: Position;
  currentPath?: Position[];
  interactingWith?: string;
  animationFrame: number;
}
```

---

## 🎮 Como Usar

### Opção 1: Componente Standalone (StardewDemo)

```tsx
import { StardewDemo } from './components/focumon/StardewDemo';

function App() {
  return <StardewDemo />;
}
```

### Opção 2: Integração Manual

```tsx
import { StardewHospital } from './components/focumon/StardewHospital';
import { useStudyRoom } from './hooks/useStudyRoom';

function MyComponent() {
  const {
    currentUser,
    otherUsers,
    pomodoroSuggestion,
    clearPomodoroSuggestion
  } = useStudyRoom('Você', 'FOCUS');

  const allUsers = currentUser ? [currentUser, ...otherUsers] : [];

  return (
    <StardewHospital
      users={allUsers}
      currentUserId={currentUser?.id || ''}
      pomodoroSuggestions={pomodoroSuggestion?.suggestions || []}
      onSuggestionDismiss={clearPomodoroSuggestion}
    />
  );
}
```

### Controles

- **Clique**: Move o avatar para a posição clicada (com pathfinding A*)
- **WASD / Setas**: Move o avatar uma tile por vez
- **Clique em móvel**: Move até o móvel e interage
- **Hover em móvel**: Mostra tooltip com informações

---

## 🧪 Testes

### Teste Manual

1. **Movimento**:
   - ✅ Clique em várias posições → avatar deve calcular caminho e mover
   - ✅ Use WASD → avatar deve mover uma tile por vez
   - ✅ Tente andar através de paredes → deve bloquear

2. **Colisões**:
   - ✅ Tente atravessar móveis → deve bloquear
   - ✅ Verifique diagonal → não deve cortar cantos

3. **Interações**:
   - ✅ Clique em cadeira → avatar deve sentar
   - ✅ Clique em maca → avatar deve deitar
   - ✅ Clique em computador → avatar deve usar (3s)

4. **Pomodoro**:
   - ✅ Mude status para FOCUS → sugestão de computador/mesa
   - ✅ Mude para SHORT_BREAK → sugestão de cadeira
   - ✅ Mude para LONG_BREAK → sugestão de leito

5. **Visual**:
   - ✅ Hover em móvel → deve destacar (verde/vermelho)
   - ✅ Clique em posição → deve mostrar destino (azul pulsante)
   - ✅ Sugestões Pomodoro → deve mostrar 💡

---

## 📦 Dependências

- **React**: Framework UI
- **TypeScript**: Tipagem estática
- **pathfinding**: Biblioteca A* para pathfinding
- **@types/pathfinding**: Tipos TypeScript para pathfinding

---

## 🎨 Customização

### Alterar Paleta de Cores

Edite o arquivo `src/services/tileRenderer.service.ts`:

```typescript
this.colors = {
  floor: ['#SUA_COR_1', '#SUA_COR_2', '#SUA_COR_3'],
  wall: '#SUA_COR',
  // ...
};
```

### Adicionar Novos Móveis

1. Edite `src/data/hospitalMap.data.ts`
2. Adicione ao array `furnitureList`:

```typescript
{
  id: 'meu-movel',
  type: 'desk',
  x: 10,
  y: 15,
  width: 3,
  height: 2,
  isInteractive: true,
  interactionType: 'use'
}
```

### Alterar Velocidade de Movimento

Edite `src/services/movementController.service.ts`:

```typescript
private readonly MOVE_SPEED = 5; // tiles por segundo
```

---

## 🚀 Performance

- **FPS**: 60 constante
- **Usuários**: Suporta até 30 simultâneos
- **Canvas**: 1600x960px
- **Rendering**: RequestAnimationFrame

---

## 🐛 Troubleshooting

### Problema: Avatar não se move

**Solução**: Verifique se o usuário tem os campos `direction`, `movementState`, `animationFrame` inicializados.

### Problema: Colisões não funcionam

**Solução**: Verifique se o `CollisionDetector` foi inicializado corretamente com o `HOSPITAL_MAP`.

### Problema: Pathfinding não encontra caminho

**Solução**: Verifique se existe um caminho válido entre origem e destino. Use `findNearestWalkablePosition()` para ajustar destino.

---

## 📝 Changelog

### Versão 1.0.0 (FASE 5 Completa)

- ✅ Sistema de tiles e renderização
- ✅ Mapa 50x30 do hospital com 6 áreas
- ✅ 34 móveis interativos
- ✅ 22 decorações (6 animadas)
- ✅ Sprites pixel art 16x24
- ✅ Sistema de animação (walking, idle, sitting, lying, using)
- ✅ Pathfinding A* com suavização
- ✅ Detecção de colisões robusta
- ✅ Controles clique + WASD
- ✅ Sistema de interações completo
- ✅ Indicadores visuais premium
- ✅ Sincronização Pomodoro
- ✅ Multiplayer simulado (5-20 usuários)

---

## 📧 Suporte

Para dúvidas ou problemas:
1. Verifique esta documentação
2. Consulte os comentários no código
3. Teste com `StardewDemo.tsx` primeiro

---

## 🎉 Conclusão

O MedFocus Stardew Valley System está completo e pronto para uso! O sistema oferece uma experiência interativa premium com pixel art de qualidade, movimentação fluida e integração perfeita com o sistema Pomodoro.

**Aproveite! 🏥✨**
