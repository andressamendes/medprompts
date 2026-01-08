import { User, UserStatus, StudyRoom, RoomStats } from '@/types/studyRoom.types';

/**
 * Serviço MOCK para simular sistema multiplayer
 * Versão 1.0 - Simulação local sem backend
 */

// Nomes realistas para estudantes
const STUDENT_NAMES = [
  'Ana Silva', 'Bruno Costa', 'Carlos Santos', 'Diana Lima',
  'Eduardo Souza', 'Fernanda Alves', 'Gabriel Rocha', 'Helena Martins',
  'Igor Pereira', 'Julia Ferreira', 'Lucas Oliveira', 'Maria Clara',
  'Nicolas Barros', 'Olivia Mendes', 'Pedro Henrique', 'Queila Dias',
  'Rafael Gomes', 'Sofia Carvalho', 'Thiago Ribeiro', 'Vitoria Pinto',
  'Wellington Castro', 'Xuxa Monteiro', 'Yasmin Teixeira', 'Zilda Nunes',
  'Alberto Ramos', 'Beatriz Lopes', 'Cesar Moura', 'Daniela Cunha',
  'Emerson Pires', 'Fabiana Luz', 'Gustavo Melo', 'Heloisa Campos',
  'Iago Freitas', 'Joana Braga', 'Kevin Azevedo', 'Larissa Duarte',
  'Marcelo Viana', 'Natalia Porto', 'Otavio Silva', 'Patricia Reis',
  'Quirino Bastos', 'Renata Farias', 'Sergio Lima', 'Tatiana Moraes',
  'Ulisses Neves', 'Vanessa Correia', 'Wagner Torres', 'Xenia Santos',
  'Yuri Macedo', 'Zara Vieira'
];

