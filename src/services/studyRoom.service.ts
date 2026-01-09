import { User, UserStatus, StudyRoom, RoomStats } from '@/types/studyRoom.types';
import { AvatarType, ClassYear, AVATAR_CATALOG, DEFAULT_AVATAR } from '@/types/avatar.types';

/**
 * Serviço MOCK para simular sistema multiplayer
 * Versão 2.0 - Com avatares customizáveis e posicionamento livre
 */

const STUDENT_NAMES = [
  'Ana Silva', 'Bruno Costa', 'Carlos Santos', 'Diana Lima',
  'Eduardo Souza', 'Fernanda Alves', 'Gabriel Rocha', 'Helena Martins',
  'Igor Pereira', 'Julia Ferreira', 'Lucas Oliveira', 'Maria Clara',
  'Nicolas Barros', 'Olivia Mendes', 'Pedro Henrique', 'Queila Dias',
  'Rafael Gomes', 'Sofia Carvalho', 'Thiago Ribeiro', 'Vitoria Pinto',
  'Wellington Castro', 'Xuxa Monteiro', 'Yasmin Teixeira', 'Zilda Nunes',
  'Alberto Ramos', 'Beatriz Lopes', 'Cesar Moura', 'Daniela Cunha',
  'Emerson Pires', 'Fabiana Luz'
];

// Posições predefinidas nas áreas da enfermaria
const AREA_POSITIONS = {
  triagem: [
    { x: 100, y: 180 }, { x: 150, y: 180 }, { x: 200, y: 180 }
  ],
  consultorio1: [
    { x: 450, y: 120 }, { x: 550, y: 150 }
  ],
  consultorio2: [
    { x: 850, y: 120 }, { x: 950, y: 150 }
  ],
  enfermaria: [
    { x: 100, y: 480 }, { x: 220, y: 480 },
    { x: 100, y: 580 }, { x: 220, y: 580 }
  ],
  medicacao: [
    { x: 450, y: 500 }, { x: 550, y: 500 }, { x: 500, y: 600 }
  ],
  procedimentos: [
    { x: 850, y: 500 }, { x: 950, y: 550 }
  ]
};

class StudyRoomService {
  private room: StudyRoom;
  private currentUserId: string = 'current-user';
  private updateInterval: NodeJS.Timeout | null = null;
  private usedPositions: Set<string> = new Set();

  constructor() {
    this.room = {
      id: 'main-room',
      name: 'Hospital Infirmary',
      capacity: 30,
      users: [],
      createdAt: new Date()
    };
  }

  /**
   * Inicializar sala com usuário atual e usuários simulados
   */
  async initialize(
    currentUserName: string, 
    currentStatus: UserStatus,
    currentUserAvatar = DEFAULT_AVATAR
  ): Promise<StudyRoom> {
    this.usedPositions.clear();

    // Adicionar usuário atual
    const currentUserPosition = { x: 100, y: 180 }; // Triagem
    this.usedPositions.add(`${currentUserPosition.x}-${currentUserPosition.y}`);

    const currentUser: User = {
      id: this.currentUserId,
      username: currentUserName,
      status: currentStatus,
      position: currentUserPosition,
      pomodorosCompleted: 0,
      joinedAt: new Date(),
      lastActivity: new Date(),
      avatar: currentUserAvatar
    };

    // Gerar usuários simulados (entre 8 e 15)
    const numberOfUsers = Math.floor(Math.random() * 8) + 8;
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
    const availableNames = [...STUDENT_NAMES];
    const allPositions = [
      ...AREA_POSITIONS.triagem,
      ...AREA_POSITIONS.consultorio1,
      ...AREA_POSITIONS.consultorio2,
      ...AREA_POSITIONS.enfermaria,
      ...AREA_POSITIONS.medicacao,
      ...AREA_POSITIONS.procedimentos
    ];

    const statuses: UserStatus[] = ['FOCUS', 'SHORT_BREAK', 'LONG_BREAK', 'OFFLINE'];
    const statusWeights = [0.5, 0.3, 0.15, 0.05];

    const avatarTypes: AvatarType[] = Object.keys(AVATAR_CATALOG) as AvatarType[];
    const classYears: ClassYear[] = ['TI', 'TII', 'TIII', 'TIV', 'TV', 'TVI'];

    for (let i = 0; i < count && availableNames.length > 0 && allPositions.length > 0; i++) {
      // Nome aleatório
      const nameIndex = Math.floor(Math.random() * availableNames.length);
      const username = availableNames.splice(nameIndex, 1)[0];

      // Status com peso
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

      // Posição disponível
      let position = { x: 0, y: 0 };
      let positionFound = false;
      let attempts = 0;

      while (!positionFound && attempts < 50) {
        const posIndex = Math.floor(Math.random() * allPositions.length);
        const testPos = allPositions[posIndex];
        const posKey = `${testPos.x}-${testPos.y}`;
        
        if (!this.usedPositions.has(posKey)) {
          position = testPos;
          this.usedPositions.add(posKey);
          positionFound = true;
        }
        attempts++;
      }

      // Avatar aleatório
      const randomAvatarType = avatarTypes[Math.floor(Math.random() * avatarTypes.length)];
      const randomClassYear = classYears[Math.floor(Math.random() * classYears.length)];

      // Gerar ID único de 3 dígitos
      const userId = String(Math.floor(Math.random() * 900) + 100);

      users.push({
        id: userId,
        username,
        status,
        position,
        pomodorosCompleted: Math.floor(Math.random() * 8),
        joinedAt: new Date(Date.now() - Math.random() * 3600000),
        lastActivity: new Date(),
        avatar: {
          avatarType: randomAvatarType,
          classYear: randomClassYear
        }
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
   * Atualizar avatar do usuário atual
   */
  updateCurrentUserAvatar(avatarType: AvatarType, classYear: ClassYear): void {
    const currentUser = this.room.users.find(u => u.id === this.currentUserId);
    if (currentUser) {
      currentUser.avatar = { avatarType, classYear };
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
   * Iniciar atualizações automáticas
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
            this.usedPositions.delete(`${userToRemove.position.x}-${userToRemove.position.y}`);
          }
        }
      }
    }, 5000);
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
    this.usedPositions.clear();
  }
}

// Singleton
const studyRoomService = new StudyRoomService();

export default studyRoomService;
