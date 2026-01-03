import { DataTypes, Model, Optional } from 'sequelize';
import bcrypt from 'bcryptjs';
import sequelize from '../config/database';
import { encrypt, decrypt } from '../config/encryption';
import { logger } from '../utils/logger';

// Interface de atributos do usuário
export interface UserAttributes {
  id: string;
  email: string;
  password: string;
  name: string;
  university?: string;
  graduationYear?: number;
  bio?: string;
  avatarUrl?: string;
  
  // Sistema de gamificação
  xp: number;
  level: number;
  badges: string[];
  
  // Preferências de estudo
  studyGoalHours?: number;
  preferredAI?: 'chatgpt' | 'claude' | 'gemini' | 'perplexity';
  studyDays?: number[];
  
  // Configurações
  emailVerified: boolean;
  isActive: boolean;
  tokenVersion: number;
  
  // Timestamps
  lastLoginAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface para criação (campos opcionais)
interface UserCreationAttributes extends Optional<UserAttributes, 
  'id' | 'xp' | 'level' | 'badges' | 'emailVerified' | 'isActive' | 'tokenVersion' | 
  'university' | 'graduationYear' | 'bio' | 'avatarUrl' | 'studyGoalHours' | 
  'preferredAI' | 'studyDays' | 'lastLoginAt' | 'createdAt' | 'updatedAt'
> {}

// Classe do modelo User
class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public email!: string;
  public password!: string;
  public name!: string;
  public university?: string;
  public graduationYear?: number;
  public bio?: string;
  public avatarUrl?: string;
  
  public xp!: number;
  public level!: number;
  public badges!: string[];
  
  public studyGoalHours?: number;
  public preferredAI?: 'chatgpt' | 'claude' | 'gemini' | 'perplexity';
  public studyDays?: number[];
  
  public emailVerified!: boolean;
  public isActive!: boolean;
  public tokenVersion!: number;
  
  public lastLoginAt?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  /**
   * Verifica se senha fornecida corresponde ao hash armazenado
   * @param password - Senha em texto plano
   * @returns true se senha correta
   */
  public async comparePassword(password: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, this.password);
    } catch (error) {
      logger.error('Erro ao comparar senha:', error);
      return false;
    }
  }

  /**
   * Adiciona XP ao usuário e recalcula nível
   * @param amount - Quantidade de XP a adicionar
   */
  public async addXP(amount: number): Promise<void> {
    this.xp += amount;
    this.level = this.calculateLevel(this.xp);
    await this.save();
    
    logger.info('XP adicionado', {
      userId: this.id,
      amount,
      newXP: this.xp,
      newLevel: this.level
    });
  }

  /**
   * Calcula nível baseado em XP total
   * Fórmula: Level = floor(sqrt(XP / 100))
   * @param xp - XP total
   * @returns Nível calculado
   */
  private calculateLevel(xp: number): number {
    return Math.floor(Math.sqrt(xp / 100));
  }

  /**
   * Adiciona badge ao usuário
   * @param badgeId - ID da badge
   */
  public async addBadge(badgeId: string): Promise<void> {
    if (!this.badges.includes(badgeId)) {
      this.badges = [...this.badges, badgeId];
      await this.save();
      
      logger.info('Badge adicionada', {
        userId: this.id,
        badgeId,
        totalBadges: this.badges.length
      });
    }
  }

  /**
   * Invalida todos os tokens do usuário (forçar logout)
   */
  public async invalidateTokens(): Promise<void> {
    this.tokenVersion += 1;
    await this.save();
    
    logger.info('Tokens invalidados', {
      userId: this.id,
      newTokenVersion: this.tokenVersion
    });
  }

  /**
   * Atualiza timestamp de último login
   */
  public async updateLastLogin(): Promise<void> {
    this.lastLoginAt = new Date();
    await this.save();
  }

  /**
   * Retorna dados públicos do usuário (sem senha)
   */
  public toPublicJSON(): Partial<UserAttributes> {
    const { password, tokenVersion, ...publicData } = this.toJSON();
    return publicData;
  }
}

// Definição do schema no banco
User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    university: {
      type: DataTypes.STRING(200),
      allowNull: true,
      get() {
        const rawValue = this.getDataValue('university');
        return rawValue ? decrypt(rawValue) : null;
      },
      set(value: string) {
        if (value) {
          this.setDataValue('university', encrypt(value));
        }
      }
    },
    graduationYear: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 2000,
        max: 2050
      }
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    avatarUrl: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    xp: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1
      }
    },
    badges: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: []
    },
    studyGoalHours: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 24
      }
    },
    preferredAI: {
      type: DataTypes.ENUM('chatgpt', 'claude', 'gemini', 'perplexity'),
      allowNull: true
    },
    studyDays: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      allowNull: true,
      validate: {
        isValidDays(value: number[]) {
          if (value && value.some(day => day < 0 || day > 6)) {
            throw new Error('Dias da semana devem ser entre 0 (domingo) e 6 (sábado)');
          }
        }
      }
    },
    emailVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    tokenVersion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'users',
    modelName: 'User',
    timestamps: true,
    underscored: true,
    
    // Hooks do Sequelize
    hooks: {
      // Antes de criar usuário, faz hash da senha
      beforeCreate: async (user: User) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(12);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      
      // Antes de atualizar, verifica se senha mudou e faz hash
      beforeUpdate: async (user: User) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(12);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      
      // Após criar, registra no log
      afterCreate: (user: User) => {
        logger.info('Novo usuário criado', {
          userId: user.id,
          email: user.email
        });
      },
      
      // Após atualizar, registra no log
      afterUpdate: (user: User) => {
        logger.info('Usuário atualizado', {
          userId: user.id,
          changedFields: user.changed()
        });
      }
    },
    
    // Índices para performance
    indexes: [
      {
        unique: true,
        fields: ['email']
      },
      {
        fields: ['xp']
      },
      {
        fields: ['level']
      },
      {
        fields: ['created_at']
      }
    ]
  }
);

export default User;