class StudyRoomService {
  private room: StudyRoom;
  private currentUserId: string = 'current-user';
  private updateInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.room = {
      id: 'main-room',
      name: 'Hospital Conference Room',
      capacity: 50,
      users: [],
      createdAt: new Date()
    };
  }

  /**
   * Inicializar sala com usuário atual e usuários simulados
   */
  async initialize(currentUserName: string, currentStatus: UserStatus): Promise<StudyRoom> {
    // Adicionar usuário atual
    const currentUser: User = {
      id: this.currentUserId,
      username: currentUserName,
      status: currentStatus,
      position: { row: 0, col: 0 },
      pomodorosCompleted: 0,
      joinedAt: new Date(),
      lastActivity: new Date()
    };

    // Gerar usuários simulados (entre 5 e 20)
    const numberOfUsers = Math.floor(Math.random() * 16) + 5;
    const simulatedUsers = this.generateSimulatedUsers(numberOfUsers);

    this.room.users = [currentUser, ...simulatedUsers];

    // Iniciar atualizações automáticas
    this.startAutoUpdate();

    return this.room;
  }

  /**
   * Gerar usuários simulados
   */
  private generateSimulatedUsers(count: number): User[] {
    const users: User[] = [];
    const usedPositions = new Set<string>(['0-0']); // Posição do usuário atual
    const availableNames = [...STUDENT_NAMES];

    const statuses: UserStatus[] = ['FOCUS', 'SHORT_BREAK', 'LONG_BREAK', 'OFFLINE'];
    const statusWeights = [0.5, 0.3, 0.15, 0.05]; // 50% focando, 30% pausa curta, etc

    for (let i = 0; i < count && availableNames.length > 0; i++) {
      // Selecionar nome aleatório
      const nameIndex = Math.floor(Math.random() * availableNames.length);
      const username = availableNames.splice(nameIndex, 1)[0];

      // Selecionar status com peso
      const randomWeight = Math.random();
      let cumulativeWeight = 0;
      let status: UserStatus = 'FOCUS';
      
      for (let j = 0; j < statuses.length; j++) {
        cumulativeWeight += statusWeights[j];
        if (randomWeight <= cumulativeWeight) {
          status = statuses[j];
          break;
        }
      }

      // Encontrar posição disponível
      let position = { row: 0, col: 0 };
      let attempts = 0;
      do {
        position = {
          row: Math.floor(Math.random() * 5),
          col: Math.floor(Math.random() * 10)
        };
        attempts++;
      } while (usedPositions.has(`${position.row}-${position.col}`) && attempts < 100);

      usedPositions.add(`${position.row}-${position.col}`);

      users.push({
        id: `user-${i + 1}`,
        username,
        status,
        position,
        pomodorosCompleted: Math.floor(Math.random() * 8),
        joinedAt: new Date(Date.now() - Math.random() * 3600000), // Até 1h atrás
        lastActivity: new Date()
      });
    }

    return users;
  }

  /**
   * Atualizar status do usuário atual
   */
  updateCurrentUserStatus(newStatus: UserStatus): void {
    const currentUser = this.room.users.find(u => u.id === this.currentUserId);
    if (currentUser) {
      currentUser.status = newStatus;
      currentUser.lastActivity = new Date();
    }
  }

  /**
   * Incrementar pomodoros do usuário atual
   */
  incrementCurrentUserPomodoros(): void {
    const currentUser = this.room.users.find(u => u.id === this.currentUserId);
    if (currentUser) {
      currentUser.pomodorosCompleted++;
      currentUser.lastActivity = new Date();
    }
  }

  /**
   * Obter sala atual
   */
  getRoom(): StudyRoom {
    return this.room;
  }

  /**
   * Obter estatísticas da sala
   */
  getRoomStats(): RoomStats {
    const focusing = this.room.users.filter(u => u.status === 'FOCUS').length;
    const shortBreak = this.room.users.filter(u => u.status === 'SHORT_BREAK').length;
    const longBreak = this.room.users.filter(u => u.status === 'LONG_BREAK').length;
    const offline = this.room.users.filter(u => u.status === 'OFFLINE').length;

    return {
      totalUsers: this.room.users.length,
      focusing,
      shortBreak,
      longBreak,
      offline,
      availableSeats: this.room.capacity - this.room.users.length
    };
  }

  /**
   * Iniciar atualizações automáticas (simula usuários mudando de status)
   */
  private startAutoUpdate(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    this.updateInterval = setInterval(() => {
      // 20% de chance de algum usuário mudar de status
      if (Math.random() < 0.2) {
        const otherUsers = this.room.users.filter(u => u.id !== this.currentUserId);
        if (otherUsers.length > 0) {
          const randomUser = otherUsers[Math.floor(Math.random() * otherUsers.length)];
          const statuses: UserStatus[] = ['FOCUS', 'SHORT_BREAK', 'LONG_BREAK'];
          randomUser.status = statuses[Math.floor(Math.random() * statuses.length)];
          randomUser.lastActivity = new Date();
        }
      }

      // 5% de chance de alguém entrar ou sair
      if (Math.random() < 0.05) {
        if (Math.random() < 0.5 && this.room.users.length < this.room.capacity) {
          // Adicionar novo usuário
          const newUser = this.generateSimulatedUsers(1)[0];
          if (newUser) {
            this.room.users.push(newUser);
          }
        } else if (this.room.users.length > 5) {
          // Remover usuário aleatório (exceto o atual)
          const otherUsers = this.room.users.filter(u => u.id !== this.currentUserId);
          if (otherUsers.length > 0) {
            const userToRemove = otherUsers[Math.floor(Math.random() * otherUsers.length)];
            this.room.users = this.room.users.filter(u => u.id !== userToRemove.id);
          }
        }
      }
    }, 5000); // Atualizar a cada 5 segundos
  }

  /**
   * Parar atualizações automáticas
   */
  stopAutoUpdate(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  /**
   * Limpar serviço
   */
  cleanup(): void {
    this.stopAutoUpdate();
    this.room.users = [];
  }
}

// Singleton
const studyRoomService = new StudyRoomService();

export default studyRoomService;
