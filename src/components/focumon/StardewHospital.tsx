import React, { useRef, useEffect, useState, useCallback } from 'react';
import { User } from '../../types/studyRoom.types';
import { HOSPITAL_MAP, TILE_SIZE } from '../../data/hospitalMap.data';
import { TileRenderer } from '../../services/tileRenderer.service';
import { SpriteRenderer } from '../../services/spriteRenderer.service';
import { CollisionDetector } from '../../services/collision.service';
import { Pathfinder } from '../../services/pathfinding.service';
import { MovementController } from '../../services/movementController.service';
import { InteractionSystem, InteractionSuggestion } from '../../services/interaction.service';
import { VisualIndicators, TooltipData } from '../../services/visualIndicators.service';
import { Furniture } from '../../types/tile.types';

interface StardewHospitalProps {
  users: User[];
  currentUserId: string;
  onUserUpdate?: (user: User) => void;
  pomodoroSuggestions?: InteractionSuggestion[];
  onSuggestionDismiss?: () => void;
}

/**
 * Componente principal do hospital estilo Stardew Valley
 */
export const StardewHospital: React.FC<StardewHospitalProps> = ({
  users,
  currentUserId,
  onUserUpdate,
  pomodoroSuggestions = [],
  onSuggestionDismiss
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scale] = useState(2);
  const [animationFrame, setAnimationFrame] = useState(0);
  const [hoveredFurniture, setHoveredFurniture] = useState<Furniture | null>(null);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [targetPosition, setTargetPosition] = useState<{ x: number; y: number } | null>(null);

  // Referências para serviços (não recriar a cada render)
  const servicesRef = useRef<{
    tileRenderer?: TileRenderer;
    spriteRenderer?: SpriteRenderer;
    collisionDetector?: CollisionDetector;
    pathfinder?: Pathfinder;
    movementController?: MovementController;
    interactionSystem?: InteractionSystem;
    visualIndicators?: VisualIndicators;
  }>({});

  // Referência para tracking do último frame
  const lastFrameTimeRef = useRef<number>(Date.now());
  const animationIdRef = useRef<number>();

  // Inicializar serviços
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    // Criar serviços apenas uma vez
    if (!servicesRef.current.collisionDetector) {
      servicesRef.current.collisionDetector = new CollisionDetector(HOSPITAL_MAP);
      servicesRef.current.pathfinder = new Pathfinder(servicesRef.current.collisionDetector);
      servicesRef.current.movementController = new MovementController(
        HOSPITAL_MAP,
        servicesRef.current.collisionDetector,
        servicesRef.current.pathfinder
      );
      servicesRef.current.interactionSystem = new InteractionSystem(HOSPITAL_MAP);
    }

    // Criar/atualizar renderers
    servicesRef.current.tileRenderer = new TileRenderer(context, TILE_SIZE, scale);
    servicesRef.current.spriteRenderer = new SpriteRenderer(context, TILE_SIZE, scale);
    servicesRef.current.visualIndicators = new VisualIndicators(context, TILE_SIZE, scale);
  }, [scale]);

  // Loop de atualização e renderização
  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const {
      tileRenderer,
      spriteRenderer,
      movementController,
      visualIndicators
    } = servicesRef.current;

    if (!tileRenderer || !spriteRenderer || !movementController || !visualIndicators) return;

    // Calcular delta time
    const now = Date.now();
    const deltaTime = now - lastFrameTimeRef.current;
    lastFrameTimeRef.current = now;

    // Atualizar posições dos usuários
    users.forEach(user => {
      movementController.updatePosition(user, deltaTime);
      spriteRenderer.updateAnimation(user, deltaTime);

      // Notificar mudanças
      if (onUserUpdate) {
        onUserUpdate(user);
      }
    });

    // Renderizar
    tileRenderer.renderMap(HOSPITAL_MAP, animationFrame);

    // Renderizar indicadores visuais de móveis
    if (hoveredFurniture) {
      if (hoveredFurniture.occupiedBy) {
        visualIndicators.drawOccupiedHighlight(hoveredFurniture);
      } else {
        visualIndicators.drawFurnitureHighlight(hoveredFurniture, 0.3 + Math.sin(animationFrame * 0.1) * 0.1);
      }
    }

    // Renderizar sugestões Pomodoro
    pomodoroSuggestions.forEach(suggestion => {
      visualIndicators.drawSuggestionIndicator(suggestion.furniture, '💡');
    });

    // Renderizar destino
    if (targetPosition) {
      visualIndicators.drawDestinationMarker(targetPosition, animationFrame);
    }

    // Renderizar usuários
    users.forEach(user => {
      const isCurrentUser = user.id === currentUserId;
      spriteRenderer.drawAvatar(user, user.position.x, user.position.y, isCurrentUser);
    });

    // Renderizar tooltip
    if (tooltip) {
      visualIndicators.drawTooltip(tooltip);
    }

    // Incrementar frame de animação
    setAnimationFrame(prev => (prev + 1) % 60);

    // Próximo frame
    animationIdRef.current = requestAnimationFrame(gameLoop);
  }, [users, currentUserId, animationFrame, onUserUpdate, hoveredFurniture, targetPosition, tooltip, pomodoroSuggestions]);

  // Iniciar loop de animação
  useEffect(() => {
    animationIdRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [gameLoop]);

  // Handler de movimento do mouse
  const handleCanvasMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Converter para coordenadas tile
    const tileX = Math.floor(x / (TILE_SIZE * scale));
    const tileY = Math.floor(y / (TILE_SIZE * scale));

    const { interactionSystem } = servicesRef.current;
    if (!interactionSystem) return;

    // Verificar móveis próximos
    const nearbyFurniture = interactionSystem.getInteractablesNearby(tileX, tileY, 0);

    if (nearbyFurniture.length > 0) {
      const furniture = nearbyFurniture[0];
      setHoveredFurniture(furniture);

      // Criar tooltip
      const furnitureName = interactionSystem.getFurnitureName(furniture);
      const furnitureEmoji = interactionSystem.getFurnitureEmoji(furniture);
      const tooltipText = furniture.occupiedBy
        ? `${furnitureEmoji} ${furnitureName} (Ocupado)`
        : `${furnitureEmoji} ${furnitureName}`;

      setTooltip({
        text: tooltipText,
        x: x,
        y: y - 10
      });
    } else {
      setHoveredFurniture(null);
      setTooltip(null);
    }
  }, [scale]);

  // Handler de clique
  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const currentUser = users.find(u => u.id === currentUserId);
    if (!currentUser) return;

    const { movementController, interactionSystem } = servicesRef.current;
    if (!movementController || !interactionSystem) return;

    const command = movementController.handleClick(x, y, currentUser, scale);
    if (command) {
      movementController.processMovementCommand(command, currentUser);

      // Mostrar destino
      if (command.targetPosition) {
        setTargetPosition(command.targetPosition);

        // Limpar destino após 2 segundos
        setTimeout(() => setTargetPosition(null), 2000);
      }

      // Se clicou em sugestão Pomodoro, limpar sugestões
      if (pomodoroSuggestions.length > 0 && onSuggestionDismiss) {
        onSuggestionDismiss();
      }
    }
  }, [users, currentUserId, scale, pomodoroSuggestions, onSuggestionDismiss]);

  // Handler de teclado
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const currentUser = users.find(u => u.id === currentUserId);
      if (!currentUser) return;

      const { movementController } = servicesRef.current;
      if (!movementController) return;

      const command = movementController.handleKeyboard(event.key, currentUser);
      if (command) {
        movementController.processMovementCommand(command, currentUser);
        event.preventDefault();
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      // Parar movimento contínuo se necessário
      if (['w', 'a', 's', 'd', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight'].includes(event.key)) {
        event.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [users, currentUserId]);

  // Dimensões do canvas
  const canvasWidth = HOSPITAL_MAP.width * TILE_SIZE * scale;
  const canvasHeight = HOSPITAL_MAP.height * TILE_SIZE * scale;

  return (
    <div className="stardew-hospital-container">
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
        style={{
          border: '2px solid #B8A0D0',
          borderRadius: '8px',
          cursor: hoveredFurniture ? 'pointer' : 'default',
          imageRendering: 'pixelated',
          maxWidth: '100%',
          height: 'auto'
        }}
      />

      {/* Notificação de sugestão Pomodoro */}
      {pomodoroSuggestions.length > 0 && (
        <div style={{
          marginTop: '12px',
          padding: '12px 16px',
          backgroundColor: '#F39C12',
          borderRadius: '8px',
          color: '#FFFFFF',
          fontFamily: 'monospace',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}>
          <div>
            <strong>💡 Sugestão:</strong> Móveis disponíveis destacados no mapa!
          </div>
          <button
            onClick={onSuggestionDismiss}
            style={{
              background: 'rgba(255,255,255,0.3)',
              border: 'none',
              borderRadius: '4px',
              color: '#FFFFFF',
              cursor: 'pointer',
              padding: '4px 8px',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
          >
            ✕
          </button>
        </div>
      )}

      <div className="controls-info" style={{
        marginTop: '16px',
        padding: '12px',
        backgroundColor: '#E8D4F8',
        borderRadius: '8px',
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#2C3E50'
      }}>
        <div><strong>🎮 Controles:</strong></div>
        <div>🖱️ <strong>Clique</strong> para mover</div>
        <div>⌨️ <strong>WASD</strong> ou <strong>Setas</strong> para andar</div>
        <div>🪑 <strong>Clique</strong> em móveis para interagir</div>
        <div>💡 <strong>Móveis verdes:</strong> disponíveis | <strong>Vermelhos:</strong> ocupados</div>
        <div style={{ marginTop: '8px', fontSize: '12px', opacity: 0.8 }}>
          👥 Usuários: {users.length} | FPS: ~60
          {hoveredFurniture && ` | 🖱️ ${hoveredFurniture.type.toUpperCase()}`}
        </div>
      </div>
    </div>
  );
};

export default StardewHospital;
