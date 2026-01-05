import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import User from './User';

/**
 * Interface dos atributos do UserProgress
 */
export interface UserProgressAttributes {
  id: string;
  userId: string;
  currentXP: number;
  level: number;
  totalXPEarned: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Date;
  xpHistory: { date: string; xp: number; source: string }[];
  createdAt?:  Date;
  updatedAt?:  Date;
}

/**
 * Interface para criação de UserProgress
 */
interface UserProgressCreationAttributes
  extends Optional<
    UserProgressAttributes,
    'id' | 'currentXP' | 'level' | 'totalXPEarned' | 'currentStreak' | 'longestStreak' | 'xpHistory'
  > {}

/**
 * Model de UserProgress
 */
export class UserProgress
  extends Model<UserProgressAttributes, UserProgressCreationAttributes>
  implements UserProgressAttributes
{
  public id!: string;
  public userId!: string;
  public currentXP!: number;
  public level!: number;
  public totalXPEarned!: number;
  public currentStreak!: number;
  public longestStreak!:  number;
  public lastActivityDate!: Date;
  public xpHistory!: { date: string; xp: number; source: string }[];

  public readonly createdAt!: Date;
  public readonly updatedAt! : Date;

  /**
   * Calcular XP necessário para próximo nível
   */
  public getXPToNextLevel(): number {
    return this.level * 100;
  }

  /**
   * Adicionar XP e calcular level up
   */
  public addXP(amount: number, source: string): boolean {
    this.currentXP += amount;
    this.totalXPEarned += amount;

    // Adicionar ao histórico
    const today = new Date().toISOString().split('T')[0];
    const existingEntry = this.xpHistory.find((entry) => entry.date === today);

    if (existingEntry) {
      existingEntry.xp += amount;
    } else {
      this.xpHistory.push({ date: today, xp: amount, source });
    }

    // Manter apenas últimos 90 dias de histórico
    if (this.xpHistory.length > 90) {
      this.xpHistory = this.xpHistory.slice(-90);
    }

    // Verificar level up
    const xpNeeded = this.getXPToNextLevel();
    let leveledUp = false;

    while (this.currentXP >= xpNeeded) {
      this.currentXP -= xpNeeded;
      this.level += 1;
      leveledUp = true;
    }

    return leveledUp;
  }

  /**
   * Atualizar streak
   */
  public updateStreak(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastActivity = new Date(this.lastActivityDate);
    lastActivity.setHours(0, 0, 0, 0);

    const diffDays = Math.floor(
      (today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) {
      // Mesma data, não fazer nada
      return;
    } else if (diffDays === 1) {
      // Dia consecutivo
      this.currentStreak += 1;
      if (this.currentStreak > this.longestStreak) {
        this.longestStreak = this.currentStreak;
      }
    } else {
      // Perdeu o streak
      this.currentStreak = 1;
    }

    this.lastActivityDate = today;
  }
}

/**
 * Inicialização do modelo
 */
UserProgress.init(
  {
    id: {
      type:  DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey:  true,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      field: 'user_id',
    },
    currentXP: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: {
          args: [0],
          msg: 'XP não pode ser negativo',
        },
      },
      field: 'current_xp',
    },
    level:  {
      type: DataTypes. INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: {
          args: [1],
          msg: 'Nível mínimo é 1',
        },
        max: {
          args: [100],
          msg: 'Nível máximo é 100',
        },
      },
    },
    totalXPEarned: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue:  0,
      validate: {
        min: {
          args: [0],
          msg:  'Total de XP não pode ser negativo',
        },
      },
      field: 'total_xp_earned',
    },
    currentStreak: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: {
          args: [0],
          msg: 'Streak não pode ser negativo',
        },
      },
      field: 'current_streak',
    },
    longestStreak: {
      type:  DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate:  {
        min: {
          args: [0],
          msg: 'Longest streak não pode ser negativo',
        },
      },
      field: 'longest_streak',
    },
    lastActivityDate:  {
      type: DataTypes. DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'last_activity_date',
    },
    xpHistory: {
      type:  DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
      field: 'xp_history',
    },
  },
  {
    sequelize,
    tableName: 'user_progress',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        name: 'user_progress_user_id_idx',
        fields: ['user_id'],
        unique: true,
      },
      {
        name: 'user_progress_level_idx',
        fields: ['level'],
      },
    ],
  }
);

/**
 * Relacionamentos
 */
UserProgress. belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

User.hasOne(UserProgress, {
  foreignKey: 'userId',
  as: 'progress',
});

export default UserProgress;